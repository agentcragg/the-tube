import Link from "next/link";
import ComingUp from "@/components/ComingUp";
import { CalendarIcon, PinIcon, TvIcon } from "@/components/Icons";
import { films, formatDate, isPast, VENUE } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { latestVideos } from "@/lib/suggestions";
import { credit, isTikTok, thumb, tikTokLink, tikTokThumb } from "@/lib/videos";

const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000);

export default async function WhatsOn() {
  const next = films.find((f) => !isPast(f.date)) ?? films[films.length - 1];
  const latest = await latestVideos(6);

  return (
    <div className="home">
      <ComingUp films={films} seats={SAMPLE_SEATS} />

      <aside className="side">
        <section className="box">
          <div className="box-head">
            <h2>
              <CalendarIcon /> Next screening
            </h2>
          </div>
          <div className="box-body next-up">
            <p className="next-when">{formatDate(next.date)}</p>
            <p className="next-title">
              <Link href={`/films/${next.slug}`}>{next.title}</Link>
            </p>
            <p className="next-count">In {daysUntil(next.date)} days · {SAMPLE_SEATS[next.slug]} seats left</p>
          </div>
        </section>

        <section className="box">
          <div className="box-head">
            <h2>
              <TvIcon /> Just suggested
            </h2>
          </div>
          <div className="box-body">
            <ul className="mini-list">
              {latest.map((v) => {
                const words = (
                  <span>
                    {v.title && <strong>{v.title}</strong>}
                    {credit(v) && <em>{credit(v)}</em>}
                  </span>
                );
                return (
                  <li key={v.id}>
                    {isTikTok(v.id) ? (
                      <a href={tikTokLink(v)} target="_blank" rel="noreferrer">
                        {/* Upright, over a blurred copy of itself, as on the wall */}
                        <span className="tt-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tikTokThumb(v.id)} alt="" className="tt-blur" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tikTokThumb(v.id)} alt="" />
                        </span>
                        {words}
                      </a>
                    ) : (
                      <Link href="/wall">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb(v.id, "hq")} alt="" />
                        {words}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="box-more">
              <Link href="/wall">Suggest a video »</Link>
            </p>
          </div>
        </section>

        <section className="box">
          <div className="box-head">
            <h2>
              <PinIcon /> Find us
            </h2>
          </div>
          <div className="box-body">
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
      </aside>
    </div>
  );
}
