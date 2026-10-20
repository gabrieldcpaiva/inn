"use client";

import { useActionState } from "react";
import { saveRoom } from "@/lib/actions/desk";
import { idleState } from "@/lib/validation";
import { FormMessage } from "@/components/booking/fields";
import type { Room } from "@/lib/types";

export function RoomForm({ room }: { room?: Room }) {
  const [state, action, pending] = useActionState(saveRoom, idleState);

  return (
    <form action={action} className="space-y-5">
      {room ? <input type="hidden" name="roomId" value={room.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Name</span>
          <input name="name" required defaultValue={room?.name} className="field" />
          {state.errors?.name ? <span className="mt-1 block text-[11px] text-clay">{state.errors.name}</span> : null}
        </label>
        <label className="block">
          <span className="field-label">Web address</span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-muted">/rooms/</span>
            <input name="slug" required defaultValue={room?.slug} className="field" />
          </div>
          {state.errors?.slug ? <span className="mt-1 block text-[11px] text-clay">{state.errors.slug}</span> : null}
        </label>
      </div>

      <label className="block">
        <span className="field-label">One line for the cards</span>
        <input
          name="tagline"
          defaultValue={room?.tagline}
          className="field"
          placeholder="A garden suite with its own door onto the walled garden."
          maxLength={180}
        />
      </label>

      <label className="block">
        <span className="field-label">The description</span>
        <textarea
          name="description"
          defaultValue={room?.description}
          rows={7}
          className="field resize-y"
          placeholder="Two or three paragraphs. Leave a blank line between them."
        />
        <span className="field-hint">Blank lines become paragraphs on the room page.</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-4">
        <label className="block">
          <span className="field-label">Sleeps</span>
          <input name="capacity" type="number" min={1} max={12} required defaultValue={room?.capacity ?? 2} className="field" />
        </label>
        <label className="block">
          <span className="field-label">Beds</span>
          <input name="beds" defaultValue={room?.beds} className="field" placeholder="Superking or twins" />
        </label>
        <label className="block">
          <span className="field-label">Size (m²)</span>
          <input name="sizeSqm" type="number" min={0} max={500} defaultValue={room?.sizeSqm ?? ""} className="field" />
        </label>
        <label className="block">
          <span className="field-label">Rate a night (£)</span>
          <input name="nightlyRate" type="number" min={0} max={5000} required defaultValue={room?.nightlyRate ?? 150} className="field" />
        </label>
      </div>

      <label className="block">
        <span className="field-label">In the room</span>
        <textarea
          name="amenities"
          rows={5}
          defaultValue={room?.amenities.join("\n")}
          className="field resize-y text-[13px]"
          placeholder={"Private garden door\nRoll-top bath\nSuperking bed"}
        />
        <span className="field-hint">One per line, or separated by commas.</span>
      </label>

      <label className="flex items-start gap-2.5 border-t border-line pt-4">
        <input
          type="checkbox"
          name="isListed"
          defaultChecked={room ? room.isListed : true}
          className="mt-0.5 h-4 w-4 accent-[#2b4534]"
        />
        <span>
          <span className="block text-[13px] font-medium">Show this room on the website</span>
          <span className="block text-[11.5px] text-muted">
            Unlisted rooms stay in the book and can be booked by you, but guests won’t see them.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : room ? "Save the room" : "Add the room"}
        </button>
        {state.status !== "idle" ? (
          <div className="flex-1">
            <FormMessage status={state.status} message={state.message} />
          </div>
        ) : null}
      </div>
    </form>
  );
}
