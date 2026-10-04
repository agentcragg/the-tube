"use client";

import Link from "next/link";
import Letterboard from "@/components/Letterboard";
import Tonight from "@/components/Tonight";
import { daysBetween, londonParts, useLondonNow } from "@/lib/clock";
import { ditherSrc } from "@/lib/dither";
import { films, formatDate, type Film } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { usePretendDay } from "@/lib/use-look";

// Where the sparkles sit over a night's picture (% across, % down, size in px,
// delay in s), bunched round the title and the edges like a 2003 GIF
const SPARKLES = [
  [6, 12, 24, 0], [26, 6, 16, 0.6], [50, 9, 20, 1.2], [78, 6, 18, 0.3], [95, 20, 22, 0.9],
  [66, 33, 14, 1.5], [12, 46, 18, 0.4], [91, 60, 16, 1.8], [42, 86, 20, 1.0], [4, 82, 14, 2.1],
  [35, 30, 12, 0.2], [83, 85, 18, 1.4],
] as const;

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
        <p className="next-when no-letterboard">{formatDate(next.date)}</p>
        <p className="next-title">
          <Link href={`/films/${next.slug}`}>
            <span className="no-letterboard">{next.title}</span>
            <Letterboard className="x-letterboard" title={next.title} date={next.date} />
          </Link>
        </p>
        {next.art ? (
          // A picture made for the night, full width, with sparkles twinkling over it
          <Link href={`/films/${next.slug}`} className="next-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={next.art} alt={next.title} />
            <span className="sparkles" aria-hidden="true">
              {SPARKLES.map(([x, y, size, delay]) => (
                <i
                  key={`${x}-${y}`}
                  style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, animationDelay: `${delay}s` }}
                />
              ))}
            </span>
          </Link>
        ) : (
          <>
            {/* The film's first still until it has a picture of its own (art) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="next-still no-dither" src={next.stills[0]} alt="" />
            {/* The "dither" idea's copy: lazy, so it's only fetched while it shows */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="next-still x-dither" src={ditherSrc(next.stills[0], 120)} alt="" loading="lazy" />
          </>
        )}
        <p className="next-count">
          {/* On the night the heading says Tonight */}
          {days > 0 && `In ${days} ${days === 1 ? "day" : "days"} · `}
          {SAMPLE_SEATS[next.slug]} seats left
        </p>
      </div>
    </section>
  );
}
