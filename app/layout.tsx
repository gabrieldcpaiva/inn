import type { Metadata } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import { inn } from "@/lib/inn";

export const metadata: Metadata = {
  metadataBase: new URL("https://larkspurhouse.co.uk"),
  title: {
    default: `${inn.name} — a country inn in the Lune Valley`,
    template: `%s · ${inn.name}`,
  },
  description:
    "Six rooms, a walled garden and supper at seven. A hand-run country inn at Underley, near Kirkby Lonsdale in Cumbria. Send a stay request; no payment is taken online.",
  keywords: [
    "country inn",
    "Cumbria",
    "Kirkby Lonsdale",
    "Lune Valley",
    "bed and breakfast",
    "rooms",
  ],
  openGraph: {
    type: "website",
    title: `${inn.name} — a country inn in the Lune Valley`,
    description:
      "Six rooms, a walled garden and supper at seven. Requests are read by the innkeeper, not an algorithm.",
    images: ["/seed/house/arrival.jpg"],
    locale: "en_GB",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
