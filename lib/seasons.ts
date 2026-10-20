export type Season = "spring" | "summer" | "autumn" | "winter";

export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

export function seasonLabel(season: Season): string {
  switch (season) {
    case "spring":
      return "Spring";
    case "summer":
      return "Summer";
    case "autumn":
      return "Autumn";
    default:
      return "Winter";
  }
}

export const seasonMeta: Record<
  Season,
  { label: string; months: string; note: string; photo: string; alt: string }
> = {
  spring: {
    label: "Spring",
    months: "March to May",
    note: "Wild garlic from the beck, the first asparagus, rhubarb forced in the dark under a bucket.",
    photo: "/seed/grounds/path.jpg",
    alt: "Roses and lavender along the garden path in early summer",
  },
  summer: {
    label: "Summer",
    months: "June to August",
    note: "Peas, courgettes that get away from us, strawberries, and supper laid on the lawn whenever it stays dry.",
    photo: "/seed/grounds/summer.jpg",
    alt: "The wildflower meadow at the bottom of the garden in high summer",
  },
  autumn: {
    label: "Autumn",
    months: "September to November",
    note: "Damsons and apples from the orchard, game from the valley, and the fire lit earlier each evening.",
    photo: "/seed/table/plate-autumn.jpg",
    alt: "A plate of venison with seasonal vegetables",
  },
  winter: {
    label: "Winter",
    months: "December to February",
    note: "Roots from the store, beef and ale pie, mutton hotpot, and a great deal of butter.",
    photo: "/seed/house/fire.jpg",
    alt: "The sitting room fire with two deep armchairs",
  },
};

export const dietaryKey: { code: string; label: string }[] = [
  { code: "v", label: "Vegetarian" },
  { code: "vg", label: "Vegan" },
  { code: "gf", label: "Gluten-free" },
];
