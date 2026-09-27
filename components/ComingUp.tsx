"use client";

import Link from "next/link";
import { useState } from "react";
import Scrubber from "@/components/Scrubber";
import { CalendarIcon, TicketIcon } from "@/components/Icons";
import { badgeTime, bookingUrl, formatDate, type Film } from "@/lib/films";

// The "Coming up" box: YouTube-style sort tabs plus a search field that
// filters the grid as you type.

const TABS = [
  { id: "next", label: "Next four weeks" },
  { id: "all", label: "All season" },
  { id: "past", label: "Past nights" },
] as const;

function CalendarPage({ iso }: { iso: string }) {
  const d = new Date(iso + "T00:00:00");
  return (
    <span className="cal-page" aria-hidden>
      <span className="cal-month">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
      <span className="cal-day">{d.getDate()}</span>
      <span className="cal-weekday">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
    </span>
  );
}

export default function ComingUp({ films, seats }: { films: Film[]; seats: Record<string, number> }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("next");
  const [q, setQ] = useState("");

  const first = new Date(films[0].date + "T00:00:00");
  const cutoff = new Date(first);
  cutoff.setDate(cutoff.getDate() + 28);

  const shown = films
    .filter((f) => {
      if (tab === "past") return false; // nothing has screened yet
      if (tab === "next") return new Date(f.date + "T00:00:00") < cutoff;
      return true;
    })
    .filter((f) => !q || `${f.title} ${f.credit}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="box">
      <div className="box-head">
        <h2>Coming up at The Tube</h2>
        <form className="box-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search films"
            aria-label="Search films"
          />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="box-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "on" : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="box-body">
        {shown.length === 0 ? (
          <p className="box-empty">
            {tab === "past"
              ? `No past nights yet. The first is on ${formatDate(films[0].date)}.`
              : "Nothing matches that."}
          </p>
        ) : (
          <ul className="film-grid">
            {shown.map((f) => (
              <li key={f.slug}>
                <div className="card-still">
                  <Link href={`/films/${f.slug}`}>
                    <Scrubber frames={f.stills} seed={f.slug} alt={f.title} duration={badgeTime(f)} />
                  </Link>
                  {/* Starbursts: only shown when that Style lab idea is on */}
                  {f.slug === films[0].slug && <span className="sticker sticker-next">Next up!</span>}
                  {(seats[f.slug] ?? 30) <= 10 && (
                    <span className="sticker sticker-seats">
                      Only {seats[f.slug]} seats left!
                    </span>
                  )}
                </div>
                {/* Calendar page: only shown when that Style lab idea is on */}
                <CalendarPage iso={f.date} />
                <h3>
                  <Link href={`/films/${f.slug}`}>{f.title}</Link>
                </h3>
                <p className="credit">{f.credit}</p>
                <ul className="meta">
                  <li className="meta-date">
                    <CalendarIcon /> {formatDate(f.date)}
                  </li>
                  <li className="meta-seats">
                    <TicketIcon /> {seats[f.slug] ?? 30} of 30 seats left
                  </li>
                  <li className="seat-meter" aria-hidden>
                    <span style={{ width: `${((30 - (seats[f.slug] ?? 30)) / 30) * 100}%` }} />
                    <em>{seats[f.slug] ?? 30} of 30 seats left</em>
                  </li>
                </ul>
                <a className="book book-small" href={bookingUrl(f)}>
                  Book
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
