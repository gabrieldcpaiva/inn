"use client";

import { useMemo, useState } from "react";
import { RoomCard } from "@/components/site/room-card";
import { clsx } from "@/lib/clsx";
import type { Room } from "@/lib/types";

const PARTY_OPTIONS = [
  { value: 0, label: "Anyone" },
  { value: 1, label: "On my own" },
  { value: 2, label: "Two" },
  { value: 3, label: "Three" },
  { value: 4, label: "Four" },
];

export function RoomsExplorer({ rooms }: { rooms: Room[] }) {
  const [party, setParty] = useState(0);
  const [dogs, setDogs] = useState(false);

  const filtered = useMemo(
    () =>
      rooms.filter((room) => {
        if (party > 0 && room.capacity < party) return false;
        if (dogs && !room.amenities.some((amenity) => /dog/i.test(amenity))) return false;
        return true;
      }),
    [rooms, party, dogs],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Sleeps</span>
          {PARTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setParty(option.value)}
              aria-pressed={party === option.value}
              className={clsx(
                "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                party === option.value
                  ? "border-moss bg-moss text-parchment"
                  : "border-line text-ink-soft hover:border-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-ink-soft">
          <input
            type="checkbox"
            checked={dogs}
            onChange={(event) => setDogs(event.target.checked)}
            className="h-3.5 w-3.5 accent-[#2b4534]"
          />
          Dogs welcome
        </label>
      </div>

      <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "room" : "rooms"}
        {party > 0 ? ` that sleep${party === 1 ? "s" : ""} ${party}` : ""}
        {dogs ? " · dogs welcome" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 border border-line bg-parchment p-8 text-center">
          <p className="font-display text-xl">Nothing quite fits that combination.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Write to us and we’ll see what we can do — we have been known to put a cot in a
            dressing room.
          </p>
          <a href="mailto:hello@larkspurhouse.co.uk" className="link-arrow mt-4 inline-flex">
            Write to the innkeepers
          </a>
        </div>
      ) : (
        <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              index={rooms.findIndex((entry) => entry.id === room.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
