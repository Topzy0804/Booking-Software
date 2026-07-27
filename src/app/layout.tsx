import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});


export const metadata: Metadata = {
  title: "Booking MVP",
  description: "Multi-tenant booking platform",
  other: { "color-scheme": "light" },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body antialiased">
        {children}
        <Toaster position='bottom-right' richColors />
        <Analytics />
      </body>
    </html>
  );
}