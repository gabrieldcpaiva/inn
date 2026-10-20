"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { innkeeperNav } from "@/lib/inn";
import { clsx } from "@/lib/clsx";

type DeskNavProps = {
  counts?: Record<string, number>;
  variant?: "sidebar" | "bar";
};

export function DeskNav({ counts = {}, variant = "sidebar" }: DeskNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="The desk"
      className={clsx(
        variant === "sidebar" ? "space-y-1" : "flex gap-1 overflow-x-auto whitespace-nowrap px-3 py-2",
      )}
    >
      {innkeeperNav.map((item) => {
        const active =
          item.href === "/desk" ? pathname === "/desk" : pathname.startsWith(item.href);
        const count = counts[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            className={clsx(
              "desk-nav-link",
              variant === "bar" && "shrink-0 px-3 py-1.5 text-[12px]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span>{item.label}</span>
            {count && count > 0 ? (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[9.5px] tabular-nums",
                  active ? "bg-parchment/20 text-parchment" : "bg-clay text-white",
                )}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
