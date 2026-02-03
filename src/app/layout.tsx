import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Mensa Mate",
  description: "Your daily university menu planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className={styles.navbar}>
          <a href="/" className={styles.brand}>
            <span className={styles.brandMensa}>Mensa</span>
            <span className={styles.brandMate}>Mate</span>
          </a>
          <span className={styles.alphaTag}>ALPHA</span>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
