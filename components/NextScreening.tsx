"use client";

import Link from "next/link";
import { CalendarIcon } from "@/components/Icons";
import Tonight from "@/components/Tonight";
import { daysBetween, londonParts, useLondonNow } from "@/lib/clock";
import { films, formatDate, type Film } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { usePretendDay } from "@/lib/use-look";

// What's on's Next screening box. The server picks the night and counts the
// days. With the look switch's ?today set, the browser picks again for that
// day, so the box agrees with the programme beside it.

export default function NextScreening({ next: fromServer, days: daysFromServer }: { next: Film; days: number }) {
  const now = useLondonNow();
  const pretend = usePretendDay();
  const today = pretend && now ? londonParts(now).isoDate : null;
  const next = today ? (films.find((f) => f.date >= today) ?? films[films.length - 1]) : fromServer;
  const days = today ? daysBetween(today, next.date) : daysFromServer;

  return (
    <section className="box box-plain-08">
      <div className="box-head">
        <h2>
          <CalendarIcon /> <Tonight date={next.date} fallback="Next screening" />
        </h2>
      </div>
      <div className="box-body next-up">
        <p className="next-when">{formatDate(next.date)}</p>
        <p className="next-title">
          <Link href={`/films/${next.slug}`}>{next.title}</Link>
        </p>
        {/* Measured 2008: the first still beside the count. Lazy, so it isn't fetched while hidden. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="x-08 next-still" src={next.stills[0]} alt="" loading="lazy" />
        <p className="next-count">
          In {days} days · {SAMPLE_SEATS[next.slug]} seats left
        </p>
      </div>
    </section>
  );
}
