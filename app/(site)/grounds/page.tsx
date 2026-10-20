import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { clsx } from "@/lib/clsx";

export const metadata: Metadata = {
  title: "The grounds",
  description:
    "A photograph walk around the two acres at Larkspur House: the walled garden, the long border, the orchard, the meadow, the beck and the path up the fell.",
};

const walk = [
  {
    number: "i",
    title: "The long border",
    photo: "/seed/grounds/path.jpg",
    alt: "A gravel path with roses, lavender and lupins either side",
    caption: "June, looking east",
    body:
      "Roses and lavender either side of a gravel path, and a bench that is always in the way. Maggie plants it for the bees and cuts it for the house; there is a bucket by the gate if you would like to take any home.",
    aspect: "aspect-[4/5]",
  },
  {
    number: "ii",
    title: "The walled gate",
    photo: "/seed/grounds/gate.jpg",
    alt: "A stone archway with climbing roses and an open iron gate",
    caption: "The old kitchen garden",
    body:
      "The wall was built to keep the wind and the rabbits out, and it still does. The gate sticks in damp weather — lift it, don’t push. Beyond it, the raised beds, the fruit cage and the potting shed where the tools live.",
    aspect: "aspect-[3/2]",
  },
  {
    number: "iii",
    title: "The lawn",
    photo: "/seed/grounds/borders.jpg",
    alt: "Deep herbaceous borders behind a wide lawn",
    caption: "Cut on Fridays, mown again by Sunday",
    body:
      "The lawn is where most of the summer happens: breakfast in the shade, supper under the pergola, and the occasional wedding that gets entirely out of hand. The borders behind it are our pride and the reason Tom is never allowed to weed alone.",
    aspect: "aspect-[16/10]",
  },
  {
    number: "iv",
    title: "The meadow",
    photo: "/seed/grounds/summer.jpg",
    alt: "A wildflower meadow with a mown path running through it",
    caption: "Left long since 2015",
    body:
      "We stopped cutting the bottom field and the wildflowers came back on their own: knapweed, ox-eye daisies, orchids if you look properly. There is a mown path through the middle, and if you walk it slowly enough you will see more insects than you can name.",
    aspect: "aspect-[4/5]",
  },
  {
    number: "v",
    title: "The orchard",
    photo: "/seed/house/meadow.jpg",
    alt: "The meadow path in late summer",
    caption: "Apples, damsons and a hive or two",
    body:
      "Twelve old trees, a beehive, and the shepherd’s hut parked at the far end. In September the apples fall all night and sound like someone knocking. There is a bench facing west; take a glass down at seven and you’ll understand.",
    aspect: "aspect-[16/10]",
  },
  {
    number: "vi",
    title: "The top field",
    photo: "/seed/house/sheep.jpg",
    alt: "Sheep grazing under dry stone walls and fells",
    caption: "Borrowed sheep, most years",
    body:
      "Through the gate at the top of the orchard, the land rises to a borrowed flock and a line of dry stone wall. The path up the fell starts here. It is a proper walk — boots, and tell us if you’re going so we don’t worry.",
    aspect: "aspect-[4/5]",
  },
];

const stops = [
  "Out of the front door, left along the terrace, past the lavender.",
  "Through the walled gate — lift it — and up the path between the beds.",
  "Across the lawn, under the pergola, and down to the meadow.",
  "Through the orchard, past the beehive, to the bench facing west.",
  "On up through the top field, and out onto the fell.",
];

export default function GroundsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">The grounds</p>
          <h1 className="display-xl mt-4 max-w-xl">
            Two acres,
            <br />
            and a gate that sticks.
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-12">
          <p className="lede">
            A walled kitchen garden, a long border, an orchard with a beehive in it, a meadow we
            stopped mowing, and a beck at the bottom that is louder than you expect. You are
            welcome anywhere, including the potting shed.
          </p>
        </div>
      </div>

      <figure className="mt-10">
        <Photo
          src="/seed/grounds/borders.jpg"
          alt="Herbaceous borders and lawn in front of Larkspur House"
          className="aspect-[21/9] w-full"
          sizes="100vw"
          priority
        />
        <figcaption className="caption mt-2 flex justify-between gap-4">
          <span>The lawn and the long border, August</span>
          <span className="hidden sm:inline">Photographs: T. Ellery</span>
        </figcaption>
      </figure>

      <div className="mt-16 grid gap-x-10 gap-y-16 md:grid-cols-12">
        {walk.map((entry, index) => {
          const flip = index % 2 === 1;
          return (
            <article key={entry.title} className="md:col-span-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className={clsx("lg:col-span-6", flip ? "lg:order-2 lg:col-start-7" : "lg:col-start-1")}>
                <figure>
                  <Photo
                    src={entry.photo}
                    alt={entry.alt}
                    className={entry.aspect}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                  <figcaption className="caption mt-2">{entry.caption}</figcaption>
                </figure>
              </div>
              <div className={clsx("mt-4 lg:col-span-5 lg:mt-0", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{entry.number}</p>
                <h2 className="display-md mt-2">{entry.title}</h2>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">{entry.body}</p>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-20 grid gap-10 border-t border-ink pt-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label">The walk</p>
          <h2 className="display-lg mt-3">Twenty minutes, if you dawdle.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            There is no map, because there is only one path. Take a glass of something with you.
          </p>
        </div>
        <ol className="lg:col-span-7 lg:col-start-6">
          {stops.map((stop, index) => (
            <li key={stop} className="flex gap-4 border-b border-line py-3">
              <span className="w-6 shrink-0 font-display text-lg text-clay">{index + 1}</span>
              <span className="text-sm text-ink-soft">{stop}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        <div className="border-t border-line pt-4">
          <h3 className="font-display text-lg">Dogs</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Welcome in the orchard and the meadow, on a lead near the hens and the sheep. There
            is a bowl of water by the boot room door and a towel you may use.
          </p>
        </div>
        <div className="border-t border-line pt-4">
          <h3 className="font-display text-lg">The beck</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Cold, fast after rain, and not for swimming. Children should be within sight of it
            rather than in it. The stepping stones are slippery and we mean it.
          </p>
        </div>
        <div className="border-t border-line pt-4">
          <h3 className="font-display text-lg">The hens</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            They will follow you. They are not starving; they are optimists. Kitchen scraps go
            in the bucket by the back door, not over the fence.
          </p>
        </div>
      </section>

      <SectionHeading
        className="mt-20"
        number="—"
        eyebrow="A last thing"
        title="The garden is not a museum. Sit on the grass."
        action={{ href: "/stay", label: "Stay the night" }}
      />
      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
        Every photograph on this page was taken within a hundred paces of the front door. If you
        would like to see it in the flesh, the book is open — and <Link href="/rooms" className="underline underline-offset-4">the rooms</Link> are
        a good place to start.
      </p>
    </div>
  );
}
