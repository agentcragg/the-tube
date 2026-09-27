"use client";

import { useEffect, useState } from "react";
import Scrubber from "@/components/Scrubber";

// The film page still. With the Lightbox idea switched on, clicking it opens
// the stills in a 2007-style Lightbox: dark overlay, white frame, a caption
// bar with "Image 2 of 4", and next/previous.

export default function LightboxStill({ frames, seed, title }: { frames: string[]; seed: string; title: string }) {
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (shown === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShown(null);
      if (e.key === "ArrowRight") setShown((n) => (n === null ? n : (n + 1) % frames.length));
      if (e.key === "ArrowLeft") setShown((n) => (n === null ? n : (n - 1 + frames.length) % frames.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, frames.length]);

  const open = () => {
    if (!document.documentElement.classList.contains("x-lightbox") || !frames.length) return;
    setShown(0);
  };

  return (
    <>
      <div className="still-frame lightbox-trigger" onClick={open}>
        <Scrubber frames={frames} seed={seed} alt={title} />
      </div>
      {shown !== null && (
        <div className="lightbox" onClick={() => setShown(null)} role="dialog" aria-label={`${title} stills`}>
          <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frames[shown]} alt={`${title}, still ${shown + 1}`} />
            <button
              className="lightbox-prev"
              onClick={() => setShown((shown - 1 + frames.length) % frames.length)}
              aria-label="Previous still"
            >
              <span>‹ Prev</span>
            </button>
            <button
              className="lightbox-next"
              onClick={() => setShown((shown + 1) % frames.length)}
              aria-label="Next still"
            >
              <span>Next ›</span>
            </button>
            <div className="lightbox-bar">
              <span>
                <strong>{title}</strong>
                <em>
                  Image {shown + 1} of {frames.length}
                </em>
              </span>
              <button className="lightbox-close" onClick={() => setShown(null)} aria-label="Close">
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
