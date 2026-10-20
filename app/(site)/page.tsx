import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { RoomCard } from "@/components/site/room-card";
import { AvailabilityGlance } from "@/components/site/availability-glance";
import { getGuestbookEntries, getMenus, getRooms } from "@/lib/queries";
import { currentSeason, formatMoney } from "@/lib/dates";
import { seasonLabel } from "@/lib/seasons";
import { inn, practicalities } from "@/lib/inn";
import { mediaUrl } from "@/lib/media";

export default async function HomePage() {
  const [rooms, menus, guestbook] = await Promise.all([
    getRooms(),
    getMenus(),
    getGuestbookEntries("approved", 3),
  ]);

  const featured = rooms.slice(0, 3);
  const season = currentSeason();
  const menu = menus.find((entry) => entry.season === season) ?? menus[0];
  const sample = menu ? pickDishes(menu.items, 4) : [];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="grid gap-10 pt-8 lg:grid-cols-12 lg:gap-14 lg:pt-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div className="fade-up">
              <p className="label">{inn.region} · since {inn.established}</p>
              <h1 className="display-xl mt-5 text-balance">
                A house at the
                <br />
                end of the lane.
              </h1>
              <p className="lede mt-6 max-w-md">
                Six bedrooms, a walled garden, and supper at seven. We are a farmhouse that
                never quite stopped being one — {inn.innkeepers} keep the book by hand, and
                answer every request themselves.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/stay" className="btn btn-primary">
                  Request a stay
                </Link>
                <Link href="/rooms" className="btn btn-outline">
                  The six rooms
                </Link>
              </div>
              <p className="mt-4 text-[11px] tracking-[0.02em] text-muted">
                No card, no deposit, no payment taken on this site.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-4 lg:mt-0">
              <div>
                <dt className="label">Rooms</dt>
                <dd className="mt-1 font-display text-2xl leading-none">{rooms.length}</dd>
              </div>
              <div>
                <dt className="label">Supper</dt>
                <dd className="mt-1 font-display text-2xl leading-none">7pm</dd>
              </div>
              <div>
                <dt className="label">From</dt>
                <dd className="mt-1 font-display text-2xl leading-none">
                  {formatMoney(Math.min(...rooms.map((room) => room.nightlyRate), 120))}
                </dd>
              </div>
            </dl>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative">
              <Photo
                src="/seed/house/arrival.jpg"
                alt="Larkspur House in late afternoon light, stone walls and climbing roses around the door"
                className="h-[54vh] min-h-[360px] w-full lg:h-[74vh]"
                sizes="(min-width: 1024px) 58vw, 100vw"
                priority
              />
              <div className="absolute bottom-0 left-0 hidden max-w-[240px] bg-paper/95 px-4 py-3 sm:block">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">The front door</p>
                <p className="mt-1 font-display text-lg leading-tight">
                  Come in. The kettle’s usually on.
                </p>
              </div>
            </div>
            <figcaption className="caption mt-2 flex items-baseline justify-between gap-4">
              <span>The house from the orchard, late September</span>
              <span className="hidden sm:inline">Photograph: T. Ellery</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <AvailabilityGlance />

      {/* The house */}
      <section className="mx-auto mt-20 max-w-[1280px] px-5 md:px-8">
        <SectionHeading
          number="01"
          eyebrow="The house"
          title={
            <>
              Built as a farmhouse in 1786.
              <br className="hidden md:block" /> It has been an inn since 1934.
            </>
          }
        />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="prose-inn max-w-xl text-[0.98rem] lg:col-span-5">
            <p>
              There are three steps up to the door, a stone flagged hall that stays cool all
              summer, and a sitting room where the fire is lit by four whether there are guests
              or not. The oak in the top field is hollow enough to sit inside; the beck at the
              bottom of the garden is loud after rain.
            </p>
            <p>
              We took the house on in 2011 with two small children, a dog and no idea. We have
              since learned to keep bees, to make a decent loaf, and not to promise the weather.
              What we can promise is a bed with proper linen, a bath you can disappear into, and
              breakfast whenever you surface.
            </p>
            <p className="text-ink">
              — Margaret &amp; Tom Ellery, innkeepers
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted">
              <span>Six rooms</span>
              <span>Walled garden</span>
              <span>No televisions</span>
              <span>Dogs welcome in three</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7">
            <figure className="col-span-1 mt-8">
              <Photo
                src="/seed/house/fire.jpg"
                alt="The sitting room fire, with two deep armchairs"
                className="aspect-[4/5]"
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
              <figcaption className="caption mt-2">The fire, lit at four.</figcaption>
            </figure>
            <figure className="col-span-1">
              <Photo
                src="/seed/house/fells.jpg"
                alt="Dry stone walls and green fells beyond the inn"
                className="aspect-[4/5]"
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
              <figcaption className="caption mt-2">The fell behind the orchard.</figcaption>
            </figure>
            <figure className="col-span-2">
              <Photo
                src="/seed/house/lawn.jpg"
                alt="The lawn and wildflower meadow in July"
                className="aspect-[21/9]"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
              <figcaption className="caption mt-2">
                The lawn, laid for supper whenever the weather allows.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="mx-auto mt-24 max-w-[1280px] px-5 md:px-8">
        <SectionHeading
          number="02"
          eyebrow="The rooms"
          title="Six rooms, no two alike."
          action={{ href: "/rooms", label: "All six rooms" }}
        />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-ink-soft">
          Every room has its own bath or shower, proper coffee, fresh milk in a jug, and a
          window worth opening. Rates are for the room, per night, and include breakfast.
        </p>
      </section>

      {/* Table */}
      <section className="mt-24 bg-moss text-parchment">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Photo
              src="/seed/table/dining.jpg"
              alt="The dining room at supper, candles on the tables"
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-parchment/50">
              One sitting · {inn.supper} · five nights a week
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-parchment/50">
              03 — At the table
            </p>
            <h2 className="display-lg mt-4 text-parchment">
              Whatever the garden gives us.
            </h2>
            <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-parchment/75">
              {menu?.intro ??
                "Three courses, cooked by Tom, served at one long sitting. The menu changes with the season and sometimes with the weather."}
            </p>

            {menu && sample.length > 0 ? (
              <div className="mt-8">
                <div className="flex items-baseline justify-between border-b border-parchment/25 pb-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-parchment/60">
                    On the {seasonLabel(menu.season).toLowerCase()} table this week
                  </span>
                  <Link
                    href="/menu"
                    className="text-[10px] uppercase tracking-[0.16em] text-parchment/70 underline-offset-4 hover:text-parchment"
                  >
                    Full menu
                  </Link>
                </div>
                <ul className="mt-3 space-y-3">
                  {sample.map((item) => (
                    <li key={item.id} className="flex items-baseline gap-3">
                      <span className="font-display text-lg leading-snug">{item.name}</span>
                      <span className="mb-1 flex-1 border-b border-dotted border-parchment/25" />
                      <span className="text-[10px] uppercase tracking-[0.14em] text-parchment/50">
                        {item.section}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link href="/menu" className="btn btn-clay">
                Read the menu
              </Link>
              <p className="text-[11px] leading-relaxed text-parchment/50">
                Residents and a handful of villagers.
                <br />
                Tell us about allergies when you write.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grounds */}
      <section className="mx-auto mt-24 max-w-[1280px] px-5 md:px-8">
        <SectionHeading
          number="04"
          eyebrow="The grounds"
          title="Two acres, a beck, and a gate that sticks."
          action={{ href: "/grounds", label: "A walk round" }}
        />
        <div className="grid gap-5 sm:grid-cols-12">
          <figure className="sm:col-span-5">
            <Photo
              src="/seed/grounds/path.jpg"
              alt="A gravel path bordered by roses and lavender"
              className="aspect-[4/5]"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />
            <figcaption className="caption mt-2">The long border, June.</figcaption>
          </figure>
          <div className="sm:col-span-7">
            <figure>
              <Photo
                src="/seed/grounds/borders.jpg"
                alt="Herbaceous borders and lawn in front of the house"
                className="aspect-[4/3]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <figcaption className="caption mt-2">The lawn from the terrace.</figcaption>
            </figure>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <figure>
                <Photo
                  src="/seed/grounds/gate.jpg"
                  alt="A stone archway with roses and an iron gate"
                  className="aspect-square"
                  sizes="20vw"
                />
                <figcaption className="caption mt-2">The walled gate.</figcaption>
              </figure>
              <div className="flex flex-col justify-end">
                <p className="text-sm leading-relaxed text-ink-soft">
                  There is a bench at the top of the orchard that faces west, a herb bed you are
                  welcome to raid, and a dozen hens who will follow you hopefully to the gate.
                  The walk up the fell starts at the back of the vegetable garden.
                </p>
                <Link href="/grounds" className="link-arrow mt-4 self-start">
                  See the photograph walk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guestbook */}
      <section className="mx-auto mt-24 max-w-[1280px] px-5 md:px-8">
        <SectionHeading
          number="05"
          eyebrow="The guestbook"
          title="Left on the hall table, in their own words."
          action={{ href: "/guestbook", label: "Read the guestbook" }}
        />
        <div className="grid gap-8 md:grid-cols-3">
          {guestbook.map((entry) => (
            <blockquote key={entry.id} className="border-t border-line pt-4">
              <p className="font-display text-xl leading-snug text-ink">“{excerpt(entry.message)}”</p>
              <footer className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
                {entry.guestName}
                {entry.location ? ` · ${entry.location}` : ""}
                {entry.stayMonth ? ` · ${entry.stayMonth}` : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Practicalities */}
      <section className="mx-auto mt-24 max-w-[1280px] px-5 md:px-8">
        <SectionHeading number="06" eyebrow="Practicalities" title="The small print, such as it is." />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {practicalities.map((item) => (
            <div key={item.title} className="border-t border-line pt-4">
              <h3 className="font-display text-lg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-[1280px] px-5 md:px-8">
        <div className="relative overflow-hidden border border-ink/15 bg-paper-deep">
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <Photo
              src="/seed/house/meadow.jpg"
              alt=""
              className="h-full w-full"
              sizes="100vw"
            />
          </div>
          <div className="relative grid gap-8 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="label">The reservations book</p>
              <h2 className="display-lg mt-4 max-w-2xl">
                Send us the dates. We’ll write back — usually the same day.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
                Requests stay pending until one of us confirms them by hand. Nothing is charged,
                and no card is asked for, now or later.
              </p>
            </div>
            <div className="flex items-end lg:col-span-5 lg:justify-end">
              <Link href="/stay" className="btn btn-primary">
                Request a stay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function excerpt(text: string, words = 38): string {
  const parts = text.split(/\s+/);
  return parts.length <= words ? text : `${parts.slice(0, words).join(" ")}…`;
}

function pickDishes<T extends { section: string }>(items: T[], count: number): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.section)) continue;
    seen.add(item.section);
    out.push(item);
    if (out.length === count) break;
  }
  if (out.length < count) {
    for (const item of items) {
      if (out.includes(item)) continue;
      out.push(item);
      if (out.length === count) break;
    }
  }
  return out;
}
