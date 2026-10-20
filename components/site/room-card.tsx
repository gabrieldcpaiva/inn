import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { mediaUrl } from "@/lib/media";
import { formatMoney } from "@/lib/dates";
import type { Room } from "@/lib/types";

type RoomCardProps = {
  room: Room;
  index?: number;
  layout?: "portrait" | "landscape";
};

export function RoomCard({ room, index = 0, layout = "portrait" }: RoomCardProps) {
  const cover = room.photos[0];
  return (
    <article className="group">
      <Link href={`/rooms/${room.slug}`} className="block">
        <div className="relative overflow-hidden">
          <Photo
            src={cover ? mediaUrl(cover.key) : "/seed/rooms/mulberry-1.jpg"}
            alt={cover?.alt || room.name}
            className={layout === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[9.5px] uppercase tracking-[0.18em] text-ink">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="display-md transition-colors group-hover:text-clay">{room.name}</h3>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">{room.tagline}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block font-display text-xl leading-none">
              {formatMoney(room.nightlyRate)}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-muted">
              a night
            </span>
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 border-t border-line pt-2.5 text-[11px] text-muted">
          <span>Sleeps {room.capacity}</span>
          <span aria-hidden="true">·</span>
          <span>{room.beds}</span>
          <span aria-hidden="true">·</span>
          <span>from {formatMoney(room.nightlyRate)}</span>
        </p>
      </Link>
    </article>
  );
}
