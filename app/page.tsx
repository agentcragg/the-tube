import Link from "next/link";
import Ago from "@/components/Ago";
import ComingUp from "@/components/ComingUp";
import { PinIcon, TvIcon } from "@/components/Icons";
import NextScreening from "@/components/NextScreening";
import { films, isPast, VENUE } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { latestVideos } from "@/lib/suggestions";
import { credit, isTikTok, thumb, tikTokLink, tikTokThumb } from "@/lib/videos";

export default async function WhatsOn() {
  const next = films.find((f) => !isPast(f.date)) ?? films[films.length - 1];
  const latest = await latestVideos(6);

  return (
    <div className="home">
      <ComingUp films={films} seats={SAMPLE_SEATS} />

      <aside className="side">
        <NextScreening next={next} />

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
                    {/* When the sheet says it came in */}
                    {v.suggestedOn && (
                      <em>
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

        {/* A 468x60 Moviefone banner, loose in the sidebar the way old sites had them */}
        <a className="side-banner" href="https://www.youtube.com/watch?v=vauf_3nOzH0" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gifs/grandmother.gif"
            alt="Would you go see a movie your grandmother recommended?"
            width={468}
            height={60}
          />
        </a>

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
