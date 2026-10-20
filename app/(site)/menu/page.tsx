import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { getMenus } from "@/lib/queries";
import { groupMenuSections } from "@/lib/queries";
import { currentSeason, todayISO, formatDayMonth } from "@/lib/dates";
import { SEASONS, dietaryKey, seasonLabel, seasonMeta, type Season } from "@/lib/seasons";
import { inn } from "@/lib/inn";
import { clsx } from "@/lib/clsx";
import type { MenuItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "At the table",
  description:
    "The seasonal menu at Larkspur House: one sitting at seven, three courses, cooked from the kitchen garden and the Lune Valley. Menus change with the season.",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const query = await searchParams;
  const menus = await getMenus();
  const today = todayISO();
  const seasonal = currentSeason();
  const requested = SEASONS.includes(query.season as Season) ? (query.season as Season) : null;
  const active: Season =
    requested && menus.some((menu) => menu.season === requested)
      ? requested
      : menus.some((menu) => menu.season === seasonal)
        ? seasonal
        : menus[0]?.season ?? "autumn";

  const menu = menus.find((entry) => entry.season === active);
  const sections = menu ? groupMenuSections(menu) : [];
  const meta = seasonMeta[active];

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="label">At the table</p>
          <h1 className="display-xl mt-4 max-w-2xl">
            One sitting,
            <br />
            at seven.
          </h1>
          <p className="lede mt-5 max-w-xl">
            Tom cooks, Maggie runs the room, and the menu follows the garden. Three courses,
            cooked to order, served at one long sitting in the old dining room — or on the lawn
            if the evening behaves.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4 text-sm">
            <div>
              <p className="label">Supper</p>
              <p className="mt-1">Every evening except Monday and Tuesday</p>
            </div>
            <div>
              <p className="label">Sitting</p>
              <p className="mt-1">{inn.supper} sharp</p>
            </div>
            <div>
              <p className="label">For residents</p>
              <p className="mt-1">Always a table kept back</p>
            </div>
          </div>
        </div>
        <figure className="lg:col-span-5">
          <Photo
            src={meta.photo}
            alt={meta.alt}
            className="aspect-[4/5]"
            sizes="(min-width: 1024px) 38vw, 100vw"
            priority
          />
          <figcaption className="caption mt-2">
            {meta.label} at Larkspur House · {meta.note}
          </figcaption>
        </figure>
      </div>

      <nav className="mt-12 flex flex-wrap gap-2 border-y border-line py-3" aria-label="Seasons">
        {SEASONS.map((season) => {
          const hasMenu = menus.some((entry) => entry.season === season);
          const isActive = season === active;
          const className = clsx(
            "group flex items-baseline gap-2 border px-3.5 py-2 text-[11.5px] uppercase tracking-[0.14em] transition-colors",
            isActive
              ? "border-moss bg-moss text-parchment"
              : "border-line text-ink-soft hover:border-ink hover:text-ink",
            !hasMenu && "opacity-40",
          );
          const inner = (
            <>
              {seasonLabel(season)}
              {season === seasonal ? (
                <span
                  className={clsx(
                    "text-[8.5px] tracking-[0.12em]",
                    isActive ? "text-parchment/60" : "text-clay",
                  )}
                >
                  now
                </span>
              ) : null}
            </>
          );
          return hasMenu ? (
            <Link key={season} href={`/menu?season=${season}`} className={className} aria-current={isActive ? "page" : undefined}>
              {inner}
            </Link>
          ) : (
            <span key={season} className={className}>
              {inner}
            </span>
          );
        })}
      </nav>

      {menu ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="label">{meta.months}</p>
              <h2 className="display-lg mt-3">{menu.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{menu.intro}</p>
              <div className="mt-6 border-t border-line pt-4">
                <p className="label">A note on the menu</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  Everything is cooked to order, so a dish occasionally runs out. Tell us about
                  allergies or dislikes when you write, and we will cook around them. Children
                  can have smaller plates of anything on the menu.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {dietaryKey.map((item) => (
                  <span key={item.code} className="tag">
                    <span className="font-display text-[13px]">{item.code}</span>
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="mt-6 border-t border-line pt-4">
                <p className="label">To book a table</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  Residents: tell us when you send your stay request. Villagers and passers-by:
                  telephone{" "}
                  <a href={`tel:${inn.phoneHref}`} className="underline underline-offset-4">
                    {inn.phone}
                  </a>{" "}
                  or write to{" "}
                  <a href={`mailto:${inn.email}`} className="underline underline-offset-4">
                    {inn.email}
                  </a>
                  .
                </p>
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-muted">
                Menu updated {formatDayMonth(menu.updatedAt.slice(0, 10))}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {sections.map((section) => (
                <section key={section.section} className="break-inside-avoid">
                  <h3 className="flex items-baseline justify-between gap-4 border-b border-ink pb-2">
                    <span className="font-display text-xl">{section.section}</span>
                    <span className="text-[9.5px] uppercase tracking-[0.16em] text-muted">
                      {section.items.length} {section.items.length === 1 ? "dish" : "dishes"}
                    </span>
                  </h3>
                  <ul className="mt-3 space-y-4">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-[1.05rem] leading-snug">{item.name}</span>
                          <Dietary codes={item.dietary} />
                        </div>
                        {item.description ? (
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                            {item.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <p className="max-w-md text-[12px] leading-relaxed text-muted">
                Vegetarian dishes are marked v, vegan vg, gluten-free gf. The kitchen handles
                nuts, gluten, dairy and shellfish, so please tell us what to avoid.
              </p>
              <Link href="/stay" className="btn btn-primary">
                Stay the night
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 border border-line bg-parchment p-8">
          <p className="font-display text-2xl">The kitchen is between menus.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Nothing is published for {seasonLabel(active)} just yet. Telephone the inn and we
            will tell you what’s cooking.
          </p>
        </div>
      )}
    </div>
  );
}

function Dietary({ codes }: { codes: MenuItem["dietary"] }) {
  if (!codes || codes.length === 0) return null;
  return (
    <span className="flex gap-1 text-[9.5px] uppercase tracking-[0.08em] text-muted" aria-label={codes.join(", ")}>
      {codes.map((code) => (
        <span key={code} className="rounded-sm border border-line px-1 py-px">
          {code}
        </span>
      ))}
    </span>
  );
}
