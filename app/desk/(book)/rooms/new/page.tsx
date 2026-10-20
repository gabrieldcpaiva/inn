import type { Metadata } from "next";
import Link from "next/link";
import { RoomForm } from "@/components/desk/room-form";

export const metadata: Metadata = { title: "A new room" };

export default function NewRoomPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <nav className="text-[10px] uppercase tracking-[0.16em] text-muted">
        <Link href="/desk/rooms" className="hover:text-ink">
          Rooms
        </Link>{" "}
        / New
      </nav>
      <h1 className="display-lg mt-3">A new room.</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Add the room to the book first; photographs can be uploaded the moment it exists. It will
        be hidden from guests until you tick “show this room”.
      </p>

      <div className="mt-6 border border-line bg-parchment p-4 sm:p-6">
        <RoomForm />
      </div>
    </div>
  );
}
