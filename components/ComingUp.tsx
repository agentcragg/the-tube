"use client";

import Link from "next/link";
import { useState } from "react";
import Scrubber from "@/components/Scrubber";
import { CalendarIcon, TicketIcon } from "@/components/Icons";
import { badgeTime, bookingUrl, formatDate, isPast, type Film } from "@/lib/films";

// The "Coming up" box: everything still to come, a tab for nights that have
// already happened, and a search field that filters as you type.

const TABS = [
  { id: "upcoming", label: "Coming up" },
  { id: "past", label: "Past nights" },
] as const;

export default function ComingUp({ films, seats }: { films: Film[]; seats: Record<string, number> }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("upcoming");
  const [q, setQ] = useState("");

  const upcoming = films.filter((f) => !isPast(f.date));
  const past = films.filter((f) => isPast(f.date)).reverse(); // most recent first
  const shown = (tab === "past" ? past : upcoming).filter(
    (f) => !q || `${f.title} ${f.credit}`.toLowerCase().includes(q.toLowerCase()),
  );

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
              ? upcoming.length
                ? `No past nights yet. The first is on ${formatDate(upcoming[0].date)}.`
                : "No past nights yet."
              : "Nothing matches that."}
          </p>
        ) : (
          <ul className="film-grid">
            {shown.map((f) => (
              <li key={f.slug} style={{ "--film": f.colour } as React.CSSProperties}>
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
                  <li>
                    <TicketIcon /> {seats[f.slug] ?? 30} of 30 seats left
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
