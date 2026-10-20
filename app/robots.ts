import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/desk", "/api", "/stay/received"],
      },
    ],
    sitemap: "https://larkspurhouse.co.uk/sitemap.xml",
  };
}
