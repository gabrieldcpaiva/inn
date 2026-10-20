import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://larkspurhouse.co.uk";
  const rooms = await getRooms();
  const pages = ["", "/rooms", "/stay", "/menu", "/grounds", "/guestbook", "/find-us"];
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...rooms.map((room) => ({
      url: `${base}/rooms/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
