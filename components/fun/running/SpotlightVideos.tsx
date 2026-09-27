"use client";

import Link from "next/link";
import { TvIcon } from "@/components/Icons";
import Scrubber from "@/components/Scrubber";
import { daysBetween, londonParts, useLondonNow } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { COPY, type Night } from "@/lib/fun/nights";
import { thumb } from "@/lib/videos";
import { length, shortDay, youtube } from "./timeline";

// Front page sidebar, for the six days after a night: that night's shorts,
// presented by whoever picked them, the way 2008 YouTube's Spotlight was.
// The server can't know the date, so it renders nothing until the browser does.

export type SpotlightNight = { film: Film; night: Night };

// Plain grey figure, for when there's no photo or drawing
const Figure = () => (
  <svg viewBox="0 0 30 30" width="30" height="30" aria-hidden>
    <rect width="30" height="30" fill="#e4e4e4" />
    <circle cx="15" cy="11.5" r="5.5" fill="#b5b5b5" />
    <path d="M4 30c0-6.5 5-10.5 11-10.5S26 23.5 26 30z" fill="#b5b5b5" />
  </svg>
);

export default function SpotlightVideos({
  nights,
  channels,
}: {
  nights: SpotlightNight[];
  channels: Record<string, string>;
}) {
  const now = useLondonNow();
  if (!now) return null;
  const today = londonParts(now).isoDate;
  const last = nights
    .map((n) => ({ ...n, after: daysBetween(n.film.date, today) }))
    .filter((n) => n.after >= 1 && n.after <= 6)
    .sort((a, b) => a.after - b.after)[0];
  const shorts = last?.night.shorts?.items;
  if (!last || !shorts?.length) return null;

  const { film, night } = last;
  const name = night.presentedBy;
  return (
    <section className="box run-spot" style={{ "--film": film.colour } as React.CSSProperties}>
      <div className="box-head">
        <h2>
          <TvIcon /> {COPY.spotlight}
        </h2>
      </div>
      <div className="box-body">
        <p className="run-spot-sub">
          {COPY.shownBefore} <Link href={`/films/${film.slug}`}>{film.title}</Link>, {shortDay(film.date)}
        </p>
        {night.note && <p className="run-spot-note">{night.note}</p>}
        {name && (
          <p className="run-spot-by">
            <span className="run-spot-avatar">
              {night.presenterAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={night.presenterAvatar} alt="" width={30} height={30} />
              ) : (
                <Figure />
              )}
            </span>
            <span>
              {COPY.presentedBy}
              <br />
              {night.presenterUrl ? (
                <a href={night.presenterUrl}>
                  <strong>{name}</strong>
                </a>
              ) : (
                <strong>{name}</strong>
              )}
            </span>
          </p>
        )}
        <ul className="mini-list run-spot-list">
          {shorts.map((s) => {
            const year = s.uploaded?.slice(-4);
            const by = [channels[s.id] && `by ${channels[s.id]}`, year].filter(Boolean).join(" · ");
            return (
              <li key={s.id}>
                <a href={youtube(s.id)} target="_blank" rel="noreferrer">
                  <Scrubber
                    frames={[thumb(s.id, "mq"), thumb(s.id, 1), thumb(s.id, 2), thumb(s.id, 3)]}
                    seed={s.id}
                    alt=""
                    duration={length(s.seconds)}
                    lazy
                  />
                  <span>
                    <strong>{s.title}</strong>
                    {by && <em>{by}</em>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
