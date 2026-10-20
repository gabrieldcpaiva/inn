import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "./index";
import { seedDatabase } from "@/lib/seed-data";

const globalForBootstrap = globalThis as unknown as {
  __larkspurReady?: Promise<void>;
};

async function readSchema(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "lib", "db", "schema.sql"),
    path.join(process.cwd(), "..", "lib", "db", "schema.sql"),
  ];
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try the next location
    }
  }
  throw new Error("Could not find lib/db/schema.sql");
}

async function bootstrap(): Promise<void> {
  const db = await getDb();
  await db.exec(await readSchema());

  if (process.env.SEED_ON_BOOT === "false") return;

  const rows = await db.query<{ count: number }>(
    "select count(*)::int as count from rooms",
  );
  if ((rows[0]?.count ?? 0) === 0) {
    await seedDatabase(db, { reset: false });
    console.info("[larkspur] seeded a fresh database");
  }
}

/**
 * Makes sure the schema exists and, on a brand-new database, that the inn has
 * furniture in it. Safe to call on every request: the work happens once.
 */
export function ensureDatabase(): Promise<void> {
  if (!globalForBootstrap.__larkspurReady) {
    globalForBootstrap.__larkspurReady = bootstrap().catch((error) => {
      globalForBootstrap.__larkspurReady = undefined;
      throw error;
    });
  }
  return globalForBootstrap.__larkspurReady;
}
