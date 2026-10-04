"use client";

import Link from "next/link";
import Tonight from "@/components/Tonight";
import { daysBetween, londonParts, useLondonNow } from "@/lib/clock";
import { films, formatDate, type Film } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { usePretendDay } from "@/lib/use-look";

// What's on's Next screening box: 2008's headerless box, its label set inside
// the frame, with the film's picture beside the count. The server picks the
// night and counts the days. With the look switch's ?today set, the browser
// picks again for that day, so the box agrees with the programme beside it.

export default function NextScreening({ next: fromServer, days: daysFromServer }: { next: Film; days: number }) {
  const now = useLondonNow();
  const pretend = usePretendDay();
  const today = pretend && now ? londonParts(now).isoDate : null;
  const next = today ? (films.find((f) => f.date >= today) ?? films[films.length - 1]) : fromServer;
  const days = today ? daysBetween(today, next.date) : daysFromServer;

  return (
    <section className="box box-plain">
      <div className="box-head">
        <h2>
          <Tonight date={next.date} fallback="Next screening" />
        </h2>
      </div>
      <div className="box-body next-up">
        <p className="next-when">{formatDate(next.date)}</p>
        <p className="next-title">
          <Link href={`/films/${next.slug}`}>{next.title}</Link>
        </p>
        {/* The film's first still for now; a GIF per film is to come, in this slot */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="next-still" src={next.stills[0]} alt="" />
        <p className="next-count">
          In {days} days · {SAMPLE_SEATS[next.slug]} seats left
        </p>
      </div>
    </section>
  );
}
