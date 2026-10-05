import type { Metadata } from "next";
import Link from "next/link";
import Channel from "@/components/Channel";
import { EndeavourStrip } from "@/components/endeavour";
import DarkMode from "@/components/DarkMode";
import Header from "@/components/Header";
import LookMenu from "@/components/LookMenu";
import NavSpinner from "@/components/NavSpinner";
import TabTitle from "@/components/TabTitle";
import Ticker from "@/components/Ticker";
import Tune from "@/components/Tune";
import { films, formatDate, isPast, VENUE } from "@/lib/films";
import { DARK_SCRIPT } from "@/lib/dark";
import { LOOK_SCRIPT } from "@/lib/look";
import "./globals.css";
import "./watch.css";
import "./endeavour.css";
import "./laurels.css";
import "./queue.css";
// The look switch's options go last so they win over the defaults above
import "./looks.css";
import "./ideas.css";
import "./idea-channel.css";
import "./idea-tune.css";
import "./dark.css";
import "./idea-pumpkin.css";
import "./idea-fireworks.css";
import "./idea-cycle.css";
import "./spinner.css";
import "./idea-ticker.css";
import "./idea-yellowfade.css";
import "./idea-dither.css";
import "./idea-letterboard.css";
import "./idea-leader.css";
import "./idea-handout.css";

export const metadata: Metadata = {
  title: "The Tube",
  description: "A weekly microcinema for internet film. Every Tuesday at Endeavour, Deptford.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The look switch adds classes to <html> before React loads
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOOK_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: DARK_SCRIPT }} />
      </head>
      <body>
        <div className="page">
          <Header />
          <Ticker />
          <main>{children}</main>
          <footer className="site-footer">
            <EndeavourStrip films={films} />
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
        <Channel />
        <Tune />
        <NavSpinner />
        <LookMenu />
        <DarkMode />
        <TabTitle films={films} />
      </body>
    </html>
  );
}
