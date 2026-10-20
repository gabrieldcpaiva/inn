import Link from "next/link";
import { inn, navLinks } from "@/lib/inn";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/15 bg-paper-deep/50">
      <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl leading-none">Larkspur House</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              {inn.strapline} Kept by {inn.innkeepers}, and a dog called Pip.
            </p>
            <p className="caption mt-5">“A house is only as old as its welcome.”</p>
          </div>

          <div className="md:col-span-2">
            <p className="label mb-3">The inn</p>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/stay" className="text-ink-soft transition-colors hover:text-ink">
                  Request a stay
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="label mb-3">Finding us</p>
            <address className="space-y-1 text-sm not-italic text-ink-soft">
              <p>Underley</p>
              <p>Kirkby Lonsdale</p>
              <p>Cumbria LA6 2QH</p>
            </address>
            <p className="mt-3 space-y-1 text-sm text-ink-soft">
              <a href={`tel:${inn.phoneHref}`} className="block hover:text-ink">
                {inn.phone}
              </a>
              <a href={`mailto:${inn.email}`} className="block hover:text-ink">
                {inn.email}
              </a>
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="label mb-3">Hours</p>
            <dl className="space-y-2 text-sm text-ink-soft">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Check-in</dt>
                <dd>from {inn.checkIn}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Check-out</dt>
                <dd>by {inn.checkOut}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Supper</dt>
                <dd>one sitting, {inn.supper}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-5 text-[11px] tracking-[0.06em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Larkspur House. No payment is taken on this site.</p>
          <div className="flex items-center gap-5">
            <span>Made in the Lune Valley</span>
            <Link href="/desk" className="uppercase tracking-[0.16em] transition-colors hover:text-ink">
              Innkeeper’s desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
