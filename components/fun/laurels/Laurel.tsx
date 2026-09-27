"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useLondonNow } from "@/lib/clock";
import { LAUREL_LABEL, laurelLines, SHOWN_BEFORE } from "./copy";
import LaurelMark from "./LaurelMark";
import { firstScreening, isProgrammed, nightDay } from "./screenings";

// Inside every wall tile. Most videos have never been in a running order, so
// they skip the clock altogether.
export function Laurel({ videoId }: { videoId: string }) {
  return isProgrammed(videoId) ? <Screened videoId={videoId} /> : null;
}

// A laurel in the corner once the night it was shown at is over, and in the
// tile's info the film it went before and, if there's room, the date. The clock is null while the
// page is built, so the built page has no laurels and they appear in the
// browser (the Fun lab's "Pretend it's…" moves them too).
function Screened({ videoId }: { videoId: string }) {
  const now = useLondonNow();
  const screening = now ? firstScreening(videoId, now) : undefined;

  // The words go inside the tile's own info overlay (.tile-info in Wall.tsx),
  // so they sit with the title and credit and show when they do.
  const [info, setInfo] = useState<Element | null>(null);
  const findInfo = useCallback((svg: SVGSVGElement | null) => {
    setInfo(svg?.closest(".tile")?.querySelector(".tile-info") ?? null);
  }, []);

  if (!screening) return null;
  return (
    <>
      <LaurelMark ref={findInfo} lines={laurelLines(screening.date.slice(0, 4))} label={LAUREL_LABEL} />
      {info &&
        createPortal(
          <em className="laurel-note" style={{ "--film": screening.colour } as React.CSSProperties}>
            <span className="laurel-what">
              {SHOWN_BEFORE} <cite>{screening.film}</cite>
            </span>
            <time className="laurel-when" dateTime={screening.date}>
              {nightDay(screening.date)}
            </time>
          </em>,
          info,
        )}
    </>
  );
}
