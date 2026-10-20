import type { Metadata } from "next";
import Link from "next/link";
import { StayPlanner } from "@/components/booking/stay-planner";
import { ReferenceLookup } from "@/components/booking/reference-lookup";
import { getRooms } from "@/lib/queries";
import { getOccupancy, toMarks } from "@/lib/availability";
import { addDays, todayISO } from "@/lib/dates";
import { inn } from "@/lib/inn";

export const metadata: Metadata = {
  title: "Request a stay",
  description:
    "Check the reservation book, choose your nights and your room, and send a stay request to the innkeeper. Nothing is charged; requests are confirmed by hand.",
};

type Search = { checkIn?: string; checkOut?: string };

export default async function StayPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const today = todayISO();
  const rooms = await getRooms();
  const occupancy = await getOccupancy(today, addDays(today, 400));
  const marks = toMarks(occupancy);

  const bookable = rooms.map((room) => ({
    id: room.id,
    slug: room.slug,
    name: room.name,
    capacity: room.capacity,
    nightlyRate: room.nightlyRate,
    beds: room.beds,
    tagline: room.tagline,
    photo: room.photos[0] ? { key: room.photos[0].key, alt: room.photos[0].alt } : null,
  }));

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">The reservations book</p>
          <h1 className="display-xl mt-4 max-w-2xl">Ask for the nights you want.</h1>
        </div>
        <div className="lg:col-span-5 lg:pt-12">
          <p className="lede">
            Choose your dates, tell us who is coming, and pick a room. One of us will write back
            to confirm — usually the same day. Until then your request is simply a request.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
            <span>No payment</span>
            <span>No card details</span>
            <span>Replies by hand</span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <StayPlanner
          rooms={bookable}
          marks={marks}
          today={today}
          initialCheckIn={query.checkIn}
          initialCheckOut={query.checkOut}
        />
      </div>

      <div className="mt-16 grid gap-10 border-t border-line pt-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="display-md">Already sent a request?</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Look it up with the reference from your confirmation. If it has slipped your mind,
            write to{" "}
            <a href={`mailto:${inn.email}`} className="underline underline-offset-4">
              {inn.email}
            </a>{" "}
            and we’ll find you in the book.
          </p>
          <div className="mt-5 max-w-md">
            <ReferenceLookup />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="label">Before you come</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Check-in from {inn.checkIn}, supper at {inn.supper}. Let us know about allergies,
              dogs or late arrivals when you write.
            </p>
          </div>
          <div>
            <p className="label">Two nights</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              A two-night minimum at weekends, three over a bank holiday. Single nights are
              often possible midweek — just ask.
            </p>
          </div>
          <div>
            <p className="label">By telephone</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              We would rather talk than take a booking online.{" "}
              <a href={`tel:${inn.phoneHref}`} className="underline underline-offset-4">
                {inn.phone}
              </a>
            </p>
            <Link href="/find-us" className="link-arrow mt-3 inline-flex">
              Finding us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
