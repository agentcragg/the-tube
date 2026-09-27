import Link from "next/link";
import { notFound } from "next/navigation";
import FilmStill from "@/components/FilmStill";
import Fun from "@/components/fun/Fun";
import { HypeCard } from "@/components/fun/card";
import { HandbillFilm } from "@/components/fun/handbill";
import { RunningOrder } from "@/components/fun/running";
import { TrailerButton } from "@/components/fun/trailer";
import { WatchPanels } from "@/components/fun/watch";
import Scrubber from "@/components/Scrubber";
import Notes from "@/components/Notes";
import { CalendarIcon, MicIcon, PinIcon, TicketIcon } from "@/components/Icons";
import { bookingUrl, films, formatDate, getFilm, VENUE } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";

export function generateStaticParams() {
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/films/[slug]">) {
  const film = getFilm((await params).slug);
  return { title: film ? `${film.title} · The Tube` : "The Tube" };
}

const PLACEHOLDER_NOTES =
  "Programme notes go here. They can run as long as they need to: the box shows the first few lines, and the (more) link opens the rest, the way YouTube descriptions used to. This is filler text to show how a longer set of notes sits on the page. It carries on for a while so that the box has something to cut off, and so you can see what happens when it opens. A second paragraph's worth of filler would continue here, then a third.";

// A calendar entry for the screening, as a download link
function icsLink(title: string, date: string) {
  const d = date.replaceAll("-", "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Tube//EN",
    "BEGIN:VEVENT",
    `UID:${d}-the-tube`,
    `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:${title} at The Tube`,
    `LOCATION:${VENUE.oneLine.replaceAll(",", "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export default async function FilmPage({ params }: PageProps<"/films/[slug]">) {
  const film = getFilm((await params).slug);
  if (!film) notFound();
  const others = films.filter((f) => f.slug !== film.slug);

  return (
    <div className="watch" data-film={film.slug} style={{ "--film": film.colour } as React.CSSProperties}>
      {/* Lets the header, tabs and footer pick up this film's colour too */}
      <style>{`:root { --film: ${film.colour}; }`}</style>
      <article>
        <FilmStill film={film} />

        <h1>{film.title}</h1>
        <p className="credit">{film.credit}</p>
        {film.extra && (
          <p className="extra extra-big">
            <MicIcon /> {film.extra}
          </p>
        )}

        <ul className="meta meta-big">
          <li>
            <CalendarIcon /> {formatDate(film.date)}
          </li>
          <li>
            <TicketIcon /> {SAMPLE_SEATS[film.slug] ?? 30} of 30 seats left · £10
          </li>
        </ul>

        <div className="action-row">
          <a className="book" href={bookingUrl(film)}>
            Book tickets
          </a>
          <a className="action" href={icsLink(film.title, film.date)} download={`${film.slug}.ics`}>
            <CalendarIcon /> Add to calendar
          </a>
          <a
            className="action"
            href={VENUE.map}
            target="_blank"
            rel="noreferrer"
          >
            <PinIcon /> Map
          </a>
          <Fun id="trailer">
            <TrailerButton film={film} />
          </Fun>
        </div>

        <Fun id="handbill">
          <HandbillFilm film={film} />
        </Fun>

        <section className="box notes-section">
          <div className="box-head">
            <h2>Programme notes</h2>
          </div>
          <div className="box-body">
            <Fun id="card">
              <HypeCard film={film} />
            </Fun>
            <Notes text={film.notes ?? PLACEHOLDER_NOTES} />
          </div>
        </section>

        <Fun id="running">
          <RunningOrder film={film} />
        </Fun>
      </article>

      <aside className="side">
        <section className="box">
          <div className="box-head">
            <h2>Also showing</h2>
          </div>
          <div className="box-body">
            <ul className="related-list">
              {others.map((f) => (
                <li key={f.slug} style={{ "--film": f.colour } as React.CSSProperties}>
                  <Link href={`/films/${f.slug}`}>
                    <Scrubber frames={f.stills} seed={f.slug} alt={f.title} />
                    <span>
                      <strong>{f.title}</strong>
                      <em>{f.credit}</em>
                      <em>{formatDate(f.date)}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Fun id="watch">
          <WatchPanels film={film} />
        </Fun>

        <section className="box rabbit-box">
          <div className="box-head">
            <h2>Rabbit hole</h2>
          </div>
          <div className="box-body">
            <ul className="links">
              {film.rabbitHole.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </aside>
    </div>
  );
}
