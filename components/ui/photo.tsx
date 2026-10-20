import Image from "next/image";
import { clsx } from "@/lib/clsx";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  imgClassName?: string;
};

/**
 * A filled, cover-cropped photograph. The frame always has a position so the
 * image can size itself to whatever aspect ratio the parent gives it.
 */
export function Photo({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  quality = 82,
  imgClassName,
}: PhotoProps) {
  return (
    <div className={clsx("relative overflow-hidden bg-paper-deep", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={clsx("object-cover", imgClassName)}
      />
    </div>
  );
}
