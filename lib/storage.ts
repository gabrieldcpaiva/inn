import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { mediaUrl, safeKey } from "@/lib/media";

export { mediaUrl };

/**
 * Where photographs live.
 *
 * Without configuration, uploads are written to var/uploads and served back
 * through /media/<key>. Point the S3_* variables at any S3-compatible bucket
 * (AWS S3, Cloudflare R2, MinIO, Backblaze) and uploads go to the cloud
 * instead, with signed URLs for private buckets.
 */

export type StorageDriver = "local" | "s3";

type S3Config = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicBaseUrl?: string;
  forcePathStyle: boolean;
};

function s3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    region: process.env.S3_REGION?.trim() || "us-east-1",
    accessKeyId,
    secretAccessKey,
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

export function storageDriver(): StorageDriver {
  return s3Config() ? "s3" : "local";
}

export function storageLabel(): string {
  const config = s3Config();
  if (!config) return "Local media folder · var/uploads";
  return `Cloud storage · ${config.bucket}`;
}

export const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? path.join("var", "uploads"));


export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const clean = safeKey(key);
  const config = s3Config();
  if (!config) {
    const file = path.join(UPLOAD_DIR, clean);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
    return;
  }
  const { url, headers } = s3Request(config, "PUT", clean, body, contentType);
  const response = await fetch(url, { method: "PUT", headers, body: new Uint8Array(body) });
  if (!response.ok) {
    throw new Error(`Storage rejected the upload (${response.status} ${response.statusText})`);
  }
}

export async function readLocalObject(key: string): Promise<Buffer | null> {
  try {
    return await readFile(path.join(UPLOAD_DIR, safeKey(key)));
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  const clean = safeKey(key);
  const config = s3Config();
  if (!config) {
    try {
      await unlink(path.join(UPLOAD_DIR, clean));
    } catch {
      // already gone
    }
    return;
  }
  const { url, headers } = s3Request(config, "DELETE", clean, Buffer.alloc(0), "");
  await fetch(url, { method: "DELETE", headers }).catch(() => undefined);
}

// ---------------------------------------------------------------------------
// A small, dependency-free AWS Signature V4 implementation — enough for PUT,
// DELETE and presigned GETs against S3-compatible object stores.
// ---------------------------------------------------------------------------

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function amzDate(now = new Date()): { long: string; short: string } {
  const long = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { long, short: long.slice(0, 8) };
}

function encodeKey(key: string): string {
  return key
    .split("/")
    .map((part) =>
      encodeURIComponent(part).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`),
    )
    .join("/");
}

function bucketHost(config: S3Config): { host: string; basePath: string } {
  const endpoint = config.endpoint ?? `https://s3.${config.region}.amazonaws.com`;
  const url = new URL(endpoint);
  if (config.endpoint && config.forcePathStyle) {
    return { host: url.host, basePath: `/${config.bucket}` };
  }
  if (config.endpoint) {
    // R2 and most S3-compatible services use virtual-hosted style by default.
    return { host: `${config.bucket}.${url.host}`, basePath: "" };
  }
  return { host: `${config.bucket}.s3.${config.region}.amazonaws.com`, basePath: "" };
}

function signingKey(config: S3Config, short: string): Buffer {
  return hmac(
    hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, short), config.region), "s3"),
    "aws4_request",
  );
}

function s3Request(
  config: S3Config,
  method: "PUT" | "DELETE",
  key: string,
  body: Buffer,
  contentType: string,
): { url: string; headers: Record<string, string> } {
  const { host, basePath } = bucketHost(config);
  const canonicalUri = `${basePath}/${encodeKey(key)}`;
  const { long, short } = amzDate();
  const payloadHash = sha256Hex(body);
  const headers: Record<string, string> = {
    host,
    "x-amz-date": long,
    "x-amz-content-sha256": payloadHash,
  };
  if (contentType) headers["content-type"] = contentType;
  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders
    .map((name) => `${name}:${headers[name].trim()}\n`)
    .join("");
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders.join(";"),
    payloadHash,
  ].join("\n");
  const scope = `${short}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    long,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signature = createHmac("sha256", signingKey(config, short))
    .update(stringToSign)
    .digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`;
  const scheme = config.endpoint ? new URL(config.endpoint).protocol : "https:";
  return {
    url: `${scheme}//${host}${canonicalUri}`,
    headers: { ...headers, Authorization: authorization },
  };
}

/** A time-limited GET URL, for buckets that are not public. */
export function presignedGet(key: string, expiresSeconds = 3600): string | null {
  const config = s3Config();
  if (!config || config.publicBaseUrl) return null;
  const clean = safeKey(key);
  const { host, basePath } = bucketHost(config);
  const { long, short } = amzDate();
  const scope = `${short}/${config.region}/s3/aws4_request`;
  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${scope}`,
    "X-Amz-Date": long,
    "X-Amz-Expires": String(expiresSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalQuery = [...params.entries()]
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .sort()
    .join("&");
  const canonicalUri = `${basePath}/${encodeKey(clean)}`;
  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", long, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(config, short))
    .update(stringToSign)
    .digest("hex");
  const scheme = config.endpoint ? new URL(config.endpoint).protocol : "https:";
  return `${scheme}//${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
