/**
 * Applies lib/db/schema.sql to the configured database.
 * Safe to run repeatedly — every statement is idempotent.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db";

async function main() {
  const db = await getDb();
  const schema = await readFile(path.join(process.cwd(), "lib", "db", "schema.sql"), "utf8");
  await db.exec(schema);
  const rooms = await db.query<{ count: number }>("select count(*)::int as count from rooms");
  console.log(`Schema applied to ${db.label}`);
  console.log(`Rooms in the book: ${rooms[0]?.count ?? 0}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
