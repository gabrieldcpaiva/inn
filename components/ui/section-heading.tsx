import Link from "next/link";
import { clsx } from "@/lib/clsx";

type SectionHeadingProps = {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  action?: { href: string; label: string };
  className?: string;
  tone?: "dark" | "light";
};

export function SectionHeading({
  number,
  eyebrow,
  title,
  action,
  className,
  tone = "dark",
}: SectionHeadingProps) {
  return (
    <div className={clsx("mb-8", className)}>
      <div
        className={clsx(
          "flex items-baseline justify-between gap-6 border-t pt-3",
          tone === "dark" ? "border-ink" : "border-parchment/40",
        )}
      >
        <div className="flex items-baseline gap-3">
          <span
            className={clsx(
              "text-[10px] tabular-nums tracking-[0.2em]",
              tone === "dark" ? "text-muted" : "text-parchment/60",
            )}
          >
            {number}
          </span>
          <span
            className={clsx(
              "text-[10px] uppercase tracking-[0.24em]",
              tone === "dark" ? "text-muted" : "text-parchment/60",
            )}
          >
            {eyebrow}
          </span>
        </div>
        {action ? (
          <Link
            href={action.href}
            className={clsx(
              "link-arrow shrink-0",
              tone === "light" && "text-parchment hover:text-parchment",
            )}
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <h2 className={clsx("display-lg mt-5 max-w-3xl", tone === "light" && "text-parchment")}>
        {title}
      </h2>
    </div>
  );
}
