/**
 * Fills the inn with rooms, photographs, menus, guestbook entries and a
 * plausible diary of stay requests.
 *
 *   npm run db:seed            adds anything that is missing
 *   npm run db:seed -- --reset empties the tables first
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed-data";

async function main() {
  const reset = process.argv.includes("--reset");
  const db = await getDb();
  const schema = await readFile(path.join(process.cwd(), "lib", "db", "schema.sql"), "utf8");
  await db.exec(schema);
  await seedDatabase(db, { reset });
  const counts = await db.query<{
    rooms: number;
    photos: number;
    requests: number;
    menus: number;
    guestbook: number;
  }>(`select
        (select count(*)::int from rooms) as rooms,
        (select count(*)::int from room_photos) as photos,
        (select count(*)::int from stay_requests) as requests,
        (select count(*)::int from menus) as menus,
        (select count(*)::int from guestbook_entries) as guestbook`);
  console.log(`${reset ? "Reset and seeded" : "Seeded"} ${db.label}`);
  console.table(counts[0]);
  console.log(
    `\nInnkeeper sign-in: ${process.env.INNKEEPER_EMAIL ?? "margaret@larkspurhouse.co.uk"} / ${
      process.env.INNKEEPER_PASSWORD ?? "larkspur"
    }`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
