import type { Metadata } from "next";
import Link from "next/link";
import { getGuestbookEntries } from "@/lib/queries";
import { moderateGuestbook } from "@/lib/actions/desk";
import { StatusPill } from "@/components/ui/status-pill";
import { clsx } from "@/lib/clsx";

export const metadata: Metadata = { title: "Guestbook" };

const FILTERS = [
  { key: "all", label: "Everything" },
  { key: "pending", label: "To read" },
  { key: "approved", label: "Published" },
  { key: "hidden", label: "Hidden" },
  { key: "rejected", label: "Rejected" },
] as const;

export default async function DeskGuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const filter = FILTERS.some((entry) => entry.key === query.status)
    ? (query.status as (typeof FILTERS)[number]["key"])
    : "all";
  const entries = await getGuestbookEntries(filter === "all" ? "all" : filter, 200);
  const pending = entries.filter((entry) => entry.status === "pending").length;

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The guestbook</p>
          <h1 className="display-lg mt-2">Notes from the hall table.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Nothing appears on the website until you approve it. Approve the kind ones, hide the
            ones with somebody’s room number in them, reject the spam.
          </p>
        </div>
        <Link href="/guestbook" className="btn btn-ghost btn-sm" target="_blank">
          View the guestbook ↗
        </Link>
      </header>

      {pending > 0 && filter === "all" ? (
        <p className="mt-4 border-l-2 border-gold bg-[#f6ecd6] px-3 py-2 text-[12.5px] text-[#7a5a1e]">
          {pending} {pending === 1 ? "note is" : "notes are"} waiting to be read.
        </p>
      ) : null}

      <nav className="mt-5 flex flex-wrap gap-2 border-b border-line pb-3" aria-label="Filter the guestbook">
        {FILTERS.map((entry) => (
          <Link
            key={entry.key}
            href={entry.key === "all" ? "/desk/guestbook" : `/desk/guestbook?status=${entry.key}`}
            className={clsx(
              "border px-3 py-1.5 text-[11.5px] transition-colors",
              filter === entry.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink",
            )}
            aria-current={filter === entry.key ? "page" : undefined}
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      {entries.length === 0 ? (
        <p className="mt-6 border border-line bg-parchment p-6 text-sm text-ink-soft">
          Nothing here. Guests can add a note from the guestbook page on the website.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="border border-line bg-parchment p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg leading-tight">{entry.guestName}</p>
                  <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    {[entry.location, entry.stayMonth].filter(Boolean).join(" · ") || "No details given"}
                    {" · "}
                    {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusPill
                  status={entry.status}
                  label={
                    entry.status === "pending"
                      ? "Waiting"
                      : entry.status === "approved"
                        ? "Published"
                        : entry.status === "hidden"
                          ? "Hidden"
                          : "Rejected"
                  }
                />
              </div>

              <blockquote className="mt-3 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-ink-soft">
                {entry.message}
              </blockquote>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-line-soft pt-3">
                {entry.status !== "approved" ? (
                  <ModerationButton entryId={entry.id} moderation="approve" label="Approve" primary />
                ) : null}
                {entry.status !== "hidden" ? (
                  <ModerationButton entryId={entry.id} moderation="hide" label="Hide" />
                ) : null}
                {entry.status !== "rejected" ? (
                  <ModerationButton entryId={entry.id} moderation="reject" label="Reject" subtle />
                ) : null}
                {entry.status !== "pending" ? (
                  <ModerationButton entryId={entry.id} moderation="restore" label="Back to the pile" subtle />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ModerationButton({
  entryId,
  moderation,
  label,
  primary = false,
  subtle = false,
}: {
  entryId: number;
  moderation: string;
  label: string;
  primary?: boolean;
  subtle?: boolean;
}) {
  return (
    <form action={moderateGuestbook}>
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="moderation" value={moderation} />
      <button
        type="submit"
        className={clsx(
          "btn btn-sm",
          primary ? "btn-primary" : subtle ? "btn-ghost" : "btn-outline",
        )}
      >
        {label}
      </button>
    </form>
  );
}
