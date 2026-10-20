import { StatusPill } from "@/components/ui/status-pill";
import { RequestDecision, ReopenRequest } from "@/components/desk/request-decision";
import { formatMoney, formatStay, nightsBetween } from "@/lib/dates";
import type { StayRequest } from "@/lib/types";
import { clsx } from "@/lib/clsx";

export function RequestCard({
  request,
  compact = false,
}: {
  request: StayRequest;
  compact?: boolean;
}) {
  const nights = nightsBetween(request.checkIn, request.checkOut);
  const party = `${request.adults} ${request.adults === 1 ? "adult" : "adults"}${
    request.children > 0
      ? `, ${request.children} ${request.children === 1 ? "child" : "children"}`
      : ""
  }`;

  return (
    <article
      id={`request-${request.id}`}
      className={clsx(
        "scroll-mt-28 border border-line bg-parchment",
        compact ? "p-3.5" : "p-4 sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl leading-tight">{request.guestName}</h3>
          <p className="mt-1 text-[10.5px] uppercase tracking-[0.14em] text-muted">
            {request.reference} · {request.roomName}
          </p>
        </div>
        <StatusPill status={request.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-line-soft py-2.5 text-[12.5px]">
        <div>
          <dt className="text-[9px] uppercase tracking-[0.16em] text-muted">Nights</dt>
          <dd className="mt-0.5 font-medium">{formatStay(request.checkIn, request.checkOut)}</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.16em] text-muted">Party</dt>
          <dd className="mt-0.5">{party}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[9px] uppercase tracking-[0.16em] text-muted">At the desk</dt>
          <dd className="mt-0.5 text-ink-soft">
            {nights} × {formatMoney(request.nightlyRate)} = {formatMoney(nights * request.nightlyRate)}
            <span className="text-muted"> · nothing charged yet</span>
          </dd>
        </div>
      </dl>

      {request.message ? (
        <blockquote className="mt-3 border-l-2 border-line pl-3 text-[12.5px] leading-relaxed text-ink-soft">
          {request.message}
        </blockquote>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <a href={`mailto:${request.guestEmail}`} className="underline underline-offset-4 hover:text-ink">
          {request.guestEmail}
        </a>
        {request.guestPhone ? (
          <a href={`tel:${request.guestPhone}`} className="hover:text-ink">
            {request.guestPhone}
          </a>
        ) : null}
        <span className="ml-auto">
          Asked{" "}
          {new Date(request.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {!compact ? (
        <div className="mt-4 border-t border-line pt-3">
          {request.status === "pending" ? (
            <RequestDecision
              requestId={request.id}
              existingNote={request.note}
              status={request.status}
            />
          ) : (
            <div className="space-y-3">
              {request.note ? (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted">Your note</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">“{request.note}”</p>
                </div>
              ) : (
                <p className="text-[11.5px] text-muted">
                  No note was left.{" "}
                  <a href={`mailto:${request.guestEmail}`} className="underline underline-offset-4">
                    Write to the guest
                  </a>
                  .
                </p>
              )}
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  {request.status === "confirmed" ? "Confirmed" : "Declined"}
                </p>
                <ReopenRequest requestId={request.id} />
              </div>
              <details className="group border border-line bg-paper/60 px-3 py-2">
                <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.14em] text-ink-soft group-open:mb-2">
                  Amend the note
                </summary>
                <RequestDecision
                  requestId={request.id}
                  existingNote={request.note}
                  status={request.status}
                />
              </details>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
