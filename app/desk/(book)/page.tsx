import type { Metadata } from "next";
import Link from "next/link";
import { getInnkeeper } from "@/lib/auth";
import { getDeskSummary, getRequests, getGuestbookEntries } from "@/lib/queries";
import { RequestCard } from "@/components/desk/request-card";
import { StatusPill } from "@/components/ui/status-pill";
import { ApproveNote } from "@/components/desk/approve-note";
import { formatMoney, formatShort, nightsBetween, todayISO, INN_TIME_ZONE } from "@/lib/dates";

export const metadata: Metadata = { title: "The book" };

export default async function DeskOverviewPage() {
  const [innkeeper, summary, pending, guestbookPending] = await Promise.all([
    getInnkeeper(),
    getDeskSummary(),
    getRequests({ status: "pending", limit: 4 }),
    getGuestbookEntries("pending", 3),
  ]);

  const today = todayISO();
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: INN_TIME_ZONE }).format(new Date()),
  );
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = innkeeper?.name.split(" ")[0] ?? "innkeeper";
  const { month } = summary;
  const occupancyPercent = Math.round(month.totals.occupancyRate * 100);

  return (
    <div className="mx-auto max-w-[1180px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The book · {formatShort(today)}</p>
          <h1 className="display-lg mt-2">{greeting}, {firstName}.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {summary.pendingRequests > 0
              ? `${summary.pendingRequests} ${summary.pendingRequests === 1 ? "request is" : "requests are"} waiting for an answer`
              : "Everything in the post has been answered"}
            {summary.arrivals.length > 0
              ? `, and ${summary.arrivals.length} ${summary.arrivals.length === 1 ? "party arrives" : "parties arrive"} today.`
              : ", and nobody is arriving today."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/desk/requests" className="btn btn-primary btn-sm">
            Open the post
          </Link>
          <Link href="/desk/calendar" className="btn btn-ghost btn-sm">
            The month
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Waiting for an answer" value={String(summary.pendingRequests)} note="Requests in the post" href="/desk/requests" accent />
        <Stat label="Arriving today" value={String(summary.arrivals.length)} note={summary.arrivals[0]?.guestName ?? "No arrivals"} href="/desk/calendar" />
        <Stat label="Leaving today" value={String(summary.departures.length)} note={summary.departures[0]?.guestName ?? "No departures"} href="/desk/calendar" />
        <Stat
          label={`${monthName(month.month)} so far`}
          value={`${occupancyPercent}%`}
          note={`${month.totals.confirmedNights} of ${month.totals.availableNights} room-nights · ${formatMoney(month.totals.revenue)} expected`}
          href="/desk/calendar"
          progress={month.totals.occupancyRate}
        />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-12">
        <section className="xl:col-span-7">
          <div className="flex items-baseline justify-between border-b border-ink pb-2">
            <h2 className="display-sm">The post</h2>
            <Link href="/desk/requests" className="text-[10px] uppercase tracking-[0.14em] text-muted hover:text-ink">
              All requests →
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="mt-4 border border-line bg-parchment p-5 text-sm text-ink-soft">
              The post tray is empty. Anything new will appear here — and we’ll keep it until you
              answer it.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.map((request) => (
                <RequestCard key={request.id} request={request} compact />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6 xl:col-span-5">
          <section className="border border-line bg-parchment p-4">
            <div className="flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="display-sm">Today</h2>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{formatShort(today)}</span>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted">Arriving</p>
                {summary.arrivals.length === 0 ? (
                  <p className="mt-1 text-[12.5px] text-muted">Nobody today.</p>
                ) : (
                  summary.arrivals.map((stay) => (
                    <p key={stay.id} className="mt-1 text-[12.5px]">
                      <span className="font-medium">{stay.guestName}</span> · {stay.roomName} ·{" "}
                      {stay.adults + stay.children} guests
                    </p>
                  ))
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted">Leaving</p>
                {summary.departures.length === 0 ? (
                  <p className="mt-1 text-[12.5px] text-muted">Nobody today.</p>
                ) : (
                  summary.departures.map((stay) => (
                    <p key={stay.id} className="mt-1 text-[12.5px]">
                      <span className="font-medium">{stay.guestName}</span> · {stay.roomName}
                    </p>
                  ))
                )}
              </div>
              <div className="border-t border-line pt-2 text-[11px] leading-relaxed text-muted">
                Supper at 7pm. Check the arrivals board before five and ring the butcher if the
                numbers change.
              </div>
            </div>
          </section>

          <section className="border border-line bg-parchment p-4">
            <div className="flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="display-sm">The guestbook</h2>
              <Link href="/desk/guestbook" className="text-[10px] uppercase tracking-[0.14em] text-muted hover:text-ink">
                Moderate →
              </Link>
            </div>
            {guestbookPending.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-muted">No notes waiting to be read.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {guestbookPending.map((entry) => (
                  <li key={entry.id} className="border-b border-line-soft pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[12.5px] font-medium">{entry.guestName}</p>
                      <StatusPill status="pending" label="Waiting" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
                      “{entry.message}”
                    </p>
                    <ApproveNote entryId={entry.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-ink pb-2">
          <h2 className="display-sm">Coming up</h2>
          <Link href="/desk/calendar" className="text-[10px] uppercase tracking-[0.14em] text-muted hover:text-ink">
            Open the calendar →
          </Link>
        </div>
        {summary.upcoming.length === 0 ? (
          <p className="mt-4 border border-line bg-parchment p-5 text-sm text-ink-soft">
            Nothing confirmed in the next ten days. The phone has been quiet — enjoy it.
          </p>
        ) : (
          <div className="table-wrap mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Arrives</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Nights</th>
                  <th>Party</th>
                  <th className="text-right">Reference</th>
                </tr>
              </thead>
              <tbody>
                {summary.upcoming.map((stay) => (
                  <tr key={stay.id}>
                    <td className="whitespace-nowrap">
                      {stay.checkIn === today ? (
                        <span className="font-medium text-clay">Today</span>
                      ) : (
                        formatShort(stay.checkIn)
                      )}
                    </td>
                    <td>{stay.guestName}</td>
                    <td>{stay.roomName}</td>
                    <td className="whitespace-nowrap text-muted">{nightsBetween(stay.checkIn, stay.checkOut)} nights</td>
                    <td>{stay.adults + stay.children}</td>
                    <td className="text-right font-mono text-[11px] text-muted">{stay.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  href,
  accent = false,
  progress,
}: {
  label: string;
  value: string;
  note: string;
  href: string;
  accent?: boolean;
  progress?: number;
}) {
  return (
    <Link
      href={href}
      className={`group block border p-4 transition-colors ${
        accent ? "border-clay/40 bg-clay-pale/30 hover:border-clay" : "border-line bg-parchment hover:border-moss/50"
      }`}
    >
      <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none">{value}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">{note}</p>
      {progress !== undefined ? (
        <span className="mt-3 block h-1 w-full bg-line-soft">
          <span
            className="block h-1 bg-moss transition-all"
            style={{ width: `${Math.min(100, Math.max(2, Math.round(progress * 100)))}%` }}
          />
        </span>
      ) : null}
    </Link>
  );
}

function monthName(month: number): string {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1];
}
