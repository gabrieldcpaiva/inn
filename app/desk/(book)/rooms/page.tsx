import type { Metadata } from "next";
import Link from "next/link";
import { getRooms } from "@/lib/queries";
import { toggleRoomListing } from "@/lib/actions/desk";
import { storageLabel } from "@/lib/storage";
import { Photo } from "@/components/ui/photo";
import { mediaUrl } from "@/lib/media";
import { formatMoney } from "@/lib/dates";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata: Metadata = { title: "Rooms" };

export default async function DeskRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const rooms = await getRooms({ includeUnlisted: true });
  const query = await searchParams;

  return (
    <div className="mx-auto max-w-[1180px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The house</p>
          <h1 className="display-lg mt-2">Rooms &amp; photographs.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Rates, descriptions and photographs all live here. Changes appear on the website
            straight away.
          </p>
        </div>
        <Link href="/desk/rooms/new" className="btn btn-primary btn-sm">
          Add a room
        </Link>
      </header>

      {query.error ? (
        <p className="mt-4 border-l-2 border-clay bg-clay-pale/50 px-3 py-2 text-[12.5px] text-[#7c3d24]">
          {query.error}
        </p>
      ) : null}

      <p className="mt-5 border border-line bg-paper-deep/40 px-3 py-2 text-[11px] text-ink-soft">
        <span className="uppercase tracking-[0.14em] text-muted">Photographs stored in</span>{" "}
        {storageLabel()}. Set the S3_* variables to use a cloud bucket instead of the local
        folder.
      </p>

      <div className="mt-6 space-y-3">
        {rooms.map((room) => (
          <article key={room.id} className="border border-line bg-parchment">
            <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
              <div className="relative h-24 w-full shrink-0 overflow-hidden bg-paper-deep sm:h-20 sm:w-28">
                {room.photos[0] ? (
                  <Photo
                    src={mediaUrl(room.photos[0].key)}
                    alt=""
                    className="h-full w-full"
                    sizes="120px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.12em] text-muted">
                    No photo
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl leading-tight">{room.name}</h2>
                  <StatusPill status={room.isListed ? "confirmed" : "hidden"} label={room.isListed ? "On the site" : "Unlisted"} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted">
                  /rooms/{room.slug} · sleeps {room.capacity} · {formatMoney(room.nightlyRate)} a
                  night · {room.photos.length} {room.photos.length === 1 ? "photograph" : "photographs"}
                </p>
                <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-soft">{room.tagline}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <form action={toggleRoomListing}>
                  <input type="hidden" name="roomId" value={room.id} />
                  <button type="submit" className="text-[10px] uppercase tracking-[0.12em] text-ink-soft underline underline-offset-4 hover:text-ink">
                    {room.isListed ? "Unlist" : "List"}
                  </button>
                </form>
                <Link href={`/desk/rooms/${room.id}`} className="btn btn-primary btn-sm">
                  Edit
                </Link>
                <Link href={`/rooms/${room.slug}`} className="btn btn-ghost btn-sm" target="_blank">
                  View ↗
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-lg">How photographs work</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Upload straight from the room’s page. We resize to 1,800px, convert to JPEG and store
            them in your configured bucket or the local media folder.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg">The first is the cover</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Use the arrows on a photograph to move it up or down. The first is used on the
            website’s room cards and the stay request list.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg">Removing a room</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Rooms with stays in their history cannot be deleted — unlist them instead, so the old
            bookings keep their record.
          </p>
        </div>
      </div>
    </div>
  );
}
