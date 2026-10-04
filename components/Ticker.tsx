"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Tonight from "@/components/Tonight";
import { londonParts, useLondonNow } from "@/lib/clock";
import { films, formatDate } from "@/lib/films";
import { useLook } from "@/lib/use-look";

// The look switch's "ticker" idea: a thin strip under the tabs that scrolls
// the next nights and the newest suggestions, round and round, like a 2000s
// news ticker. It stops while the pointer's on it. The nights are known
// here; the suggestions come from the sheet (app/api/just-suggested), only
// fetched with the idea on. It's in every page's markup, hidden unless the
// idea is on (app/idea-ticker.css), so switching it on doesn't move the page
// once it's drawn.

const NIGHTS = 3;
const PX_PER_S = 55; // scroll speed

type Suggested = { id: string; title: string; credit?: string };

export default function Ticker() {
  const on = useLook("ticker");
  const [suggested, setSuggested] = useState<Suggested[] | null>(null); // null until asked
  const list = useRef<HTMLUListElement>(null);
  const [seconds, setSeconds] = useState<number | null>(null);

  // Nights split on the London day, as on What's on, so ?today moves them too.
  // None until the clock is known: film pages are built at deploy, so the
  // server's idea of what's past can be weeks old and wouldn't hydrate.
  const now = useLondonNow();
  const today = now ? londonParts(now).isoDate : null;
  const nights = today ? films.filter((f) => f.date >= today).slice(0, NIGHTS) : [];

  useEffect(() => {
    if (!on) return;
    let gone = false;
    fetch("/api/just-suggested")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((v: Suggested[]) => !gone && setSuggested(v));
    return () => {
      gone = true;
    };
  }, [on]);

  // It starts moving once the suggestions are in (or aren't coming), at a
  // steady speed whatever the length
  useEffect(() => {
    if (suggested === null || !list.current) return;
    setSeconds(list.current.offsetWidth / PX_PER_S);
  }, [suggested, nights.length]);

  const items = (copy: number) => (
    <ul ref={copy === 0 ? list : undefined} aria-hidden={copy > 0 || undefined}>
      {nights.length > 0 && <li className="ticker-label ticker-label-red">Coming up</li>}
      {nights.map((f) => (
        <li key={f.slug}>
          <Link href={`/films/${f.slug}`} tabIndex={copy > 0 ? -1 : undefined}>
            {f.title}
          </Link>{" "}
          <span className="ticker-date">
            <Tonight date={f.date} fallback={formatDate(f.date)} />
          </span>
        </li>
      ))}
      {!!suggested?.length && <li className="ticker-label ticker-label-yellow">Just suggested</li>}
      {suggested?.map((v) => (
        <li key={v.id}>
          <Link href="/wall" tabIndex={copy > 0 ? -1 : undefined}>
            {v.title}
          </Link>
          {v.credit && <span className="ticker-credit"> {v.credit}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker x-ticker">
      <div
        className={seconds ? "ticker-track ticker-go" : "ticker-track"}
        style={seconds ? ({ "--ticker-s": `${seconds}s` } as React.CSSProperties) : undefined}
      >
        {items(0)}
        {items(1)}
      </div>
    </div>
  );
}
