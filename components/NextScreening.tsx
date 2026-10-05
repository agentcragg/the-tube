import Link from "next/link";
import { CalendarIcon } from "@/components/Icons";
import Tonight from "@/components/Tonight";
import { formatDate, type Film } from "@/lib/films";

// What's on's Next screening box: the date, the night's picture and its
// title. The server picks the night.

export default function NextScreening({ next }: { next: Film }) {
  return (
    <section className="box next-box">
      <div className="box-head">
        <h2>
          <CalendarIcon /> <Tonight date={next.date} fallback="Next screening" />
        </h2>
      </div>
      {/* The date as the one tab in a bar like Coming up's, so the picture
          lines up with the programme's first row of stills */}
      <div className="box-tabs next-bar">
        <span className="on">{formatDate(next.date)}</span>
      </div>
      <div className="box-body next-up">
        <Link href={`/films/${next.slug}`} className="next-pic">
          {next.art ? (
            // A picture made for the night (Matt's GIFs, in time)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next.art} alt={next.title} />
          ) : (
            // Until then, the film's first still
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next.stills[0]} alt="" />
          )}
        </Link>
        <h3 className="next-title">
          <Link href={`/films/${next.slug}`}>{next.title}</Link>
        </h3>
        <p className="credit">{next.credit}</p>
      </div>
    </section>
  );
}
