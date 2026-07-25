import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bleetary Travels — Group Travel for Every Community",
  description:
    "Discover community-led group trips around the world. Find your adventure, join your people, and travel with Bleetary Travels.",
  keywords: "group travel, community travel, host a trip, travel community",
  openGraph: {
    title: "Bleetary Travels — Group Travel for Every Community",
    description:
      "Community-led adventures filling up fast. Find your next group trip or become a host.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
