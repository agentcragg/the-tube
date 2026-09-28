"use client";

import { useCallback, useRef, useState } from "react";
import { barsFor, zoomPastBars } from "@/lib/letterbox";

// A film's stills in a row, one showing at a time.
// Mouse: move across the image to scrub through them, like old YouTube thumbnails.
// Touch: swipe sideways to flick through them.
// With no real frames it shows generated placeholders.
// A still with black bars baked in is zoomed just past them (lib/letterbox.ts).

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
function Still({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
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
  return (
    <span className="scrub-frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        onLoad={(e) => check(e.currentTarget)}
        style={zoom > 1 ? { transform: `scale(${zoom})` } : undefined}
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
}: {
  frames: string[];
  seed: string;
  alt: string;
  duration?: string; // e.g. "2:24:21"; badge hidden when not given
  lazy?: boolean; // don't load even the first frame until it's on screen (e.g. inside a closed panel)
}) {
  const count = frames.length || PLACEHOLDER_FRAMES;
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  const show = (n: number) => {
    setI(n);
    const s = strip.current;
    if (s) s.scrollLeft = n * s.clientWidth;
  };

  return (
    <div
      className="scrub"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const n = Math.min(count - 1, Math.floor(((e.clientX - r.left) / r.width) * count));
        if (n !== i) show(n);
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
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
            <Still key={n} src={frames[n]} alt={n === 0 ? alt : ""} eager={n === 0 && !lazy} />
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
      {count > 1 && (
        <div className="scrub-bar" aria-hidden>
          <div style={{ width: active ? `${((i + 1) / count) * 100}%` : 0 }} />
        </div>
      )}
    </div>
  );
}
