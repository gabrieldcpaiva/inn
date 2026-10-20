import { readLocalObject, presignedGet, storageDriver } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const path = key.join("/");

  // With a private bucket, hand the browser a short-lived signed URL.
  if (storageDriver() === "s3") {
    const signed = presignedGet(path);
    if (signed) return Response.redirect(signed, 302);
  }

  const file = await readLocalObject(path);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  const extension = path.split(".").pop()?.toLowerCase() ?? "jpg";
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": TYPES[extension] ?? "application/octet-stream",
      "Content-Length": String(file.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
