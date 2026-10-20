"use client";

import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import { mediaUrl } from "@/lib/media";
import { clsx } from "@/lib/clsx";

type GalleryPhoto = { id: number; key: string; alt: string };

export function RoomGallery({ photos, name }: { photos: GalleryPhoto[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  if (!current) {
    return <Photo src="/seed/rooms/mulberry-1.jpg" alt={name} className="aspect-[4/3]" priority />;
  }

  return (
    <div>
      <Photo
        key={current.id}
        src={mediaUrl(current.key)}
        alt={current.alt || name}
        className="aspect-[4/3] w-full"
        sizes="(min-width: 1024px) 58vw, 100vw"
        priority
        imgClassName="fade-up"
      />
      {photos.length > 1 ? (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photograph ${index + 1} of ${photos.length}`}
              aria-current={index === active}
              className={clsx(
                "relative overflow-hidden border transition-opacity",
                index === active ? "border-ink opacity-100" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Photo
                src={mediaUrl(photo.key)}
                alt=""
                className="aspect-[4/3]"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
