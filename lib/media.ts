export function safeKey(key: string): string {
  const clean = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (clean.includes("..") || clean.length === 0) throw new Error("Invalid storage key");
  return clean;
}

/**
 * The URL to put in an <img src>. Seeded photographs live in public/seed;
 * uploaded ones are served through /media or straight from the bucket.
 * Kept free of Node imports so it can be used in client components too.
 */
export function mediaUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("seed/")) return `/seed/${key.slice("seed/".length)}`;
  if (/^https?:\/\//.test(key)) return key;
  const base = process.env.S3_PUBLIC_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, "")}/${encodeURIComponent(safeKey(key))}`;
  return `/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}
