"use client";

// Two times of year on the drawing, for the look switch:
//   "pumpkin": a carved pumpkin on the sill of the flat above Endeavour for
//   the last week of October, two more by the bar on Halloween itself, lit
//   after dark, and one smashed on the pavement the morning after.
//   "fireworks": fireworks over the rooftops on the evenings around Bonfire
//   Night (most on the 5th) and at midnight on New Year's Eve.
// Both follow London time and the time switch, with ?today for the date.
//
// The drawing's pencil wobble is a filter over the whole street, and anything
// that moves inside it makes the browser redo the filter every frame. So the
// pumpkins sit still in the drawing (<SeasonalStreet>), and what moves (the
// fireworks, the candlelight) is drawn on a second, see-through layer over it
// (<SeasonalSky>).

import { londonParts, useLondonNow } from "@/lib/clock";
import { useLook } from "@/lib/use-look";
import type { Scene, State } from "./state";
import { usePicked } from "./use-scene";

const G = 130; // ground line, as in Scene.tsx
const EVENING: State[] = ["evening", "setup", "queue", "screening", "after"];
const DARK: State[] = [...EVENING, "night", "egg"];

// The day before a London date (YYYY-MM-DD)
const dayBefore = (iso: string) => new Date(Date.parse(iso + "T12:00:00Z") - 86_400_000).toISOString().slice(0, 10);

// ---------- Pumpkins ----------

type Pumpkins = { count: number; lit: boolean; smashed: boolean };

function pumpkinsOn(isoDate: string, state: State): Pumpkins {
  // Before 6am it's still the night before
  const md = (state === "night" || state === "egg" ? dayBefore(isoDate) : isoDate).slice(5);
  const count = md === "10-31" ? 3 : md >= "10-24" && md <= "10-30" ? 1 : 0;
  // Candles in the evening, burnt out by the small hours
  return { count, lit: count > 0 && EVENING.includes(state), smashed: md === "11-01" && (state === "morning" || state === "day") };
}

// Bottom centre on (x, y)
const SPOTS = [
  { x: 947, y: 49, s: 1.35 }, // on the sill of the flat upstairs
  { x: 1113, y: G, s: 1.6 }, // on the pavement by the chalkboard
  { x: 1106, y: 109, s: 1.15 }, // on the ledge in the big window
];

function Pumpkin({ x, y, s, lit }: { x: number; y: number; s: number; lit: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="en-o en-pumpkin" cx={-3.3} cy={-4.4} rx={3.6} ry={4.3} />
      <ellipse className="en-o en-pumpkin" cx={3.3} cy={-4.4} rx={3.6} ry={4.3} />
      <ellipse className="en-o en-pumpkin" cx={0} cy={-4.6} rx={3.3} ry={4.6} />
      <path className="en-o en-stalk" d="M-0.7 -8.9 Q-0.6 -10.9 1.5 -11.5 L2 -10.6 Q0.8 -10.1 0.8 -8.9 Z" />
      <path
        className={lit ? "en-pumpkin-face en-pumpkin-lit" : "en-pumpkin-face"}
        d="M-3.6 -5.3 L-2.3 -7.2 L-1 -5.3 Z M1 -5.3 L2.3 -7.2 L3.6 -5.3 Z M-4 -3.4 Q0 -1.7 4 -3.4 Q3.3 -0.9 1.7 -1.2 L1.1 -2 L0.4 -1 L-0.4 -1 L-1.1 -2 L-1.7 -1.2 Q-3.3 -0.9 -4 -3.4 Z"
      />
    </g>
  );
}

// The morning after: what's left of one, kicked about on the pavement.
// Drawn round (0, 0) on the ground, then moved and scaled into place.
function Smashed({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${G}) scale(1.4)`}>
      <path className="en-o en-pumpkin-flesh" d="M-10 0 Q-10 -7 -3 -7.5 L-1 -5.5 L1.5 -7.8 L3 -5 L5.5 -6.8 Q9 -5 9 0 Z" />
      <path className="en-o en-pumpkin" d="M-10 0 Q-10 -7 -3 -7.5 L-2 -6.4 Q-7.6 -5.6 -7.6 0 Z M9 0 Q9 -5 5.5 -6.8 L5 -5.6 Q7 -4.2 7 0 Z" />
      <path className="en-pumpkin-face" d="M-6.6 -1.4 L-5.4 -3.8 L-4.2 -1.4 Z" />
      <path className="en-o en-pumpkin" d="M13 0 L15 -3.2 L18.5 -2.2 L18 0 Z" />
      <path className="en-o en-pumpkin" d="M-17 0 L-16 -2.4 L-13 -1.8 L-13.5 0 Z" />
      <path className="en-o en-stalk" d="M23 -0.4 q1.5 -2.8 3.8 -1.8 l-0.5 1.1 q-1.5 -0.5 -2.4 1.2 Z" />
      {[
        [-20, -0.8],
        [11, -0.6],
        [20.5, -1.2],
        [-12, -0.5],
        [27, -0.7],
      ].map(([sx, sy]) => (
        <ellipse key={sx} className="en-pumpkin-seed" cx={sx} cy={sy} rx={0.9} ry={0.5} />
      ))}
    </g>
  );
}

/** Drawn into the street, under the pencil wobble. */
export function SeasonalStreet({ scene }: { scene: Scene }) {
  const on = useLook("pumpkin");
  const now = useLondonNow();
  if (!on || !now) return null;
  const p = pumpkinsOn(londonParts(now).isoDate, scene.state);
  return (
    <g className="x-pumpkin">
      {SPOTS.slice(0, p.count).map((spot) => (
        <Pumpkin key={spot.x} {...spot} lit={p.lit} />
      ))}
      {p.smashed && <Smashed x={992} />}
    </g>
  );
}

// ---------- Fireworks ----------

// Busy on the 5th and at New Year, now and then on the nights either side of the 5th
function fireworksOn(isoDate: string, hour: number): "busy" | "few" | null {
  const md = isoDate.slice(5);
  if ((md === "12-31" && hour >= 23) || (md === "01-01" && hour < 1)) return "busy";
  if (md === "11-05" && hour >= 17) return "busy";
  if (md >= "11-01" && md <= "11-08" && hour >= 18) return "few";
  return null;
}

// Where they go up, high enough to clear the rooftops; the first two are over
// Endeavour, so a phone (which sees only Endeavour) gets them too
const BURSTS = [
  { x: 1010, y: -24, r: 21, dur: 7.9, delay: 0.4 },
  { x: 890, y: -20, r: 15, dur: 11.3, delay: 3.9 },
  { x: 1190, y: -26, r: 18, dur: 9.7, delay: 2.2 },
  { x: 430, y: -23, r: 20, dur: 10.1, delay: 1.3 },
  { x: 1650, y: -25, r: 22, dur: 12.7, delay: 5.1 },
  { x: 700, y: -27, r: 16, dur: 8.9, delay: 6.8 },
  { x: 1880, y: -21, r: 18, dur: 13.9, delay: 3.1 },
  { x: 180, y: -26, r: 19, dur: 9.3, delay: 6 },
];
const RAYS = 16;

function Burst({ x, y, r, dur, delay, i }: (typeof BURSTS)[number] & { i: number }) {
  const rays = Array.from({ length: RAYS }, (_, k) => {
    const a = ((k + (i % 2) * 0.5) / RAYS) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${(x + c * r * 0.3).toFixed(1)} ${(y + s * r * 0.3).toFixed(1)} L${(x + c * r).toFixed(1)} ${(y + s * r).toFixed(1)}`;
  }).join(" ");
  const style = { "--dur": `${dur}s`, "--delay": `${delay}s` } as React.CSSProperties;
  return (
    <g className={i % 3 === 2 ? "en-fw en-fw-dim" : "en-fw"} style={style}>
      <line className="en-fw-trail" x1={x - 2} y1={6} x2={x} y2={y} pathLength={1} />
      <path className="en-fw-burst" d={rays} />
    </g>
  );
}

/** A see-through layer over the drawing, for what moves. */
export function SeasonalSky({ scene }: { scene: Scene | null }) {
  const pumpkins = useLook("pumpkin");
  const fireworks = useLook("fireworks");
  const picked = usePicked();
  const now = useLondonNow();
  if (!scene || !now || (!pumpkins && !fireworks)) return null;

  const { isoDate, hour } = londonParts(now);
  // From the time switch there's no real hour: say late evening for the night, 3am for 3am
  const h = picked ? (scene.state === "egg" ? 3 : scene.state === "night" ? 23 : 21) : hour;
  const fw = fireworks && DARK.includes(scene.state) ? fireworksOn(isoDate, h) : null;
  const p = pumpkins ? pumpkinsOn(isoDate, scene.state) : null;
  if (!fw && !p?.lit) return null;

  return (
    <svg className="en-sky-layer" viewBox="0 -44 2000 284" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="en-candle">
          <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {fw && (
        <g className="x-fireworks">
          {BURSTS.slice(0, fw === "busy" ? BURSTS.length : 2).map((b, i) => (
            <Burst key={b.x} {...b} i={i} dur={fw === "busy" ? b.dur : b.dur * 3.2} />
          ))}
        </g>
      )}
      {p?.lit && (
        <g className="x-pumpkin">
          {SPOTS.slice(0, p.count).map(({ x, y, s }, i) => (
            <circle key={x} className="en-candle" cx={x} cy={y - 4 * s} r={9 * s} style={{ animationDelay: `${-i * 0.7}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
}
