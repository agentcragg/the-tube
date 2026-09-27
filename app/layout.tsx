import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { films, formatDate, isPast, VENUE } from "@/lib/films";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tube",
  description: "A weekly microcinema for internet film. Every Tuesday at Endeavour, Deptford.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body>
        <div className="page">
          <Header />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="footer-fat">
              <section>
                <h3>Coming up</h3>
                <ul>
                  {films.filter((f) => !isPast(f.date)).slice(0, 2).map((f) => (
                    <li key={f.slug}>
                      <Link href={`/films/${f.slug}`}>{f.title}</Link>
                      <span>{formatDate(f.date)}</span>
                    </li>
                  ))}
                  {films.filter((f) => !isPast(f.date)).length > 2 && (
                    <li>
                      <Link href="/">Full programme »</Link>
                    </li>
                  )}
                </ul>
              </section>
              <section>
                <h3>Visit</h3>
                <p>
                  {VENUE.lines.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </p>
              </section>
              <section>
                <h3>The Tube</h3>
                <ul>
                  <li>
                    <Link href="/">What&apos;s on</Link>
                  </li>
                  <li>
                    <Link href="/wall">Suggest a video</Link>
                  </li>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                </ul>
              </section>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
