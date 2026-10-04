"use client";

import Link from "next/link";
import Letterboard from "@/components/Letterboard";
import Tonight from "@/components/Tonight";
import { londonParts, useLondonNow } from "@/lib/clock";
import { ditherSrc } from "@/lib/dither";
import { films, formatDate, type Film } from "@/lib/films";
import { usePretendDay } from "@/lib/use-look";

// What's on's Next screening box: 2008's headerless box, its label set inside
// the frame, then the night's picture. The server picks the night. With the
// look switch's ?today set, the browser picks again for that day, so the box
// agrees with the programme beside it.

export default function NextScreening({ next: fromServer }: { next: Film }) {
  const now = useLondonNow();
  const pretend = usePretendDay();
  const today = pretend && now ? londonParts(now).isoDate : null;
  const next = today ? (films.find((f) => f.date >= today) ?? films[films.length - 1]) : fromServer;

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
          // A picture made for the night, out to the box's edges
          <Link href={`/films/${next.slug}`} className="next-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={next.art} alt={next.title} />
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
      </div>
    </section>
  );
}
