"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { submitStayRequest } from "@/lib/actions/public";
import { Calendar, type DayStatus, type Selection } from "@/components/calendar/calendar";
import { FormMessage, NumberSelect, TextField } from "@/components/booking/fields";
import { Honeypot } from "@/components/ui/honeypot";
import { idleState } from "@/lib/validation";
import { formatShort, nightsBetween, type ISODate } from "@/lib/dates";
import {
  houseDayStatus,
  rangeHasHold,
  roomIsFree,
  total,
  type BookableRoom,
  type Marks,
} from "@/lib/booking";
import { clsx } from "@/lib/clsx";
import { mediaUrl } from "@/lib/media";

type StayPlannerProps = {
  rooms: BookableRoom[];
  marks: Marks;
  today: ISODate;
  initialCheckIn?: string;
  initialCheckOut?: string;
};

export function StayPlanner({ rooms, marks, today, initialCheckIn, initialCheckOut }: StayPlannerProps) {
  const [selection, setSelection] = useState<Selection>({
    checkIn: initialCheckIn && /^\d{4}-\d{2}-\d{2}$/.test(initialCheckIn) ? initialCheckIn : null,
    checkOut: initialCheckOut && /^\d{4}-\d{2}-\d{2}$/.test(initialCheckOut) ? initialCheckOut : null,
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [chosenRoomId, setChosenRoomId] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(submitStayRequest, idleState);

  const maxCapacity = Math.max(...rooms.map((room) => room.capacity), 1);
  const party = adults + children;
  const datesChosen = Boolean(selection.checkIn && selection.checkOut);
  const nights = datesChosen ? nightsBetween(selection.checkIn!, selection.checkOut!) : 0;

  const getStatus = (iso: ISODate): DayStatus => houseDayStatus(marks, rooms, iso);

  const options = useMemo(() => {
    return rooms.map((room) => {
      const bigEnough = room.capacity >= party;
      const free = datesChosen && bigEnough
        ? roomIsFree(marks, room.id, selection.checkIn!, selection.checkOut!)
        : false;
      return { room, bigEnough, free };
    });
  }, [rooms, marks, party, datesChosen, selection.checkIn, selection.checkOut]);

  const firstAvailable = options.find((option) => option.free)?.room.id ?? null;
  const selected = options.find((option) => option.room.id === chosenRoomId && option.free)?.room
    ?? options.find((option) => option.room.id === firstAvailable)?.room
    ?? null;

  const selectedTotal = selected && datesChosen
    ? total(selected.nightlyRate, selection.checkIn!, selection.checkOut!)
    : 0;

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
    // The house calendar is useful for a range even if one room is taken, so
    // only gently warn when part of the house is closed.
    const anyFree = rooms.some((room) => !rangeHasHold(marks, room.id, checkIn, iso));
    if (!anyFree) {
      setSelection({ checkIn: iso, checkOut: null });
      setHint("Every room is held across that span. We’ve started you again from the new date.");
      return;
    }
    setSelection({ checkIn, checkOut: iso });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="border border-line bg-parchment p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="display-sm">The whole house</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              All {rooms.length} rooms · live
            </p>
          </div>
          <Calendar
            today={today}
            getStatus={getStatus}
            selection={selection}
            onSelect={handleSelect}
            months={2}
            legend
            legendLabels={{ pending: "Only asked-for rooms left" }}
          />
          {hint ? <p className="mt-3 text-[11.5px] text-clay">{hint}</p> : null}
          <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
            This is the house as a whole: a day is marked taken when no room is free. Choose your
            nights, then pick the room that suits you on the right.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="label">Step one</p>
            <p className="mt-1.5 text-sm text-ink-soft">Choose your first and last night.</p>
          </div>
          <div>
            <p className="label">Step two</p>
            <p className="mt-1.5 text-sm text-ink-soft">Tell us who is coming, and pick a room.</p>
          </div>
          <div>
            <p className="label">Step three</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              Send the request. We confirm it by hand, and take no payment.
            </p>
          </div>
        </div>
      </div>

      <aside className="lg:col-span-5">
        <div>
          <div className="card p-4 sm:p-5">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="display-sm">Your request</h2>
              {datesChosen ? (
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {nights} {nights === 1 ? "night" : "nights"}
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberSelect
                label="Adults"
                name="adults"
                min={1}
                max={maxCapacity}
                value={adults}
                onChange={setAdults}
              />
              <NumberSelect
                label="Children"
                name="children"
                min={0}
                max={Math.max(0, maxCapacity - 1)}
                value={children}
                onChange={setChildren}
              />
            </div>

            {!datesChosen ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="font-display text-lg">Pick your nights to begin.</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                  The calendar on the left shows the whole house. Nothing is charged at any
                  point — we’ll write back to confirm.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="border border-line bg-paper-deep/40 p-3">
                    <p className="label">Arrive</p>
                    <p className="mt-1 font-display text-lg">From 3pm</p>
                  </div>
                  <div className="border border-line bg-paper-deep/40 p-3">
                    <p className="label">Supper</p>
                    <p className="mt-1 font-display text-lg">7pm</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-baseline justify-between border-y border-line py-3">
                  <div>
                    <p className="label">Your nights</p>
                    <p className="mt-1 font-display text-lg leading-tight">
                      {formatShort(selection.checkIn!)} → {formatShort(selection.checkOut!)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelection({ checkIn: null, checkOut: null })}
                    className="text-[10px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-ink"
                  >
                    Change
                  </button>
                </div>

                <div className="mt-4">
                  <p className="field-label">Choose a room</p>
                  <ul className="mt-1 space-y-1.5">
                    {options.map(({ room, bigEnough, free }) => {
                      const isSelected = selected?.id === room.id;
                      const disabled = !free;
                      return (
                        <li key={room.id}>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setChosenRoomId(room.id)}
                            aria-pressed={isSelected}
                            className={clsx(
                              "flex w-full items-center gap-3 border p-1.5 text-left transition-colors",
                              isSelected
                                ? "border-moss bg-sage-pale/40"
                                : "border-line bg-parchment hover:border-moss/60",
                              disabled && "cursor-not-allowed opacity-45 hover:border-line",
                            )}
                          >
                            <span className="relative h-11 w-14 shrink-0 overflow-hidden bg-paper-deep">
                              {room.photo ? (
                                <Image
                                  src={mediaUrl(room.photo.key)}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-[0.98rem] leading-tight">
                                {room.name}
                              </span>
                              <span className="block text-[10.5px] text-muted">
                                {bigEnough
                                  ? free
                                    ? `Sleeps ${room.capacity} · £${total(room.nightlyRate, selection.checkIn!, selection.checkOut!)}`
                                    : "Taken for these nights"
                                  : `Sleeps ${room.capacity} — too small`}
                              </span>
                            </span>
                            <span
                              className={clsx(
                                "mr-1 h-2.5 w-2.5 shrink-0 rounded-full border",
                                isSelected ? "border-moss bg-moss" : "border-line",
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <form action={formAction} className="mt-4 space-y-3 border-t border-line pt-4">
                  <Honeypot />
                  <input type="hidden" name="roomId" value={selected?.id ?? ""} />
                  <input type="hidden" name="checkIn" value={selection.checkIn ?? ""} />
                  <input type="hidden" name="checkOut" value={selection.checkOut ?? ""} />
                  <input type="hidden" name="adults" value={adults} />
                  <input type="hidden" name="children" value={children} />

                  {selected ? (
                    <div className="flex items-baseline justify-between">
                      <p className="text-[12.5px] text-ink-soft">
                        {nights} {nights === 1 ? "night" : "nights"} in the {selected.name}
                      </p>
                      <p className="font-display text-xl leading-none">£{selectedTotal}</p>
                    </div>
                  ) : (
                    <p className="text-[12px] text-clay">
                      No room fits {party} {party === 1 ? "guest" : "guests"} on these nights. Try
                      fewer nights, or write to us.
                    </p>
                  )}

                  <TextField label="Your name" name="guestName" required autoComplete="name" error={state.errors?.guestName} />
                  <TextField
                    label="Email"
                    name="guestEmail"
                    type="email"
                    required
                    autoComplete="email"
                    error={state.errors?.guestEmail}
                  />
                  <TextField label="Telephone (optional)" name="guestPhone" type="tel" autoComplete="tel" />
                  <label className="block">
                    <span className="field-label">Anything we should know?</span>
                    <textarea name="message" rows={3} className="field resize-y" placeholder="Arrival time, a dog, a birthday, dietary needs…" />
                  </label>

                  <FormMessage status={state.status} message={state.message} />

                  <button type="submit" disabled={!selected || pending} className="btn btn-primary w-full">
                    {pending ? "Sending…" : "Send a stay request"}
                  </button>
                  <p className="text-center text-[10.5px] leading-relaxed text-muted">
                    Pending until the innkeeper replies. No payment, ever.
                  </p>
                </form>
              </>
            )}
          </div>

          <p className="mt-4 px-1 text-[10.5px] leading-relaxed text-muted">
            Need two rooms, a cot, or something not on the calendar?{" "}
            <Link href="/find-us" className="underline underline-offset-4 hover:text-ink">
              Write or telephone
            </Link>{" "}
            — we answer every message ourselves.
          </p>
        </div>
      </aside>
    </div>
  );
}
