"use client";

import Link from "next/link";
import { londonParts, useLondonNow } from "@/lib/clock";
import { bookingUrl, films, type Film } from "@/lib/films";
import { HANDBILLS } from "@/lib/fun/handbill";
import HandbillArt from "./HandbillArt";
import { handbillWhen, shortDate } from "./when";

// The weekly handbill: a strip of live text (when, title, aside, and on the
// front page the date, price and Book) over the week's hand-made art.
//
// Pages are built ahead of time, so the server renders the plain date and the
// browser swaps in Tonight / Tomorrow / Next Tuesday / Shown … by London time.
// On the front page the browser also moves on to the next night once this one
// is over, so the banner changes at midnight without a rebuild.

type Variant = "home" | "film";

export default function Handbill({ film: given, variant }: { film: Film; variant: Variant }) {
  const now = useLondonNow();
  const home = variant === "home";

  let film = given;
  if (home && now) {
    const today = londonParts(now).isoDate;
    film = films.find((f) => f.date >= today) ?? given;
  }

  const when = handbillWhen(film.date, now);
  const bill = HANDBILLS[film.slug] ?? {};
  const href = `/films/${film.slug}`;
  const Title = home ? "h2" : "p";
  const art = (
    <HandbillArt
      film={film}
      bill={bill}
      eager={home}
      sizes={home ? "(max-width: 720px) 100vw, 1200px" : "(max-width: 720px) 100vw, 900px"}
    />
  );

  return (
    <section
      className={`handbill handbill-${variant}`}
      data-film={film.slug}
      style={{ "--film": film.colour } as React.CSSProperties}
    >
      {bill.by && <p className="handbill-by">Banner by {bill.by}</p>}
      <div className="handbill-card">
        <div className="handbill-strip">
          {/* Label, title and aside run on as one line of type, wrapping together */}
          <div className="handbill-name">
            <span className="handbill-when">{when.label}</span>{" "}
            <Title className="handbill-title">{home ? <Link href={href}>{film.title}</Link> : film.title}</Title>
            {bill.aside && <p className="handbill-aside"> ({bill.aside})</p>}
          </div>
          {home && when.kind !== "past" && (
            <p className="handbill-book">
              {/* The date only when the label isn't already saying it */}
              <span>
                {when.kind === "soon" && `${shortDate(film.date)} · `}£10
              </span>
              <a className="book book-small" href={bookingUrl(film)}>
                Book
              </a>
            </p>
          )}
        </div>
        {/* The film page already opens with the stills, so it only shows real art */}
        {!home && !bill.wide ? null : home ? (
          // Same place as the title link, so it's skipped by keyboard and screen readers
          <Link href={href} className="handbill-art" tabIndex={-1} aria-hidden="true">
            {art}
          </Link>
        ) : (
          <div className="handbill-art">{art}</div>
        )}
      </div>
    </section>
  );
}
