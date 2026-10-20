import Link from "next/link";
import { getRooms } from "@/lib/queries";
import { getOccupancy } from "@/lib/availability";
import { addDays, formatDayMonth, parseISO, todayISO, WEEKDAYS } from "@/lib/dates";

/**
 * A fortnight at a glance: how many of the six rooms are free on each night.
 * It is the same reservations book, just seen from the lane.
 */
export async function AvailabilityGlance() {
  const today = todayISO();
  const rooms = await getRooms();
  const days = 14;
  const end = addDays(today, days + 1);
  const occupancy = await getOccupancy(today, end);

  const taken: Record<string, Set<number>> = {};
  for (const entry of occupancy) {
    if (entry.kind === "pending") continue;
    let cursor = entry.from;
    while (cursor < entry.to) {
      if (cursor >= today && cursor < end) {
        taken[cursor] ??= new Set();
        taken[cursor].add(entry.roomId);
      }
      cursor = addDays(cursor, 1);
    }
  }

  return (
    <section className="border-y border-line bg-paper-deep/40">
      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label">The book, this fortnight</p>
            <p className="mt-1.5 font-display text-xl">
              {rooms.length} rooms · {Object.values(taken).reduce((sum, set) => sum + set.size, 0)} nights already taken
            </p>
          </div>
          <Link href="/stay" className="link-arrow">
            Open the calendar
          </Link>
        </div>
        <ol className="mt-5 grid grid-cols-7 gap-1.5 sm:grid-cols-14">
          {Array.from({ length: days }, (_, index) => {
            const iso = addDays(today, index);
            const busy = taken[iso]?.size ?? 0;
            const free = Math.max(0, rooms.length - busy);
            const proportion = rooms.length === 0 ? 0 : free / rooms.length;
            const weekday = parseISO(iso);
            const weekdayIndex = (new Date(Date.UTC(weekday.year, weekday.month - 1, weekday.day)).getUTCDay() + 6) % 7;
            return (
              <li key={iso}>
                <Link
                  href={`/stay?checkIn=${iso}`}
                  className="group block border border-line bg-parchment px-1 pb-2 pt-1.5 transition-colors hover:border-moss"
                  title={`${free} of ${rooms.length} rooms free on ${formatDayMonth(iso)}`}
                >
                  <span className="block text-center text-[8.5px] uppercase tracking-[0.1em] text-muted">
                    {WEEKDAYS[weekdayIndex]}
                  </span>
                  <span className="mt-0.5 block text-center font-display text-base leading-none">
                    {parseISO(iso).day}
                  </span>
                  <span className="mt-1.5 flex h-8 w-full items-end bg-sage-pale/70">
                    <span
                      className="block w-full bg-moss transition-all group-hover:bg-clay"
                      style={{ height: `${Math.max(8, proportion * 100)}%` }}
                    />
                  </span>
                  <span className="mt-1 block text-center text-[8.5px] text-muted">
                    {free}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[10px] text-muted">
          The numeral is the number of rooms still free that night. Everything else is held or closed.
        </p>
      </div>
    </section>
  );
}
