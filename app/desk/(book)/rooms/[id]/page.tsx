import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/queries";
import { RoomForm } from "@/components/desk/room-form";
import { PhotoList } from "@/components/desk/photo-list";
import { PhotoUpload } from "@/components/desk/photo-manager";
import { DeleteRoom } from "@/components/desk/delete-room";
import { toggleRoomListing } from "@/lib/actions/desk";
import { storageLabel } from "@/lib/storage";
import { StatusPill } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/dates";

export const metadata: Metadata = { title: "Edit a room" };

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoomById(Number(id));
  if (!room) notFound();

  return (
    <div className="mx-auto max-w-[1080px]">
      <nav className="text-[10px] uppercase tracking-[0.16em] text-muted">
        <Link href="/desk/rooms" className="hover:text-ink">
          Rooms
        </Link>{" "}
        / {room.name}
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg">{room.name}</h1>
          <p className="mt-1.5 text-[11px] text-muted">
            /rooms/{room.slug} · {formatMoney(room.nightlyRate)} a night · sleeps {room.capacity}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={room.isListed ? "confirmed" : "hidden"} label={room.isListed ? "On the site" : "Unlisted"} />
          <form action={toggleRoomListing}>
            <input type="hidden" name="roomId" value={room.id} />
            <button type="submit" className="btn btn-ghost btn-sm">
              {room.isListed ? "Unlist" : "List on the site"}
            </button>
          </form>
          <Link href={`/rooms/${room.slug}`} target="_blank" className="btn btn-ghost btn-sm">
            View ↗
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="border border-line bg-parchment p-4 sm:p-5">
            <h2 className="display-sm">The room</h2>
            <div className="mt-4">
              <RoomForm room={room} />
            </div>
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="border border-line bg-parchment p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="display-sm">Photographs</h2>
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                {room.photos.length}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{storageLabel()}</p>

            <div className="mt-3">
              <PhotoUpload roomId={room.id} storageLabel={storageLabel()} />
            </div>

            <div className="mt-3">
              <PhotoList photos={room.photos} />
            </div>
          </div>

          <div className="mt-6 border border-line bg-parchment p-4">
            <h2 className="display-sm">If the room must go</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Removing a room also removes its photographs. It cannot be done while stays exist in
              its history — unlist it instead and it will simply disappear from the website.
            </p>
            <div className="mt-3">
              <DeleteRoom roomId={room.id} roomName={room.name} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
