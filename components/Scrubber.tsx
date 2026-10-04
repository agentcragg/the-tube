"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ditherSrc, type DitherWidth } from "@/lib/dither";
import { barsFor, zoomPastBars } from "@/lib/letterbox";
import { CYCLE_FIRST_MS, CYCLE_MS } from "@/lib/use-cycle";
import { useLook } from "@/lib/use-look";

// A film's stills in a row, one showing at a time.
// Mouse: move across the image to scrub through them, like old YouTube thumbnails.
// Touch: swipe sideways to flick through them.
// With `cycle` (the look switch's idea) the mouse doesn't scrub: resting on
// it steps through the frames after the first by itself, as 2008 YouTube did.
// With no real frames it shows generated placeholders.
// A still with black bars baked in is zoomed just past them (lib/letterbox.ts).
// With the look switch's "dither" idea, a scrubber given a dither width shows
// its first still as a dithered GIF until the pointer arrives (ideas.css).

const PLACEHOLDER_FRAMES = 4;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function placeholder(seed: string, i: number) {
  const h = hash(`${seed}:${i}`);
  const hue = h % 360;
  const x = (h >> 8) % 100;
  const y = (h >> 16) % 100;
  return `radial-gradient(circle at ${x}% ${y}%, hsl(${hue} 70% 60%) 0, transparent 45%),
    linear-gradient(${h % 180}deg, hsl(${(hue + 40) % 360} 35% 22%), hsl(${(hue + 200) % 360} 30% 8%))`;
}

// One still, in its own clipping box. A still listed in lib/letterbox.ts as
// having black bars zooms in past them once it has loaded, inside that box
// (so the strip's scrolling and swiping don't see the zoom).
function Still({ src, alt, eager, dither }: { src: string; alt: string; eager: boolean; dither?: string }) {
  const [zoom, setZoom] = useState(1);
  const bars = barsFor(src);
  const check = useCallback(
    (img: HTMLImageElement) => {
      if (!bars || !img.naturalWidth) return;
      const frame = img.clientWidth && img.clientHeight ? img.clientWidth / img.clientHeight : 16 / 9;
      setZoom(zoomPastBars(bars, img.naturalWidth / img.naturalHeight, frame));
    },
    [bars],
  );
  // A picture that finished loading before the page came to life never fires onLoad
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) check(img);
  }, [check]);
  const style = zoom > 1 ? { transform: `scale(${zoom})` } : undefined;
  return (
    <span className="scrub-frame">
      {dither && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="scrub-dither" src={dither} alt="" loading={eager ? "eager" : "lazy"} draggable={false} style={style} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        onLoad={(e) => check(e.currentTarget)}
        style={style}
      />
    </span>
  );
}

export default function Scrubber({
  frames,
  seed,
  alt,
  duration,
  lazy,
  watched,
  cycle,
  dither,
}: {
  frames: string[];
  seed: string;
  alt: string;
  duration?: string; // e.g. "2:24:21"; badge hidden when not given
  lazy?: boolean; // don't load even the first frame until it's on screen (e.g. inside a closed panel)
  watched?: boolean; // already seen in this browser (lib/watched.ts): the bar stays full, on touch screens too
  cycle?: boolean;
  dither?: DitherWidth; // about the width it's shown at, for the "dither" idea
}) {
  const count = frames.length || PLACEHOLDER_FRAMES;
  const dithered = useLook("dither") && dither;
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (n: number) => {
    setI(n);
    const s = strip.current;
    if (s) s.scrollLeft = n * s.clientWidth;
  };

  // Frames 1, 2, 3, then round again; frame 0 is the still it rests on
  const startCycle = () => {
    clearTimeout(timer.current);
    let n = 0;
    const step = () => {
      show((n++ % (count - 1)) + 1);
      timer.current = setTimeout(step, CYCLE_MS);
    };
    timer.current = setTimeout(step, CYCLE_FIRST_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
      className={["scrub", watched && "scrub-watched", dither && "scrub-ditherable"].filter(Boolean).join(" ")}
      onMouseMove={(e) => {
        if (cycle) return;
        const r = e.currentTarget.getBoundingClientRect();
        const n = Math.min(count - 1, Math.floor(((e.clientX - r.left) / r.width) * count));
        if (n !== i) show(n);
      }}
      onMouseEnter={() => {
        setActive(true);
        if (cycle && count > 1) startCycle();
      }}
      onMouseLeave={() => {
        clearTimeout(timer.current);
        setActive(false);
        show(0);
      }}
    >
      <div
        ref={strip}
        className="scrub-strip"
        onScroll={(e) => {
          const s = e.currentTarget;
          setI(Math.round(s.scrollLeft / s.clientWidth));
        }}
      >
        {Array.from({ length: count }, (_, n) =>
          frames.length ? (
            <Still
              key={n}
              src={frames[n]}
              alt={n === 0 ? alt : ""}
              eager={n === 0 && !lazy}
              dither={dithered && n === 0 ? ditherSrc(frames[n], dithered) : undefined}
            />
          ) : (
            <div
              key={n}
              className="scrub-placeholder"
              style={{ background: placeholder(seed, n) }}
              role={n === 0 ? "img" : undefined}
              aria-label={n === 0 ? `${alt} (placeholder still)` : undefined}
            />
          ),
        )}
      </div>
      {duration && <span className="scrub-time">{duration}</span>}
      {(count > 1 || watched) && (
        <div className="scrub-bar" aria-hidden>
          <div style={{ width: active ? `${((i + 1) / count) * 100}%` : watched ? "100%" : 0 }} />
        </div>
      )}
      {/* DRAFT: screen readers only */}
      {watched && <span className="sr-only">Watched</span>}
    </div>
  );
}
