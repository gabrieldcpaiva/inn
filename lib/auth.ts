import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureDatabase } from "@/lib/db/bootstrap";
import { queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";

const COOKIE_NAME = "larkspur_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type Innkeeper = {
  id: number;
  email: string;
  name: string;
};

type SessionPayload = {
  sub: number;
  email: string;
  exp: number;
};

function secret(): string {
  return (
    process.env.AUTH_SECRET ??
    "larkspur-house-development-secret-please-set-AUTH_SECRET-in-production"
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.sub || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<Innkeeper | null> {
  await ensureDatabase();
  const row = await queryOne<{
    id: number;
    email: string;
    name: string;
    password_hash: string;
  }>("select id, email, name, password_hash from innkeepers where email = $1", [
    email.trim().toLowerCase(),
  ]);
  if (!row) {
    // Spend roughly the same time as a real check so the form doesn't leak
    // whether an address is known.
    verifyPassword(password, "scrypt$00$00");
    return null;
  }
  if (!verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export async function startSession(innkeeper: Innkeeper): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, encode({
    sub: innkeeper.id,
    email: innkeeper.email,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getInnkeeper(): Promise<Innkeeper | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = decode(token);
  if (!payload) return null;
  await ensureDatabase();
  const row = await queryOne<{ id: number; email: string; name: string }>(
    "select id, email, name from innkeepers where id = $1",
    [payload.sub],
  );
  return row ?? null;
}

export async function requireInnkeeper(): Promise<Innkeeper> {
  const innkeeper = await getInnkeeper();
  if (!innkeeper) redirect("/desk/sign-in");
  return innkeeper;
}

export const demoCredentials = {
  email: process.env.INNKEEPER_EMAIL ?? "margaret@larkspurhouse.co.uk",
  password: process.env.INNKEEPER_PASSWORD ?? "larkspur",
  visible: process.env.SHOW_DEMO_LOGIN !== "false",
};
