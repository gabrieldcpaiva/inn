import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RoomGallery } from "@/components/site/room-gallery";
import { RoomCard } from "@/components/site/room-card";
import { BookingPanel } from "@/components/booking/booking-panel";
import { getRoomBySlug, getRooms } from "@/lib/queries";
import { getOccupancy, toMarks } from "@/lib/availability";
import { addDays, formatMoney, todayISO } from "@/lib/dates";
import { inn } from "@/lib/inn";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) return { title: "Room not found" };
  return {
    title: room.name,
    description: `${room.tagline} Sleeps ${room.capacity}. From ${formatMoney(room.nightlyRate)} a night, breakfast included.`,
    openGraph: {
      images: room.photos[0]?.key.startsWith("seed/")
        ? [`/${room.photos[0].key}`]
        : undefined,
    },
  };
}

export default async function RoomPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const room = await getRoomBySlug(slug);
  if (!room || !room.isListed) notFound();

  const today = todayISO();
  const occupancy = await getOccupancy(today, addDays(today, 400), [room.id]);
  const marks = toMarks(occupancy);
  const allRooms = await getRooms();
  const others = allRooms.filter((entry) => entry.id !== room.id).slice(0, 3);

  const hasDogs = room.amenities.some((amenity) => /dog/i.test(amenity));
  const paragraphs = room.description.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-8 md:px-8">
      <nav className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-muted" aria-label="Breadcrumb">
        <Link href="/rooms" className="transition-colors hover:text-ink">
          The rooms
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{room.name}</span>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <header className="mb-5">
            <h1 className="display-lg">{room.name}</h1>
            <p className="lede mt-3 max-w-xl">{room.tagline}</p>
          </header>

          <RoomGallery photos={room.photos} name={room.name} />

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-4 sm:grid-cols-4">
            <div>
              <dt className="label">Sleeps</dt>
              <dd className="mt-1 text-sm">{room.capacity} guests</dd>
            </div>
            <div>
              <dt className="label">Beds</dt>
              <dd className="mt-1 text-sm">{room.beds}</dd>
            </div>
            <div>
              <dt className="label">Size</dt>
              <dd className="mt-1 text-sm">{room.sizeSqm ? `${room.sizeSqm} m²` : "—"}</dd>
            </div>
            <div>
              <dt className="label">A night</dt>
              <dd className="mt-1 text-sm">{formatMoney(room.nightlyRate)}, breakfast in</dd>
            </div>
          </dl>

          <div className="prose-inn mt-7 max-w-2xl text-[0.98rem]">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="display-sm">In the room</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {room.amenities.map((amenity) => (
                <li key={amenity} className="flex items-start gap-2.5 border-b border-line-soft pb-2 text-sm text-ink-soft">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-moss"
                  >
                    <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg">Good to know</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                <li>Check-in from {inn.checkIn}; check-out by {inn.checkOut}.</li>
                <li>Breakfast is served {inn.breakfast}, in the dining room or on the lawn.</li>
                <li>{hasDogs ? "Dogs are welcome here, £12 a night." : "This room is kept dog-free. The Wren, the Hollow Oak and the Hut welcome them."}</li>
                <li>Two nights minimum at weekends.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg">A small promise</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                We never take a card on this site. Send a request, and one of us will write back
                to confirm the room and answer anything you’ve asked. If the dates don’t suit,
                we’ll suggest others.
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div>
            <BookingPanel
              room={{
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                nightlyRate: room.nightlyRate,
              }}
              marks={marks}
              today={today}
              initialCheckIn={query.checkIn}
              initialCheckOut={query.checkOut}
            />
            <p className="mt-3 px-1 text-[10.5px] leading-relaxed text-muted">
              The calendar is the same book the innkeeper keeps. Cross-hatched nights are taken
              or closed; a small gold ring means someone has asked for that night but it is not
              yet held.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-20">
        <div className="flex items-baseline justify-between border-t border-ink pt-3">
          <p className="label">Also in the house</p>
          <Link href="/rooms" className="link-arrow">
            All six rooms
          </Link>
        </div>
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {others.map((other, index) => (
            <RoomCard key={other.id} room={other} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
