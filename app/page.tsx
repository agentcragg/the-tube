import Link from "next/link";
import ComingUp from "@/components/ComingUp";
import Fun from "@/components/fun/Fun";
import { HypeCardMini } from "@/components/fun/card";
import { EndeavourMap } from "@/components/fun/endeavour";
import { HandbillHome } from "@/components/fun/handbill";
import { LiveBasement, SpotlightBox } from "@/components/fun/running";
import { CalendarIcon, PinIcon, TvIcon } from "@/components/Icons";
import { films, formatDate, isPast, VENUE } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { approvedSuggestions } from "@/lib/suggestions";
import { credit, seedVideos, thumb, withYouTubeDetails } from "@/lib/videos";

const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000);

export default async function WhatsOn() {
  const next = films.find((f) => !isPast(f.date)) ?? films[films.length - 1];
  const [seed, approved] = await Promise.all([withYouTubeDetails(seedVideos), approvedSuggestions()]);
  // Newest approved suggestions first, then the most recently added of our own
  const latest = [...approved.slice().reverse(), ...seed.slice().reverse()]
    .filter((v, i, all) => all.findIndex((w) => w.id === v.id) === i)
    .slice(0, 6);

  return (
    <div className="home">
      <Fun id="running">
        <LiveBasement films={films} />
      </Fun>
      <Fun id="handbill">
        <HandbillHome film={next} />
      </Fun>
      <ComingUp films={films} seats={SAMPLE_SEATS} />

      <aside className="side">
        <section className="box next-box" style={{ "--film": next.colour } as React.CSSProperties}>
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
            <Fun id="card">
              <HypeCardMini film={next} />
            </Fun>
          </div>
        </section>

        <Fun id="running">
          <SpotlightBox films={films} />
        </Fun>

        <section className="box">
          <div className="box-head">
            <h2>
              <TvIcon /> Just suggested
            </h2>
          </div>
          <div className="box-body">
            <ul className="mini-list">
              {latest.map((v) => (
                <li key={v.id}>
                  <Link href="/wall">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(v.id, "hq")} alt="" />
                    <span>
                      <strong>{v.title}</strong>
                      {credit(v) && <em>{credit(v)}</em>}
                    </span>
                  </Link>
                </li>
              ))}
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
            <Fun id="endeavour">
              <EndeavourMap films={films} />
            </Fun>
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
