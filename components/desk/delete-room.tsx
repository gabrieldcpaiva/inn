"use client";

import { deleteRoom } from "@/lib/actions/desk";

export function DeleteRoom({ roomId, roomName }: { roomId: number; roomName: string }) {
  return (
    <form
      action={deleteRoom}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Remove ${roomName} from the book? Its photographs will be deleted. Rooms with stays in their history can’t be removed — unlist them instead.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="roomId" value={roomId} />
      <button
        type="submit"
        className="text-[10px] uppercase tracking-[0.14em] text-clay underline underline-offset-4 hover:text-ink"
      >
        Remove the room
      </button>
    </form>
  );
}
