"use client";

import { TRAILER_COPY } from "@/lib/fun/trailer";
import { closeTrailer, openTrailer, prefersReducedMotion, useOpenTrailer } from "./store";
import { loadYouTubeApi } from "./youtube";

// "Watch trailer" in the film page's action row. Plays the trailer in the
// main still's frame; while it's open the same button puts the still back.
export default function TrailerToggle({ slug, length }: { slug: string; length: string }) {
  const open = useOpenTrailer() === slug;

  // Fetch YouTube's player script as soon as someone looks like pressing play
  const warm = () => {
    loadYouTubeApi().catch(() => {});
  };

  return (
    <button
      type="button"
      className="action trailer-button"
      onPointerEnter={warm}
      onFocus={warm}
      onClick={() => {
        if (open) return closeTrailer(slug);
        openTrailer(slug);
        document
          .querySelector(".film-still")
          ?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }}
    >
      <svg className="trailer-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path className="trailer-icon-shine" d="M3.6 6.2a4.8 4.8 0 0 1 8.8 0c-2.6-1-6.2-1-8.8 0z" />
        {open ? <rect x="5.6" y="5.6" width="4.8" height="4.8" rx=".6" /> : <path d="M6.4 4.9v6.2l4.9-3.1z" />}
      </svg>
      {open ? TRAILER_COPY.close : TRAILER_COPY.watch}
      {!open && (
        <>
          {" "}
          <span className="trailer-length">{length}</span>
        </>
      )}
    </button>
  );
}
