"use client";

import { useActionState, useMemo, useState } from "react";
import { submitStayRequest } from "@/lib/actions/public";
import { Calendar, type DayStatus, type Selection } from "@/components/calendar/calendar";
import { FormMessage, NumberSelect, TextField } from "@/components/booking/fields";
import { Honeypot } from "@/components/ui/honeypot";
import { idleState } from "@/lib/validation";
import { formatShort, nightsBetween, type ISODate } from "@/lib/dates";
import { markFor, rangeHasHold, total } from "@/lib/booking";
import type { Marks } from "@/lib/booking";

type BookingPanelProps = {
  room: {
    id: number;
    name: string;
    capacity: number;
    nightlyRate: number;
  };
  marks: Marks;
  today: ISODate;
  initialCheckIn?: string;
  initialCheckOut?: string;
};

export function BookingPanel({ room, marks, today, initialCheckIn, initialCheckOut }: BookingPanelProps) {
  const [selection, setSelection] = useState<Selection>({
    checkIn: initialCheckIn ?? null,
    checkOut: initialCheckOut ?? null,
  });
  const [hint, setHint] = useState<string | null>(null);
  const [adults, setAdults] = useState(Math.min(2, room.capacity));
  const [children, setChildren] = useState(0);
  const [state, formAction, pending] = useActionState(submitStayRequest, idleState);

  const marksForRoom = useMemo(() => {
    const map: Record<ISODate, DayStatus> = {};
    for (const [iso, code] of Object.entries(marks[String(room.id)] ?? {})) {
      map[iso] = code === "c" ? "booked" : code === "b" ? "blocked" : "pending";
    }
    return map;
  }, [marks, room.id]);

  const getStatus = (iso: ISODate): DayStatus => marksForRoom[iso] ?? "free";

  function handleSelect(iso: ISODate) {
    setHint(null);
    const { checkIn, checkOut } = selection;
    if (!checkIn || checkOut) {
      setSelection({ checkIn: iso, checkOut: null });
      return;
    }
    if (iso <= checkIn) {
      setSelection({ checkIn: iso, checkOut: null });
      return;
    }
    if (nightsBetween(checkIn, iso) > 21) {
      setSelection({ checkIn: iso, checkOut: null });
      setHint("We keep stays to three weeks — for longer, please write to us directly.");
      return;
    }
    if (rangeHasHold(marks, room.id, checkIn, iso)) {
      setSelection({ checkIn: iso, checkOut: null });
      setHint("There’s a taken night in that span. We’ve started you again from the new date.");
      return;
    }
    setSelection({ checkIn, checkOut: iso });
  }

  const nights = selection.checkIn && selection.checkOut
    ? Math.max(0, nightsBetween(selection.checkIn, selection.checkOut))
    : 0;
  const price = selection.checkIn && selection.checkOut
    ? total(room.nightlyRate, selection.checkIn, selection.checkOut)
    : 0;
  const party = adults + children;
  const tooMany = party > room.capacity;
  const ready = Boolean(selection.checkIn && selection.checkOut) && !tooMany;

  return (
    <div id="request" className="card p-4 sm:p-5">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="display-sm">The book</h2>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Live availability
        </p>
      </div>

      <div className="pt-4">
        <Calendar
          today={today}
          getStatus={getStatus}
          selection={selection}
          onSelect={handleSelect}
          months={1}
          legend
          legendLabels={{ pending: "Asked for, not yet held" }}
        />
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {selection.checkIn && selection.checkOut ? (
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="label">Your nights</p>
              <p className="mt-1 font-display text-lg leading-tight">
                {formatShort(selection.checkIn)} → {formatShort(selection.checkOut)}
              </p>
              <p className="text-[11.5px] text-muted">
                {nights} {nights === 1 ? "night" : "nights"} · sleeps {room.capacity}
              </p>
            </div>
            <p className="text-right">
              <span className="block font-display text-xl leading-none">£{price}</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">in total</span>
            </p>
          </div>
        ) : (
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            {selection.checkIn
              ? `First night ${formatShort(selection.checkIn)}. Now choose your last night.`
              : "Choose your first and last night on the calendar. Nothing is charged; this is a request."}
          </p>
        )}
        {hint ? <p className="mt-2 text-[11.5px] text-clay">{hint}</p> : null}
      </div>

      <form action={formAction} className="mt-4 space-y-3 border-t border-line pt-4">
        <Honeypot />
        <input type="hidden" name="roomId" value={room.id} />
        <input type="hidden" name="checkIn" value={selection.checkIn ?? ""} />
        <input type="hidden" name="checkOut" value={selection.checkOut ?? ""} />

        <div className="grid grid-cols-2 gap-3">
          <NumberSelect
            label="Adults"
            name="adults"
            min={1}
            max={room.capacity}
            value={adults}
            onChange={setAdults}
            suffix="adults"
          />
          <NumberSelect
            label="Children"
            name="children"
            min={0}
            max={Math.max(0, room.capacity - 1)}
            value={children}
            onChange={setChildren}
            suffix="children"
          />
        </div>
        {tooMany ? (
          <p className="text-[11.5px] text-clay">
            This room sleeps {room.capacity}. For {party}, look at the Hollow Oak or write to us.
          </p>
        ) : null}

        <TextField
          label="Your name"
          name="guestName"
          required
          autoComplete="name"
          error={state.errors?.guestName}
        />
        <TextField
          label="Email"
          name="guestEmail"
          type="email"
          required
          autoComplete="email"
          error={state.errors?.guestEmail}
          hint="We reply by hand, usually the same day."
        />
        <TextField
          label="Telephone (optional)"
          name="guestPhone"
          type="tel"
          autoComplete="tel"
        />
        <label className="block">
          <span className="field-label">Anything we should know?</span>
          <textarea
            name="message"
            rows={3}
            className="field resize-y"
            placeholder="Arrival time, dietary needs, a dog, a birthday…"
          />
        </label>

        <FormMessage status={state.status} message={state.message} />
        {!selection.checkIn || !selection.checkOut ? (
          <p className="text-[11px] text-muted">Choose your dates above to send a request.</p>
        ) : null}

        <button type="submit" disabled={!ready || pending} className="btn btn-primary w-full">
          {pending ? "Sending…" : "Send a stay request"}
        </button>
        <p className="text-center text-[10.5px] leading-relaxed text-muted">
          No card, no deposit, no payment. We’ll confirm by email.
        </p>
      </form>
    </div>
  );
}
