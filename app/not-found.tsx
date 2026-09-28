import type { Metadata } from "next";
import Link from "next/link";
import Scrubber from "@/components/Scrubber";
import { CalendarIcon } from "@/components/Icons";
import { badgeTime, films, formatDate, isPast } from "@/lib/films";
import "./errors.css";

// Any unknown address, and /films/<unknown>. A 2008 YouTube dead video: the
// black player with its apology, then the next four nights as Related Videos.

export const metadata: Metadata = { title: "Page not available · The Tube" }; // DRAFT

export default function NotFound() {
  const next = films.filter((f) => !isPast(f.date)).slice(0, 4);

  return (
    <div className="gone">
      <div className="still-frame">
        {/* DRAFT */}
        <div className="gone-box">
          <h1>We&apos;re sorry, this page is no longer available.</h1>
          <p>It may have been removed by the user. Or it was never here.</p>
        </div>
      </div>

      {next.length > 0 && (
        <section className="box">
          <div className="box-head">
            <h2>Related Videos</h2> {/* DRAFT */}
          </div>
          <div className="box-body">
            <ul className="film-grid">
              {next.map((f) => (
                <li key={f.slug}>
                  <Link href={`/films/${f.slug}`}>
                    <Scrubber frames={f.stills} seed={f.slug} alt={f.title} duration={badgeTime(f)} />
                  </Link>
                  <h3>
                    <Link href={`/films/${f.slug}`}>{f.title}</Link>
                  </h3>
                  <p className="credit">{f.credit}</p>
                  <ul className="meta">
                    <li>
                      <CalendarIcon /> {formatDate(f.date)}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
