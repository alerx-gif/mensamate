import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mensa Mate",
  description: "Your daily university menu planner",
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
