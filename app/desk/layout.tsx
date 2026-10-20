import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Innkeeper’s desk", template: "%s · Innkeeper’s desk" },
  robots: { index: false, follow: false },
};

export default function DeskRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 min-h-screen bg-paper">{children}</div>;
}
