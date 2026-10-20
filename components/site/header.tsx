"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { inn, navLinks } from "@/lib/inn";
import { clsx } from "@/lib/clsx";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-md">
      <div className="hidden border-b border-line/70 bg-paper-deep/40 md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-2 text-[10.5px] uppercase tracking-[0.22em] text-muted">
          <span>{inn.region}</span>
          <span className="hidden lg:inline">
            Six rooms · supper at seven · no televisions
          </span>
          <a href={`tel:${inn.phoneHref}`} className="transition-colors hover:text-ink">
            {inn.phone}
          </a>
        </div>
      </div>

      <div className="bg-paper/90">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="group flex items-baseline gap-3" aria-label={`${inn.name}, home`}>
            <span className="font-display text-[1.45rem] leading-none tracking-[-0.02em] transition-colors group-hover:text-moss">
              Larkspur House
            </span>
            <span className="hidden text-[9.5px] uppercase tracking-[0.24em] text-muted sm:inline">
              est. {inn.established}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="The inn">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative py-1 text-[0.8rem] tracking-[0.02em] transition-colors hover:text-moss",
                  isActive(link.href) ? "text-ink" : "text-ink-soft",
                )}
              >
                {link.label}
                <span
                  className={clsx(
                    "absolute -bottom-0.5 left-0 h-px bg-clay transition-all duration-300",
                    isActive(link.href) ? "w-full" : "w-0",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/stay" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Request a stay
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={clsx(
                    "absolute left-0 block h-px w-5 bg-current transition-all",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={clsx(
                    "absolute left-0 top-1.5 block h-px w-5 bg-current transition-opacity",
                    open ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={clsx(
                    "absolute left-0 block h-px w-5 bg-current transition-all",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={clsx(
          "fixed inset-0 z-30 overflow-y-auto bg-paper pt-24 transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <nav className="flex h-full flex-col px-6 pb-10 pt-6" aria-label="The inn, mobile">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-baseline justify-between border-b border-line py-4"
            >
              <span className="font-display text-2xl">{link.label}</span>
              <span className="text-[10px] tracking-[0.2em] text-muted">
                0{index + 1}
              </span>
            </Link>
          ))}
          <Link href="/stay" className="btn btn-primary mt-8 w-full">
            Request a stay
          </Link>
          <div className="mt-auto pt-8 text-sm text-muted">
            <p>{inn.addressLine}</p>
            <a href={`tel:${inn.phoneHref}`} className="mt-1 inline-block underline">
              {inn.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
