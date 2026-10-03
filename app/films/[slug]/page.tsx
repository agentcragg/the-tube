import Link from "next/link";
import { notFound } from "next/navigation";
import { Crop } from "@/components/endeavour";
import Ago from "@/components/Ago";
import { LAUREL_LABEL, LaurelMark, laurelLines } from "@/components/laurels";
import Scrubber from "@/components/Scrubber";
import Screened from "@/components/Screened";
import { RabbitHole, WatchPanels } from "@/components/watch";
import Notes from "@/components/Notes";
import Tonight from "@/components/Tonight";
import { CalendarIcon, CanIcon, MicIcon, PinIcon, TicketIcon } from "@/components/Icons";
import { bookingUrl, films, formatDate, getFilm, runningTime, VENUE } from "@/lib/films";
import { HOUSE_HONOUR } from "@/lib/rabbit-hole";
import { COPY, watchFor } from "@/lib/watch";
import { SAMPLE_SEATS } from "@/lib/seats";

export function generateStaticParams() {
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/films/[slug]">) {
  const film = getFilm((await params).slug);
  if (!film) notFound();
  return { title: `${film.title} · The Tube` };
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
  // The next three nights after this one, going round to the start after the last
  const nextUp = [...films.filter((f) => f.date > film.date), ...films.filter((f) => f.date < film.date)].slice(0, 3);
  // Films without curated clips keep the plain box of links
  const watch = watchFor(film.slug);
  const hole = watch?.clips.length ? watch : undefined;
  const time = runningTime(film);

  return (
    <div className="watch">
      <article>
        <div className="still-frame">
          <Scrubber frames={film.stills} seed={film.slug} alt={film.title} />
          {/* Well used: the wall's laurel once the night is over */}
          <Screened date={film.date}>
            <span className="x-used still-laurel">
              <LaurelMark lines={laurelLines(film.date.slice(0, 4))} label={LAUREL_LABEL} />
            </span>
          </Screened>
        </div>

        <h1>{film.title}</h1>
        <p className="credit">{film.credit}</p>
        {film.extra && (
          <p className="extra extra-big">
            <MicIcon /> {film.extra}
          </p>
        )}
        {film.perk && (
          <p className="extra extra-big">
            <CanIcon /> {film.perk}
          </p>
        )}

        {/* Measured 2008: the watch page's info box in place of the icon row */}
        <dl className="x-08 info08">
          <div>
            <dt>Date:</dt>
            <dd>
              <Tonight date={film.date} fallback={formatDate(film.date)} />
            </dd>
          </div>
          {time && (
            <div>
              <dt>Running time:</dt>
              <dd>{time}</dd>
            </div>
          )}
          <div>
            <dt>Tickets:</dt>
            <dd>£10 · {SAMPLE_SEATS[film.slug] ?? 30} of 30 seats left</dd>
          </div>
        </dl>

        <ul className="meta meta-big no-08">
          <li>
            <CalendarIcon /> <Tonight date={film.date} fallback={formatDate(film.date)} />
            <Screened date={film.date}>
              <span className="x-used night-ago">
                {" "}
                (<Ago iso={film.date} relativeOnly />)
              </span>
            </Screened>
          </li>
          <li>
            <TicketIcon /> {SAMPLE_SEATS[film.slug] ?? 30} of 30 seats left · £10
          </li>
        </ul>

        <div className="action-row">
          <a className="book" href={bookingUrl(film)}>
            Book tickets
          </a>
          {/* Well used: takes Book's place once the night is over (look-used.css) */}
          <Screened date={film.date}>
            <span className="x-used screened">{HOUSE_HONOUR.after}</span>
          </Screened>
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
        </div>

        <section className="box">
          <div className="box-head">
            <h2>Programme notes</h2>
          </div>
          <div className="box-body">
            <Notes text={film.notes ?? PLACEHOLDER_NOTES} />
          </div>
        </section>

        {hole ? (
          <RabbitHole clips={hole.clips} sites={hole.links?.filter((l) => l.shot) ?? []} />
        ) : (
          <section className="box">
            <div className="box-head">
              <h2>
                {COPY.title}
                <span className="x-counts idea-count"> ({film.rabbitHole.length})</span>
              </h2>
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
        )}
      </article>

      <aside className="side">
        {/* The building look: this film on the drawn basement screen */}
        <section className="box x-building">
          <div className="box-head">
            <h2>
              <PinIcon /> Find us
            </h2>
          </div>
          <div className="box-body">
            <div className="thumb-frame find-crop">
              <Crop crop="screen" scene={{ state: "screening", tonight: film }} screenImage={film.stills[0]} />
            </div>
            <p>
              {VENUE.lines.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
              <a href={VENUE.map} target="_blank" rel="noreferrer">
                Map »
              </a>
            </p>
          </div>
        </section>

        {hole && <WatchPanels film={film} data={hole} />}

        <section className="box also-08">
          <div className="box-head">
            <h2>Also showing</h2>
          </div>
          <div className="box-body">
            <ul className="related-list">
              {nextUp.map((f) => (
                <li key={f.slug}>
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
            <p className="box-more">
              <Link href="/">{COPY.allNights}</Link>
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
