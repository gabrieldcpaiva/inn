import type { Metadata } from "next";
import Link from "next/link";
import { getDeskMonth, getBlockedRanges, getRooms } from "@/lib/queries";
import { DeskMonthGrid } from "@/components/desk/month-grid";
import { BlockDatesForm } from "@/components/desk/block-form";
import { unblockDates } from "@/lib/actions/desk";
import { addDays, addMonths, formatMoney, formatShort, todayISO, type ISODate } from "@/lib/dates";
import { clsx } from "@/lib/clsx";

export const metadata: Metadata = { title: "Calendar" };

export default async function DeskCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; room?: string; date?: string }>;
}) {
  const query = await searchParams;
  const today = todayISO();
  const parsedYear = Number(query.year);
  const parsedMonth = Number(query.month);
  const year = Number.isInteger(parsedYear) && parsedYear > 2000 ? parsedYear : Number(today.slice(0, 4));
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : Number(today.slice(5, 7));

  const [desk, blocks, rooms] = await Promise.all([
    getDeskMonth(year, month),
    getBlockedRanges(),
    getRooms({ includeUnlisted: true }),
  ]);

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const prev = addMonths(monthStart, -1);
  const next = addMonths(monthStart, 1);
  const defaultRoom = rooms.find((room) => room.slug === query.room);
  const defaultStart = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) ? query.date : undefined;
  const defaultEnd = defaultStart ? addDays(defaultStart, 1) : undefined;

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The diary</p>
          <h1 className="display-lg mt-2">
            {monthName(month)} {year}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {desk.totals.confirmedNights} room-nights let · {desk.totals.blockedNights} closed ·{" "}
            {formatMoney(desk.totals.revenue)} expected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/desk/calendar?year=${prev.slice(0, 4)}&month=${Number(prev.slice(5, 7))}`} className="btn btn-ghost btn-sm">
            ← {shortMonth(Number(prev.slice(5, 7)))}
          </Link>
          <Link href="/desk/calendar" className="btn btn-ghost btn-sm">
            Today
          </Link>
          <Link href={`/desk/calendar?year=${next.slice(0, 4)}&month=${Number(next.slice(5, 7))}`} className="btn btn-ghost btn-sm">
            {shortMonth(Number(next.slice(5, 7)))} →
          </Link>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 bg-moss" /> A confirmed stay
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 border border-gold bg-[#f6ecd6]" /> A request awaiting an answer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 bg-clay-pale text-center text-[8px] leading-3 text-clay">✕</span>{" "}
          Closed by you
        </span>
        <span className="ml-auto text-[10px]">Click any day to close it, or open the stay.</span>
      </div>

      <div className="mt-3">
        <DeskMonthGrid year={year} month={month} rooms={desk.rooms} occupancy={desk.occupancy} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="border border-line bg-parchment p-4">
            <h2 className="display-sm">Close dates</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Block a room for maintenance, a family wedding, or simply because you want the
              house to yourself. Closed dates still appear as free to nobody — they are held
              back from the public calendar.
            </p>
            <div className="mt-4">
              <BlockDatesForm
                rooms={rooms.map((room) => ({ id: room.id, name: room.name }))}
                defaultRoomId={defaultRoom?.id}
                defaultStart={defaultStart}
                defaultEnd={defaultEnd}
              />
            </div>
          </div>
        </section>

        <section className="lg:col-span-7" id="closed-dates">
          <div className="flex items-baseline justify-between border-b border-ink pb-2">
            <h2 className="display-sm">Closed dates</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </span>
          </div>
          {blocks.length === 0 ? (
            <p className="mt-4 border border-line bg-parchment p-5 text-sm text-ink-soft">
              Every room is open. Nothing is closed in the book.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line-soft">
              {blocks.map((block) => (
                <li key={block.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-[12.5px] font-medium">
                      {block.roomName} ·{" "}
                      <span className="text-ink-soft">
                        {formatShort(block.startDate)} → {formatShort(block.endDate)}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted">{block.reason || "No reason given"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {block.startDate < today ? (
                      <span className="text-[9.5px] uppercase tracking-[0.12em] text-muted">past</span>
                    ) : null}
                    <form action={unblockDates}>
                      <input type="hidden" name="blockId" value={block.id} />
                      <button
                        type="submit"
                        className="text-[10px] uppercase tracking-[0.14em] text-clay underline underline-offset-4 hover:text-ink"
                      >
                        Reopen
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <Metric label="Room-nights let" value={String(desk.totals.confirmedNights)} />
            <Metric label="Closed" value={String(desk.totals.blockedNights)} />
            <Metric
              label="Letting rate"
              value={`${Math.round(desk.totals.occupancyRate * 100)}%`}
              bar={desk.totals.occupancyRate}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, bar }: { label: string; value: string; bar?: number }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
      {bar !== undefined ? (
        <span className="mt-1 block h-1 w-full bg-line-soft">
          <span
            className={clsx("block h-1 bg-moss")}
            style={{ width: `${Math.min(100, Math.max(2, Math.round(bar * 100)))}%` }}
          />
        </span>
      ) : null}
    </div>
  );
}

function monthName(month: number): string {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1];
}
function shortMonth(month: number): string {
  return monthName(month).slice(0, 3);
}
