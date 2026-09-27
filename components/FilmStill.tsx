"use client";

import { useState } from "react";
import Fun from "@/components/fun/Fun";
import { FrameNotes } from "@/components/fun/card";
import { SignatureStill } from "@/components/fun/signature";
import { TrailerOverlay } from "@/components/fun/trailer";
import Scrubber from "@/components/Scrubber";
import type { Film } from "@/lib/films";

// The main still on a film page, with room for Fun lab overlays on top of it.
export default function FilmStill({ film }: { film: Film }) {
  const [frame, setFrame] = useState(0);
  return (
    <div className="still-frame film-still">
      <Scrubber frames={film.stills} seed={film.slug} alt={film.title} onFrame={setFrame} />
      <Fun id="card">
        <FrameNotes film={film} frame={frame} />
      </Fun>
      <Fun id="signature">
        <SignatureStill film={film} />
      </Fun>
      <Fun id="trailer">
        <TrailerOverlay film={film} />
      </Fun>
    </div>
  );
}
