"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MicIcon } from "@/components/Icons";
import { useLondonNow } from "@/lib/clock";
import { badgeTime, type Film } from "@/lib/films";
import { COPY, nightFor } from "@/lib/fun/nights";
import { thumb } from "@/lib/videos";
import { clock, length, onNow, secondsInto, timeline, youtube, type Item } from "./timeline";
import { useIdeaOn } from "./useIdeaOn";

// Front page, Tuesday evenings only: what's on downstairs right now. Nothing
// on the server (the page can't know the time), and nothing outside doors to
// half an hour after the end, so it can't announce the wrong night. Shorts
// open as they're shown; what's still to come stays sealed or greyed.

function findTonight(films: Film[], now: Date) {
  for (const film of films) {
    const t = secondsInto(film.date, now);
    const plan = timeline(film, nightFor(film.slug));
    if (t >= plan.doors && t < plan.close) return { film, t, ...plan };
  }
  return null;
}

// Puts a title on the tab and returns how to take it off again. Next.js can
// write the page's own title back after this runs (its metadata streams in),
// so that gets undone; any other title (another page's) is left alone.
function holdTabTitle(title: string) {
  const before = document.title;
  document.title = title;
  const observer = new MutationObserver(() => {
    if (document.title === before) document.title = title;
  });
  observer.observe(document.head, { subtree: true, childList: true, characterData: true });
  return () => {
    observer.disconnect();
    if (document.title === title) document.title = before;
  };
}

const itemTitle = (item: Item, film: Film) =>
  item.kind === "short" ? item.short.title : item.kind === "feature" ? film.title : item.label;

export default function LiveBand({ films }: { films: Film[] }) {
  const now = useLondonNow();
  const on = useIdeaOn("running");
  const row = useRef<HTMLOListElement>(null);

  const night = now ? findTonight(films, now) : null;
  const current = night ? onNow(night.items, night.t) : -1;
  const phase = !night ? null : night.t >= night.end ? "done" : current < 0 ? "doors" : "on";
  const showing = night && phase === "on" ? itemTitle(night.items[current], night.film) : null;

  // The tab says what's on, and goes back when it's over or the idea is off
  useEffect(() => (on && showing ? holdTabTitle(COPY.tabTitle(showing)) : undefined), [on, showing]);

  // On a narrow screen the row scrolls; open it on whatever's on
  useEffect(() => {
    const r = row.current;
    const li = r?.children[Math.max(current, 0)] as HTMLElement | undefined;
    if (r && li) r.scrollLeft = li.offsetLeft - parseFloat(getComputedStyle(r).paddingLeft);
  }, [on, current, night?.film.slug]);

  if (!night) return null;
  const { film, t, items } = night;
  const firstStart = items[0].start;

  return (
    <section
      className="run-band"
      style={{ "--film": film.colour } as React.CSSProperties}
      aria-label={COPY.bandLabel(film.title)}
    >
      <p className="run-band-caption">
        {phase === "doors"
          ? COPY.bandDoors(clock(firstStart))
          : phase === "done"
            ? COPY.bandDone
            : items[current].kind === "extra"
              ? COPY.bandTalk
              : COPY.bandOn}
      </p>
      <ol className="run-band-row" ref={row}>
        {items.map((item, i) => {
          const isNow = phase === "on" && i === current;
          const started = t >= item.start;
          const state = isNow ? "is-now" : started ? "is-done" : "is-next";
          const label = (
            <span className="run-band-label">
              <time>{clock(item.start)}</time> {item.kind === "short" && !started ? <em>{COPY.sealed}</em> : itemTitle(item, film)}
            </span>
          );

          if (item.kind === "short") {
            const { short } = item;
            return (
              <li key={short.id} className={started ? state : `${state} is-sealed`} aria-current={isNow || undefined}>
                {started ? (
                  <a href={youtube(short.id)} target="_blank" rel="noreferrer">
                    <span className="run-band-pic">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(short.id, "mq")} alt="" />
                      <span className="scrub-time">{length(short.seconds)}</span>
                    </span>
                    {label}
                  </a>
                ) : (
                  <>
                    <span className="run-band-pic" role="img" aria-label={COPY.sealedShort(length(short.seconds))}>
                      <span className="scrub-time">{length(short.seconds)}</span>
                    </span>
                    {label}
                  </>
                )}
              </li>
            );
          }

          if (item.kind === "feature") {
            return (
              <li key="feature" className={state} aria-current={isNow || undefined}>
                <Link href={`/films/${film.slug}`}>
                  <span className="run-band-pic">
                    {film.stills[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={film.stills[0]} alt="" />
                    )}
                    {badgeTime(film) && <span className="scrub-time">{badgeTime(film)}</span>}
                  </span>
                  {label}
                </Link>
              </li>
            );
          }

          return (
            <li key="extra" className={`${state} is-extra`} aria-current={isNow || undefined}>
              <span className="run-band-pic">
                <MicIcon />
              </span>
              {label}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
