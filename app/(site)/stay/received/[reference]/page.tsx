import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/ui/status-pill";
import { Photo } from "@/components/ui/photo";
import { getRequestByReference, getRoomById } from "@/lib/queries";
import { formatLong, formatMoney, formatStayLong, nightsBetween } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { inn } from "@/lib/inn";

export const metadata: Metadata = {
  title: "Your request",
  robots: { index: false },
};

export default async function ReceivedPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const request = await getRequestByReference(reference);
  if (!request) notFound();
  const room = await getRoomById(request.roomId);
  const nights = nightsBetween(request.checkIn, request.checkOut);
  const cover = room?.photos[0];

  const statusCopy = {
    pending: {
      title: "With the innkeeper",
      body: "Your request is in the book and waiting for one of us to read it. We answer by hand, usually the same day — occasionally the morning after if the evening ran late.",
    },
    confirmed: {
      title: "Confirmed — the room is held",
      body: "We’ve put your name against the room in the book. There’s nothing to pay now; settle up before you leave, by card or cash, whichever suits.",
    },
    declined: {
      title: "Not this time",
      body: "We couldn’t give you these dates. The note below explains why — do write again for another time, or telephone and we’ll find something.",
    },
  }[request.status];

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">The reservations book · {request.reference}</p>
          <h1 className="display-xl mt-4">
            {request.status === "pending" ? "Your request is in the book." : statusCopy.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusPill
              status={request.status}
              label={
                request.status === "pending"
                  ? "Awaiting the innkeeper"
                  : request.status === "confirmed"
                    ? "Confirmed"
                    : "Declined"
              }
            />
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Sent {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
            </span>
          </div>
          <p className="lede mt-5 max-w-xl">{statusCopy.body}</p>

          {request.note ? (
            <blockquote className="mt-6 border-l-2 border-moss bg-parchment px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">A note from the desk</p>
              <p className="mt-1.5 font-display text-lg leading-snug">“{request.note}”</p>
            </blockquote>
          ) : null}

          <div className="mt-8 border-y border-line">
            <dl className="divide-y divide-line-soft">
              <Row label="Room" value={request.roomName} />
              <Row label="Guests" value={`${request.adults} ${request.adults === 1 ? "adult" : "adults"}${request.children ? `, ${request.children} ${request.children === 1 ? "child" : "children"}` : ""}`} />
              <Row label="Arriving" value={`${formatLong(request.checkIn)}, from ${inn.checkIn}`} />
              <Row label="Leaving" value={`${formatLong(request.checkOut)}, by ${inn.checkOut}`} />
              <Row label="Nights" value={`${nights} · ${formatStayLong(request.checkIn, request.checkOut)}`} />
              <Row
                label="Room rate"
                value={`${formatMoney(room?.nightlyRate ?? 0)} a night · ${formatMoney((room?.nightlyRate ?? 0) * nights)} in total`}
              />
              <Row label="Name" value={request.guestName} />
              <Row label="Email" value={request.guestEmail} />
              {request.guestPhone ? <Row label="Telephone" value={request.guestPhone} /> : null}
              {request.message ? <Row label="Your note" value={request.message} /> : null}
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-outline">
              Back to the inn
            </Link>
            <Link href="/stay" className="btn btn-primary">
              Send another request
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div>
            <figure>
              {cover ? (
                <Photo
                  src={mediaUrl(cover.key)}
                  alt={cover.alt}
                  className="aspect-[4/5]"
                  sizes="(min-width: 1024px) 38vw, 100vw"
                />
              ) : null}
              <figcaption className="caption mt-2">
                {request.roomName} · the calendar on the room page is the same book you have just written in.
              </figcaption>
            </figure>

            <div className="mt-6 border border-line bg-parchment p-4">
              <p className="label">What happens now</p>
              <ol className="mt-3 space-y-3 text-sm text-ink-soft">
                <li className="flex gap-3">
                  <span className="font-display text-base text-clay">1.</span>
                  Margaret or Tom reads your request — by hand, at the desk.
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-base text-clay">2.</span>
                  We write back by email to confirm or suggest other dates.
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-base text-clay">3.</span>
                  If confirmed, the room is held. Nothing is charged until you leave.
                </li>
              </ol>
              <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
                Plans change? Reply to the confirmation email or telephone{" "}
                <a href={`tel:${inn.phoneHref}`} className="underline underline-offset-4">
                  {inn.phone}
                </a>
                . We won’t charge for a cancellation.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 sm:grid-cols-4">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="col-span-2 text-sm text-ink sm:col-span-3">{value}</dd>
    </div>
  );
}
