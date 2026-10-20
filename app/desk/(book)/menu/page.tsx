import type { Metadata } from "next";
import Link from "next/link";
import { getMenus, groupMenuSections } from "@/lib/queries";
import { MenuDetailsForm, AddDishForm } from "@/components/desk/menu-editor";
import { updateMenuItem } from "@/lib/actions/desk";
import { DeleteDishButton } from "@/components/desk/confirm-submit";
import { SEASONS, seasonLabel, seasonMeta, type Season } from "@/lib/seasons";
import { currentSeason, formatDayMonth } from "@/lib/dates";
import { clsx } from "@/lib/clsx";

export const metadata: Metadata = { title: "Menu" };

export default async function DeskMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const query = await searchParams;
  const menus = await getMenus({ includeUnpublished: true });
  const seasonal = currentSeason();
  const active: Season = SEASONS.includes(query.season as Season)
    ? (query.season as Season)
    : menus.some((menu) => menu.season === seasonal)
      ? seasonal
      : (menus[0]?.season ?? "autumn");

  const menu = menus.find((entry) => entry.season === active);
  const sections = menu ? groupMenuSections(menu) : [];
  const sectionNames = sections.map((section) => section.section);

  return (
    <div className="mx-auto max-w-[1180px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The kitchen</p>
          <h1 className="display-lg mt-2">Menus by season.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Four menus, one for each season. Only the published ones appear on the website; the
            current season is shown first to guests.
          </p>
        </div>
        <Link href="/menu" className="btn btn-ghost btn-sm" target="_blank">
          View the menu page ↗
        </Link>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3" aria-label="Seasons">
        {SEASONS.map((season) => (
          <Link
            key={season}
            href={`/desk/menu?season=${season}`}
            className={clsx(
              "border px-3 py-1.5 text-[11.5px] transition-colors",
              season === active ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
            )}
            aria-current={season === active ? "page" : undefined}
          >
            {seasonLabel(season)}
            {season === seasonal ? (
              <span className={clsx("ml-1.5 text-[9px] uppercase", season === active ? "text-paper/60" : "text-clay")}>
                now
              </span>
            ) : null}
            {menus.find((entry) => entry.season === season)?.isPublished ? null : (
              <span className="ml-1.5 text-[9px] uppercase text-muted">draft</span>
            )}
          </Link>
        ))}
      </nav>

      {!menu ? (
        <p className="mt-6 border border-line bg-parchment p-5 text-sm text-ink-soft">
          No menu exists for {seasonLabel(active)} yet. Seed the database with{" "}
          <span className="font-mono">npm run db:seed</span> to bring in the four seasons.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-4">
            <div className="border border-line bg-parchment p-4">
              <h2 className="display-sm">{seasonLabel(active)}</h2>
              <p className="mt-1 text-[11px] text-muted">
                {seasonMeta[active].months} · updated {formatDayMonth(menu.updatedAt.slice(0, 10))}
              </p>
              <div className="mt-4">
                <MenuDetailsForm menu={menu} />
              </div>
            </div>

            <div className="mt-4 border border-line bg-parchment p-4">
              <h2 className="font-display text-lg">Add a dish</h2>
              <p className="mt-1 text-[11px] text-muted">
                Codes: v vegetarian, vg vegan, gf gluten-free.
              </p>
              <div className="mt-3">
                <AddDishForm menuId={menu.id} sections={sectionNames} />
              </div>
            </div>
          </section>

          <section className="lg:col-span-8">
            <div className="flex items-baseline justify-between border-b border-ink pb-2">
              <h2 className="display-sm">Dishes</h2>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
                {menu.items.length} in total
              </span>
            </div>

            <div className="mt-3 space-y-6">
              {sections.map((section) => (
                <div key={section.section}>
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted">{section.section}</h3>
                  <ul className="mt-2 space-y-2">
                    {section.items.map((item) => (
                      <li key={item.id} className="border border-line bg-parchment p-2.5">
                        <form action={updateMenuItem} className="space-y-2">
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="menuId" value={menu.id} />
                          <div className="grid gap-2 sm:grid-cols-[2fr_2fr_1fr]">
                            <input
                              name="name"
                              defaultValue={item.name}
                              aria-label="Dish name"
                              className="field py-1.5 text-[12.5px]"
                            />
                            <input
                              name="description"
                              defaultValue={item.description}
                              aria-label="Description"
                              className="field py-1.5 text-[12.5px]"
                              placeholder="Description"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                name="section"
                                defaultValue={item.section}
                                aria-label="Section"
                                className="field py-1.5 text-[11px]"
                                list={`desk-sections-${menu.id}`}
                              />
                              <input
                                name="dietary"
                                defaultValue={item.dietary.join(", ")}
                                aria-label="Dietary codes"
                                className="field py-1.5 text-[11px]"
                                placeholder="v, gf"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted">
                              {item.dietary.length > 0 ? item.dietary.join(" · ") : "no codes"}
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="submit"
                                className="text-[10px] uppercase tracking-[0.12em] text-ink-soft underline underline-offset-4 hover:text-ink"
                              >
                                Save
                              </button>
                              <DeleteDishButton itemId={item.id} name={item.name} />
                            </div>
                          </div>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <datalist id={`desk-sections-${menu.id}`}>
              {sectionNames.map((section) => (
                <option key={section} value={section} />
              ))}
            </datalist>
          </section>
        </div>
      )}
    </div>
  );
}
