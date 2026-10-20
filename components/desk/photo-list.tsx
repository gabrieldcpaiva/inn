import { Photo } from "@/components/ui/photo";
import { mediaUrl } from "@/lib/media";
import { deleteRoomPhoto, moveRoomPhoto, savePhotoAlt } from "@/lib/actions/desk";
import type { RoomPhoto } from "@/lib/types";

export function PhotoList({ photos }: { photos: RoomPhoto[] }) {
  if (photos.length === 0) {
    return (
      <p className="border border-line bg-paper/40 p-4 text-[12.5px] text-muted">
        No photographs yet. The first one becomes the room’s cover, so choose it carefully.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {photos.map((photo, index) => (
        <li key={photo.id} className="border border-line bg-parchment">
          <div className="relative">
            <Photo
              src={mediaUrl(photo.key)}
              alt={photo.alt}
              className="aspect-[4/3]"
              sizes="(min-width: 640px) 30vw, 100vw"
            />
            <span className="absolute left-2 top-2 bg-paper/90 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]">
              {index === 0 ? "Cover" : `Photo ${index + 1}`}
            </span>
          </div>
          <div className="space-y-2 p-2.5">
            <form action={savePhotoAlt} className="flex gap-2">
              <input type="hidden" name="photoId" value={photo.id} />
              <input
                name="alt"
                defaultValue={photo.alt}
                aria-label={`Description of photograph ${index + 1}`}
                className="field min-w-0 flex-1 py-1.5 text-[11.5px]"
                placeholder="What does the photograph show?"
              />
              <button type="submit" className="btn btn-ghost btn-sm">
                Save
              </button>
            </form>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <form action={moveRoomPhoto}>
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="flex h-6 w-6 items-center justify-center border border-line text-[11px] disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveRoomPhoto}>
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === photos.length - 1}
                    aria-label="Move later"
                    className="flex h-6 w-6 items-center justify-center border border-line text-[11px] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>
              <form action={deleteRoomPhoto}>
                <input type="hidden" name="photoId" value={photo.id} />
                <button
                  type="submit"
                  className="text-[10px] uppercase tracking-[0.12em] text-clay underline underline-offset-4 hover:text-ink"
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
