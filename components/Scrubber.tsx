"use client";

import { useState } from "react";

// Hover across the image to scrub through frames, like old YouTube thumbnails.
// With no real frames it shows generated placeholders.

const PLACEHOLDER_FRAMES = 6;

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

export default function Scrubber({
  frames,
  seed,
  alt,
  duration,
}: {
  frames: string[];
  seed: string;
  alt: string;
  duration?: string; // e.g. "1:52:00"; badge hidden when unknown
}) {
  const count = frames.length || PLACEHOLDER_FRAMES;
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);

  return (
    <div
      className="scrub"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setI(Math.min(count - 1, Math.floor(((e.clientX - r.left) / r.width) * count)));
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        setI(0);
      }}
    >
      {frames.length ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frames[i]} alt={alt} />
      ) : (
        <div
          className="scrub-placeholder"
          style={{ background: placeholder(seed, i) }}
          role="img"
          aria-label={`${alt} (placeholder still)`}
        >
          <span>still {i + 1}/{count}</span>
        </div>
      )}
      <div className="scrub-bar" aria-hidden>
        <div style={{ width: active ? `${((i + 1) / count) * 100}%` : 0 }} />
      </div>
      {duration && <span className="scrub-time">{duration}</span>}
    </div>
  );
}
