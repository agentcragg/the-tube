"use client";

import Link from "next/link";
import { useState } from "react";
import Ago from "@/components/Ago";
import Scrubber from "@/components/Scrubber";
import Tonight from "@/components/Tonight";
import { CalendarIcon, CanIcon, MicIcon, TicketIcon } from "@/components/Icons";
import { LAUREL_LABEL, LaurelMark, laurelLines } from "@/components/laurels";
import { londonParts, useLondonNow } from "@/lib/clock";
import { badgeTime, bookingUrl, formatDate, isPast, type Film } from "@/lib/films";
import { HOUSE_HONOUR } from "@/lib/rabbit-hole";
import { useLook, usePretendDay } from "@/lib/use-look";

// The "Coming up" box: everything still to come, a tab for nights that have
// already happened, and a search field that filters as you type.

const TABS = [
  { id: "upcoming", label: "Coming up" },
  { id: "past", label: "Past nights" },
] as const;

export default function ComingUp({ films, seats }: { films: Film[]; seats: Record<string, number> }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("upcoming");
  const [q, setQ] = useState("");
  // The Well used look, or the look switch's ?today in any look, splits on
  // the London day, so ?today moves nights into Past nights. Until the clock
  // is known, and with neither, it's isPast().
  const now = useLondonNow();
  const used = useLook("used");
  const pretend = usePretendDay();
  const today = (used || pretend) && now ? londonParts(now).isoDate : null;
  const over = (iso: string) => (today ? iso < today : isPast(iso));

  const upcoming = films.filter((f) => !over(f.date));
  const past = films.filter((f) => over(f.date)).reverse(); // most recent first
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
            {/* Counts in brackets: every night on the tab, whatever the search */}
            <span className="x-counts idea-count"> ({(t.id === "past" ? past : upcoming).length})</span>
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
            {shown.map((f) => {
              // Well used: a night that's over keeps its card, with the
              // wall's laurel, its age and "Screened" in place of Book
              const gone = over(f.date);
              return (
                <li key={f.slug}>
                  <Link href={`/films/${f.slug}`}>
                    <Scrubber frames={f.stills} seed={f.slug} alt={f.title} duration={badgeTime(f)} />
                    {gone && (
                      <span className="x-used card-laurel">
                        <LaurelMark lines={laurelLines(f.date.slice(0, 4))} label={LAUREL_LABEL} />
                      </span>
                    )}
                  </Link>
                  <h3>
                    <Link href={`/films/${f.slug}`}>{f.title}</Link>
                  </h3>
                  <p className="credit">{f.credit}</p>
                  {f.extra && (
                    <p className="extra">
                      <MicIcon /> {f.extra}
                    </p>
                  )}
                  {f.perk && (
                    <p className="extra">
                      <CanIcon /> {f.perk}
                    </p>
                  )}
                  <ul className="meta">
                    <li>
                      <CalendarIcon /> <Tonight date={f.date} fallback={formatDate(f.date)} />
                      {gone && today && (
                        <span className="x-used night-ago">
                          {" "}
                          (<Ago iso={f.date} relativeOnly />)
                        </span>
                      )}
                    </li>
                    <li>
                      <TicketIcon /> {seats[f.slug] ?? 30} of 30 seats left
                    </li>
                  </ul>
                  <a className={gone ? "book book-small no-used" : "book book-small"} href={bookingUrl(f)}>
                    Book
                  </a>
                  {gone && <span className="x-used screened">{HOUSE_HONOUR.after}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
