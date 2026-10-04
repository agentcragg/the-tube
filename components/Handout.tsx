"use client";

import { ditherSrc } from "@/lib/dither";
import { formatDate, VENUE, type Film } from "@/lib/films";
import { useLook } from "@/lib/use-look";

// The programme notes as the photocopied sheet you'd be handed at the door
// (the look switch's "handout" idea): the film's first still run through the
// copier, the title, the night and the notes, typed. The picture is only
// fetched with the idea on.

export default function Handout({ film, notes }: { film: Film; notes: string }) {
  const on = useLook("handout");
  return (
    <div className="handout x-handout">
      {on && film.stills[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="handout-still" src={ditherSrc(film.stills[0], 480, "copy")} alt="" />
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
