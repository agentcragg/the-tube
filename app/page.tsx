import Link from "next/link";
import ComingUp from "@/components/ComingUp";
import { CalendarIcon, PinIcon, TvIcon } from "@/components/Icons";
import { films, formatDate } from "@/lib/films";
import { SAMPLE_SEATS } from "@/lib/seats";
import { seedVideos, thumb, withYouTubeDetails } from "@/lib/videos";

const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000);

export default async function WhatsOn() {
  const next = films[0];
  const latest = (await withYouTubeDetails(seedVideos)).slice(-6).reverse();

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
              {latest.map((v) => (
                <li key={v.id}>
                  <Link href="/wall">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(v.id, "hq")} alt="" />
                    <span>
                      <strong>{v.title}</strong>
                      {v.channel && <em>{v.channel}</em>}
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
            <p>
              Basement of Endeavour, Deptford. Every Tuesday. £10.
              <br />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Endeavour+Deptford+London"
                target="_blank"
                rel="noreferrer"
              >
                Map »
              </a>
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
