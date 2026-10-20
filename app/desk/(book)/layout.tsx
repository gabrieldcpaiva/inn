import Link from "next/link";
import { requireInnkeeper } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { queryOne } from "@/lib/db";
import { DeskNav } from "@/components/desk/desk-nav";
import { inn } from "@/lib/inn";
import { formatLong, todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const innkeeper = await requireInnkeeper();
  const today = todayISO();

  const [pendingRequests, pendingGuestbook] = await Promise.all([
    queryOne<{ count: number }>("select count(*)::int as count from stay_requests where status = 'pending'"),
    queryOne<{ count: number }>("select count(*)::int as count from guestbook_entries where status = 'pending'"),
  ]);

  const counts: Record<string, number> = {
    "/desk": 0,
    "/desk/requests": pendingRequests?.count ?? 0,
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-paper-deep/50 lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Link href="/" className="block">
            <p className="font-display text-2xl leading-none">Larkspur House</p>
            <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.24em] text-muted">
              Innkeeper’s desk
            </p>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DeskNav counts={counts} />
          <div className="mt-8 border-t border-line pt-4">
            <p className="px-3 text-[9.5px] uppercase tracking-[0.2em] text-muted">The inn</p>
            <div className="mt-2 space-y-1">
              <Link href="/" className="desk-nav-link">
                <span>View the website</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/stay" className="desk-nav-link">
                <span>Make a request</span>
              </Link>
            </div>
          </div>
          {pendingGuestbook && pendingGuestbook.count > 0 ? (
            <Link
              href="/desk/guestbook"
              className="mt-4 block border border-gold/40 bg-[#f6ecd6] px-3 py-2.5 text-[11.5px] leading-snug text-[#7a5a1e]"
            >
              <span className="block font-semibold">
                {pendingGuestbook.count} guestbook {pendingGuestbook.count === 1 ? "note" : "notes"}
              </span>
              waiting to be read
            </Link>
          ) : null}
        </div>
        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] font-medium">{innkeeper.name}</p>
          <p className="text-[10.5px] text-muted">{innkeeper.email}</p>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="text-[10px] uppercase tracking-[0.16em] text-ink-soft underline underline-offset-4 transition-colors hover:text-clay"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-baseline gap-3">
              <Link href="/desk" className="font-display text-xl leading-none lg:hidden">
                Larkspur
              </Link>
              <p className="hidden text-[10.5px] uppercase tracking-[0.18em] text-muted sm:block">
                {formatLong(today)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="hidden text-[11px] text-muted md:block">
                {inn.address.town} · {inn.phone}
              </p>
              <Link href="/" className="btn btn-ghost btn-sm">
                The inn ↗
              </Link>
              <form action={signOut} className="lg:hidden">
                <button type="submit" className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Out
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-line lg:hidden">
            <DeskNav counts={counts} variant="bar" />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
