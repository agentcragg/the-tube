import { ditherSrc } from "@/lib/dither";
import { formatDate, VENUE, type Film } from "@/lib/films";

// The programme notes as the photocopied sheet you'd be handed at the door
// (the look switch's "handout" idea): the film's first still run through the
// copier, the title, the night and the notes, typed. The picture is lazy, so
// it's only fetched with the idea on (the sheet's hidden otherwise), and it's
// in the page from the start, so its space is kept and nothing below jumps.

export default function Handout({ film, notes }: { film: Film; notes: string }) {
  return (
    <div className="handout x-handout">
      {film.stills[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="handout-still" src={ditherSrc(film.stills[0], 480, "copy")} alt="" loading="lazy" />
      )}
      <p className="handout-title">{film.title}</p>
      <p className="handout-credit">{film.credit}</p>
      <p className="handout-when">
        {formatDate(film.date)} · {VENUE.lines.slice(0, 2).join(", ")}
      </p>
      <p className="handout-notes">{notes}</p>
    </div>
  );
}
