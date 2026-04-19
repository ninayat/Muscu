import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "IronFeed — Log. Share. Get stronger.",
  description:
    "A Strava-style social app for lifters. Log your PPL workouts, detect PRs, and compete with friends.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0E1116",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
