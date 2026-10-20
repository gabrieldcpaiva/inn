import type { Metadata } from "next";
import Link from "next/link";
import { RoomsExplorer } from "@/components/site/rooms-explorer";
import { getRooms } from "@/lib/queries";
import { formatMoney } from "@/lib/dates";
import { inn } from "@/lib/inn";

export const metadata: Metadata = {
  title: "The rooms",
  description:
    "Six bedrooms at Larkspur House: silk-lined garden suite, snug under the beams, family room, four-poster, hayloft and a shepherd's hut in the orchard. Rates include breakfast.",
};

export default async function RoomsPage() {
  const rooms = await getRooms();
  const lowest = rooms.reduce((min, room) => Math.min(min, room.nightlyRate), Number.POSITIVE_INFINITY);
  const highest = rooms.reduce((max, room) => Math.max(max, room.nightlyRate), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">The rooms</p>
          <h1 className="display-xl mt-4 max-w-xl">Six rooms, and a key each.</h1>
        </div>
        <div className="lg:col-span-5 lg:pt-12">
          <p className="lede">
            All of them are in the old house except the shepherd’s hut, which is in the orchard
            and has the best view of anything we own. Every rate is for the room, per night, and
            includes breakfast — no service charge, no card required.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">
            {formatMoney(lowest)} – {formatMoney(highest)} a night · check-in from {inn.checkIn}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <RoomsExplorer rooms={rooms} />
      </div>

      <div className="mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-xl">What’s in every room</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Proper linen and blankets, a jug of fresh milk, ground coffee and a pot, a radio,
            books we have actually read, and a window that opens.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl">Rates &amp; seasons</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Rates are the same all year, with a small supplement over Christmas and New Year.
            Two nights minimum at weekends; three over a bank holiday.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl">Questions</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            If you need two rooms together, a cot, a late arrival or a dog bed, tell us when you
            write. We answer every request ourselves.
          </p>
          <Link href="/stay" className="link-arrow mt-4 inline-flex">
            Check the book
          </Link>
        </div>
      </div>
    </div>
  );
}
