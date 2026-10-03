import Link from "next/link";
import Ago from "@/components/Ago";
import ComingUp from "@/components/ComingUp";
import { Crop } from "@/components/endeavour";
import { PinIcon, TvIcon } from "@/components/Icons";
import NextScreening from "@/components/NextScreening";
import { films, isPast, VENUE } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { latestVideos, wallVideos } from "@/lib/suggestions";
import { credit, isTikTok, thumb, tikTokLink, tikTokThumb } from "@/lib/videos";

const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000);

export default async function WhatsOn() {
  const next = films.find((f) => !isPast(f.date)) ?? films[films.length - 1];
  const [latest, wall] = await Promise.all([latestVideos(6), wallVideos()]);

  return (
    <div className="home">
      <ComingUp films={films} seats={SAMPLE_SEATS} />

      <aside className="side">
        <NextScreening next={next} days={daysUntil(next.date)} />

        <section className="box">
          <div className="box-head">
            <h2>
              <TvIcon /> Just suggested
              {/* Counts in brackets: the number on the wall */}
              <span className="x-counts idea-count"> ({wall.length})</span>
            </h2>
          </div>
          <div className="box-body">
            <ul className="mini-list">
              {latest.map((v) => {
                const words = (
                  <span>
                    {v.title && <strong>{v.title}</strong>}
                    {credit(v) && <em>{credit(v)}</em>}
                    {/* Well used: when the sheet says it came in */}
                    {v.suggestedOn && (
                      <em className="x-used">
                        {" "}
                        (<Ago iso={v.suggestedOn} />)
                      </em>
                    )}
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

        <section className="box box-flat-08">
          <div className="box-head">
            <h2>
              <PinIcon /> Find us
            </h2>
          </div>
          <div className="box-body">
            <div className="x-building thumb-frame find-crop">
              <Crop crop="building" />
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
      </aside>
    </div>
  );
}
