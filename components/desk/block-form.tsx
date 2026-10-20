"use client";

import { useActionState } from "react";
import { blockDates } from "@/lib/actions/desk";
import { idleState } from "@/lib/validation";
import { FormMessage } from "@/components/booking/fields";

type Props = {
  rooms: { id: number; name: string }[];
  defaultRoomId?: number;
  defaultStart?: string;
  defaultEnd?: string;
};

export function BlockDatesForm({ rooms, defaultRoomId, defaultStart, defaultEnd }: Props) {
  const [state, action, pending] = useActionState(blockDates, idleState);

  return (
    <form action={action} className="space-y-3" id="close-dates">
      <div>
        <label className="field-label" htmlFor="block-room">
          Room
        </label>
        <select
          id="block-room"
          name="roomId"
          className="field cursor-pointer"
          defaultValue={defaultRoomId ?? rooms[0]?.id}
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">First closed night</span>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={defaultStart}
            className="field"
          />
        </label>
        <label className="block">
          <span className="field-label">Reopens</span>
          <input
            type="date"
            name="endDate"
            required
            defaultValue={defaultEnd}
            className="field"
          />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Why? (kept private)</span>
        <input
          name="reason"
          className="field"
          placeholder="Chimney work, deep clean, we’re away…"
          maxLength={200}
        />
      </label>
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Closing the dates…" : "Close these dates"}
      </button>
      <p className="text-[10.5px] leading-relaxed text-muted">
        The closing night is the night before the room reopens — close 12–14 October and the
        room is free again on the 14th.
      </p>
    </form>
  );
}
