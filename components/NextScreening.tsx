"use client";

import Link from "next/link";
import { CalendarIcon } from "@/components/Icons";
import Letterboard from "@/components/Letterboard";
import Tonight from "@/components/Tonight";
import { londonParts, useLondonNow } from "@/lib/clock";
import { ditherSrc } from "@/lib/dither";
import { films, formatDate, type Film } from "@/lib/films";
import { usePretendDay } from "@/lib/use-look";

// What's on's Next screening box: the date, the night's picture and its title. The server picks the night. With the
// look switch's ?today set, the browser picks again for that day, so the box
// agrees with the programme beside it.

export default function NextScreening({ next: fromServer }: { next: Film }) {
  const now = useLondonNow();
  const pretend = usePretendDay();
  const today = pretend && now ? londonParts(now).isoDate : null;
  const next = today ? (films.find((f) => f.date >= today) ?? films[films.length - 1]) : fromServer;

  return (
    <section className="box next-box">
      <div className="box-head">
        <h2>
          <CalendarIcon /> <Tonight date={next.date} fallback="Next screening" />
        </h2>
      </div>
      {/* The date in a bar the height of Coming up's tabs, so the picture
          lines up with the programme's first row of stills */}
      <div className="box-tabs next-bar">
        <span className="next-when">{formatDate(next.date)}</span>
      </div>
      <div className="box-body next-up">
        <Link href={`/films/${next.slug}`} className="next-pic">
          {next.art ? (
            // A picture made for the night (Matt's GIFs, in time), out to the box's sides
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next.art} alt={next.title} />
          ) : (
            <>
              {/* Until then, the film's first still */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="no-dither" src={next.stills[0]} alt="" />
              {/* The "dither" idea's copy: lazy, so it's only fetched while it shows */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="x-dither" src={ditherSrc(next.stills[0], 320)} alt="" loading="lazy" />
            </>
          )}
        </Link>
        <h3 className="next-title">
          <Link href={`/films/${next.slug}`}>
            <span className="no-letterboard">{next.title}</span>
            <Letterboard className="x-letterboard" title={next.title} date={next.date} />
          </Link>
        </h3>
      </div>
    </section>
  );
}
