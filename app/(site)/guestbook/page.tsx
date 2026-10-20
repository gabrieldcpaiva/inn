import type { Metadata } from "next";
import Link from "next/link";
import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { getGuestbookEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "The guestbook",
  description:
    "Notes left by guests at Larkspur House, kept in a book on the hall table and copied here. Entries are moderated by the innkeeper.",
};

export default async function GuestbookPage() {
  const entries = await getGuestbookEntries("approved", 60);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">The guestbook</p>
          <h1 className="display-xl mt-4 max-w-2xl">In their own words.</h1>
        </div>
        <div className="lg:col-span-5 lg:pt-12">
          <p className="lede">
            There is a book on the hall table, and guests write in it before they leave. We copy
            the entries here — lightly tidied, never edited for sense, and never paid for.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">
            {entries.length} notes · moderated by hand
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry, index) => (
          <figure
            key={entry.id}
            className={
              index % 5 === 0
                ? "sm:col-span-2 border-t border-ink pt-4"
                : "border-t border-line pt-4"
            }
          >
            <blockquote>
              <p
                className={
                  index % 5 === 0
                    ? "font-display text-2xl leading-snug text-ink"
                    : "font-display text-lg leading-snug text-ink"
                }
              >
                “{entry.message}”
              </p>
            </blockquote>
            <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-2 text-[10.5px] uppercase tracking-[0.16em] text-muted">
              <span className="text-ink">{entry.guestName}</span>
              {entry.location ? <span>· {entry.location}</span> : null}
              {entry.stayMonth ? <span>· {entry.stayMonth}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-10 border border-line bg-parchment p-6 text-sm text-ink-soft">
          The book is empty for now. Be the first to write in it.
        </p>
      ) : null}

      <div className="mt-16 grid gap-10 border-t border-ink pt-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="display-lg">Leave a note.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            Stayed with us? Tell the next guest what to expect. We read everything before it
            appears — usually within a day, sometimes after the weekend.
          </p>
          <p className="mt-4 max-w-md text-[12px] leading-relaxed text-muted">
            We publish your name, town and month only. If you would rather we took something
            down, write to the innkeeper and it will be done the same day.
          </p>
          <Link href="/rooms" className="link-arrow mt-6 inline-flex">
            The rooms, if you’re planning a return
          </Link>
        </div>
        <div className="lg:col-span-7">
          <GuestbookForm />
        </div>
      </div>
    </div>
  );
}
