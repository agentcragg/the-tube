// Endeavour and its neighbours on Deptford Broadway, with the basement
// cinema cut away underneath. A pencil line drawing in greys: the only
// colour is the film's.
//
// One wide drawing (2000 x 240). The strip crops it with "slice": a wide
// screen sees the whole street, a phone sees just Endeavour, top to bottom.
// Colours come from CSS variables that change with data-state on the
// wrapper (app/endeavour.css); things that come and go per state are in
// <Layer>, which fades in when the state changes.

import { thumb } from "@/lib/videos";
import type { Scene as SceneT, State } from "./state";

const G = 130; // ground line

// Deterministic "random", so the server and the browser draw the same skyline
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const FAR_SKYLINE = (() => {
  const r = seeded(11);
  let d = `M0 ${G}`;
  let x = 0;
  while (x < 2000) {
    const w = 36 + Math.round(r() * 64);
    const top = G - 40 - Math.round(r() * 46);
    d += ` V${top}`;
    if (r() < 0.35) {
      const cx = x + 8 + Math.round(r() * Math.max(0, w - 22));
      d += ` H${cx} V${top - 8} H${cx + 7} V${top}`;
    }
    x = Math.min(x + w, 2000);
    d += ` H${x}`;
  }
  return `${d} V${G} Z`;
})();

// Neighbours along the Broadway. Invented shapes, not the real buildings.
const TERRACE = [
  { x: 170, w: 130, top: 50, tone: 1, lit: [2] },
  { x: 300, w: 130, top: 44, tone: 2, lit: [1] },
  { x: 430, w: 130, top: 36, tone: 1, lit: [] },
  { x: 560, w: 130, top: 28, tone: 2, lit: [0, 4] },
  { x: 690, w: 140, top: 40, tone: 1, lit: [2] },
  { x: 1170, w: 130, top: 30, tone: 2, lit: [1] },
  { x: 1300, w: 140, top: 60, tone: 1, lit: [] },
  { x: 1440, w: 130, top: 34, tone: 2, lit: [3] },
  { x: 1570, w: 130, top: 50, tone: 1, lit: [0] },
  { x: 1700, w: 130, top: 42, tone: 2, lit: [] },
];

const LAMPS = [364, 806, 1270, 1640];

// Stones in the soil, and the neighbours' cellars, for the ant-farm look
const PEBBLES = (() => {
  const r = seeded(5);
  return Array.from({ length: 70 }, () => ({
    x: Math.round(r() * 2000),
    y: G + 12 + Math.round(r() * 90),
    rx: 1.5 + Math.round(r() * 30) / 10,
  })).filter((p) => p.x < 820 || p.x > 1180);
})();
const CELLARS = [
  { x: 700, w: 118, h: 50 },
  { x: 1182, w: 104, h: 46 },
  { x: 440, w: 108, h: 42 },
  { x: 1452, w: 112, h: 48 },
];

// Thirty seats in three rows, seen from behind. Far row first so nearer heads overlap.
const ROWS = [
  { y: 187, r: 3.3, x0: 858 },
  { y: 196, r: 3.9, x0: 867 },
  { y: 205.5, r: 4.4, x0: 853 },
];
const SEATS = ROWS.flatMap((row) => Array.from({ length: 10 }, (_, i) => ({ x: row.x0 + i * 19, y: row.y, r: row.r })));
const EARLY = [3, 4, 14, 15, 16, 25]; // seats already taken while the queue is on the stairs

// Endeavour's shopfront, from photos: the wooden door to the flats (39) and
// the black bar door, each under a barred transom, then the big window with
// a ledge, stools, hanging bulbs and a round extractor in the corner.
const WINDOW = { x: 925, y: 82, w: 233, h: 44 };
const GOOSENECKS = [848, 896, 944, 992, 1040, 1088, 1136];
const BULBS = [948, 1004, 1062, 1118];
const STOOLS = [958, 990, 1022, 1054, 1086];

// People at the ledge in the big window, by state
const BAR_X = [944, 976, 1010, 1046, 1090, 1122];
const BAR_PEOPLE: Record<State, number[]> = {
  morning: [],
  day: [1],
  evening: [0, 2, 4],
  setup: [0, 2, 4],
  queue: [0, 1, 2, 5],
  screening: [2, 4],
  after: [0, 1, 2, 3, 5],
  night: [],
  egg: [],
};

// Stairs down at the back: eight steps from the bar floor to the basement floor
const STEP_RUN = 8;
const STEP_RISE = 10;
const STAIR_TOP = 1166;
const stairPoints = (() => {
  const pts: string[] = [`${STAIR_TOP},${G}`];
  for (let k = 1; k <= 8; k++) {
    const x = STAIR_TOP - STEP_RUN * k;
    pts.push(`${x + STEP_RUN},${G + STEP_RISE * k}`, `${x},${G + STEP_RISE * k}`);
  }
  pts.push(`${STAIR_TOP},${G + STEP_RISE * 8}`);
  return pts.join(" ");
})();
const stepAt = (k: number) => ({ x: STAIR_TOP - STEP_RUN * k + STEP_RUN / 2, y: G + STEP_RISE * k });

const LAMPS_ON: State[] = ["evening", "setup", "queue", "screening", "after", "night", "egg"];
const CHAIRS_OUT: State[] = ["setup", "queue"];
const CHAIRS_STACKED: State[] = ["after", "night", "egg", "morning", "day", "evening"];

function Terrace({ x, w, top, tone, lit }: (typeof TERRACE)[number]) {
  const cols = Math.max(2, Math.floor((w - 20) / 34));
  const gap = (w - cols * 16) / (cols + 1);
  const rows: number[] = [];
  for (let y = top + 12; y + 18 <= 78; y += 28) rows.push(y);
  return (
    <g>
      <rect className={`en-o en-nbr${tone}`} x={x} y={top} width={w} height={G - top} />
      <rect fill="url(#en-pencil)" x={x} y={top} width={w} height={82 - top} />
      <rect className={`en-o en-nbr${tone}`} x={x - 2} y={top - 4} width={w + 4} height={5} />
      {rows.map((y, row) =>
        Array.from({ length: cols }, (_, c) => {
          const i = row * cols + c;
          return (
            <rect
              key={`${y}-${c}`}
              className={`en-o ${lit.includes(i) ? "en-lit" : "en-win"}`}
              x={x + gap + c * (16 + gap)}
              y={y}
              width={16}
              height={18}
            />
          );
        }),
      )}
      <rect className="en-o en-fascia" x={x + 5} y={82} width={w - 10} height={9} />
      <rect className="en-o en-win" x={x + 9} y={95} width={w - 46} height={31} />
      <rect className="en-o en-door" x={x + w - 30} y={97} width={18} height={G - 97} />
      <g className="en-shutter">
        <rect className="en-o" x={x + 6} y={93} width={w - 12} height={G - 93} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={x + 6} x2={x + w - 6} y1={97 + i * 4.2} y2={97 + i * 4.2} />
        ))}
      </g>
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g>
      <path className="en-post" d={`M${x} ${G} V62 Q${x} 56 ${x + 8} 56`} />
      <rect className="en-o en-lamp" x={x + 5} y={56} width={9} height={4.5} rx={1} />
    </g>
  );
}

// A sash window: one glazing bar across the middle and one down it
function Sash({ x, y, w, h, lit }: { x: number; y: number; w: number; h: number; lit?: boolean }) {
  return (
    <g>
      <rect className={`en-o ${lit ? "en-lit" : "en-win"}`} x={x} y={y} width={w} height={h} />
      <line className="en-bar-line" x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} />
      <line className="en-bar-line" x1={x + w / 2} x2={x + w / 2} y1={y} y2={y + h} />
      <rect className="en-o en-end" x={x - 2} y={y + h} width={w + 4} height={2.5} />
    </g>
  );
}

// A transom over a door: glass with upright bars
function Transom({ x, w }: { x: number; w: number }) {
  const bars = Array.from({ length: Math.floor(w / 6) - 1 }, (_, i) => x + 6 * (i + 1));
  return (
    <g>
      <rect className="en-o en-win" x={x} y={83} width={w} height={11} />
      <path className="en-bar-line" d={bars.map((bx) => `M${bx} 83 V94`).join(" ")} />
    </g>
  );
}

// A brass gooseneck on the batten, its shade pointing down at the sign
function Gooseneck({ x }: { x: number }) {
  return (
    <g>
      <path className="en-post en-post-thin" d={`M${x} 58 V53 Q${x} 51 ${x + 3} 51 H${x + 5}`} />
      <path className="en-o en-lamp" d={`M${x + 3} 52.5 H${x + 8} L${x + 10.5} 58 H${x + 0.5} Z`} />
    </g>
  );
}

// Endeavour itself: bar at street level, basement cinema below
function Endeavour() {
  return (
    <g>
      <rect className="en-o en-end" x={830} y={22} width={340} height={G - 22} />
      <rect fill="url(#en-pencil)" x={830} y={22} width={340} height={36} />
      <rect className="en-o en-end" x={826} y={17} width={348} height={6} />
      <rect className="en-o en-win" x={900} y={34} width={7} height={7} />
      <Sash x={925} y={27} w={44} h={22} />
      <Sash x={1022} y={27} w={48} h={22} lit />

      {/* Timber batten with the lamps, over the black fascia */}
      <rect className="en-o en-batten" x={834} y={58} width={332} height={3} />
      {GOOSENECKS.map((x) => (
        <Gooseneck key={x} x={x} />
      ))}
      <rect className="en-o en-fascia" x={836} y={61} width={328} height={20} />
      <text className="en-sign" x={1000} y={78} textAnchor="middle" textLength={262} lengthAdjust="spacing">
        ENDEAVOUR
      </text>

      {/* Painted frame round the whole shopfront */}
      <rect className="en-o en-frame" x={836} y={81} width={328} height={G - 81} />
      {/* The flats' door, 39 */}
      <Transom x={841} w={36} />
      <rect className="en-o en-wood" x={841} y={96} width={36} height={G - 96} />
      {[
        [845, 101],
        [861, 101],
        [845, 115],
        [861, 115],
      ].map(([px, py]) => (
        <rect key={`${px}-${py}`} className="en-o en-panel" x={px} y={py} width={12} height={11} />
      ))}
      <text className="en-number" x={846} y={99.6}>
        39
      </text>
      {/* The bar door */}
      <Transom x={882} w={38} />
      <rect className="en-o en-door" x={884} y={96} width={34} height={G - 96} />
      <rect className="en-o en-win" x={888} y={99} width={26} height={27} />
      {/* The big window */}
      <rect className="en-o en-bar" x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
      <line className="en-bar-line" x1={WINDOW.x} x2={WINDOW.x + WINDOW.w} y1={109} y2={109} />
      <path className="en-rail" d={STOOLS.map((x) => `M${x - 4} 114 H${x + 4} M${x - 2.5} 114 V126 M${x + 2.5} 114 V126`).join(" ")} />
      <line className="en-bar-line" x1={1032} x2={1032} y1={WINDOW.y} y2={WINDOW.y + WINDOW.h} />
      <path className="en-cord" d={BULBS.map((x, i) => `M${x} ${WINDOW.y} V${WINDOW.y + (i % 2 ? 9 : 13)}`).join(" ")} />
      {BULBS.map((x, i) => (
        <circle key={x} className="en-o en-lamp" cx={x} cy={WINDOW.y + (i % 2 ? 11 : 15)} r={2.2} />
      ))}
      {/* The film on next, in the bottom corner of the window */}
      <rect className="en-o en-case" x={929} y={104} width={16} height={21} />
      <rect className="en-poster" x={930.5} y={105.5} width={13} height={18} />
      <circle className="en-o en-vent" cx={1143} cy={92} r={6.5} />
      <path className="en-bar-line" d="M1137.5 89.5 H1148.5 M1136.8 92 H1149.2 M1137.5 94.5 H1148.5" />
      {/* Brick pier on the right */}
      <rect className="en-o en-end" x={1160} y={61} width={10} height={G - 61} />
    </g>
  );
}

// The chalkboard on the pavement, and the street sign on its post
function StreetFurniture() {
  return (
    <g>
      <path className="en-o en-aboard-frame" d="M1128 112 H1146 L1149.5 130 H1124.5 Z" />
      <path className="en-o en-aboard" d="M1130 114.5 H1144 L1146.5 127.5 H1127.5 Z" />
      <path className="en-chalk" d="M1131.5 118 H1140 M1131 121.5 H1142.5 M1130.5 125 H1138" />
      <path className="en-post" d={`M1182 ${G} V60`} />
      <rect className="en-o en-street-sign" x={1185} y={63} width={64} height={12} rx={1} />
      <text className="en-street-sign-text" x={1217} y={71.6} textAnchor="middle">
        Deptford Broadway
      </text>
    </g>
  );
}

function Basement() {
  return (
    <g>
      <rect className="en-o en-wall" x={828} y={G} width={344} height={86} />
      <rect className="en-room" x={834} y={G + 2} width={332} height={78} />
      <rect className="en-o en-wall" x={828} y={G} width={314} height={10} />
      <rect className="en-o en-screen" x={872} y={147} width={128} height={44} />
      <polygon className="en-o en-stair" points={stairPoints} />
      <path className="en-rail" d={`M${STAIR_TOP - 4} ${G + 2} L${STAIR_TOP - 64} ${G + 76}`} />
      {/* Projector on its stand */}
      <path className="en-rail" d="M1077 162 L1070 210 M1077 162 L1084 210 M1077 162 V210" />
      <rect className="en-o en-projector" x={1066} y={150} width={22} height={12} rx={1.5} />
      <circle className="en-o en-lens" cx={1066} cy={156} r={2.6} />
    </g>
  );
}

function Head({ x, y, r, rim }: { x: number; y: number; r: number; rim?: boolean }) {
  return (
    <g>
      {rim && <circle className="en-rim" cx={x} cy={y - 1.1} r={r + 0.25} />}
      <ellipse className="en-body" cx={x} cy={y + r * 2.1} rx={r * 1.75} ry={r * 1.35} />
      <circle className="en-body" cx={x} cy={y} r={r} />
    </g>
  );
}

function StandingFigure({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle className="en-figure" cx={x} cy={y - 16} r={3.2} />
      <rect className="en-figure" x={x - 3.4} y={y - 12.5} width={6.8} height={12.5} rx={2.6} />
    </g>
  );
}

function StackedChairs({ x }: { x: number }) {
  const seats = Array.from({ length: 6 }, (_, i) => `M${x} ${196 - i * 3} H${x + 12}`).join(" ");
  return <path className="en-stack" d={`M${x} 210 V196 M${x + 12} 210 V172 ${seats}`} />;
}

// Everything that belongs to one state. Keyed by state, so it fades in on change.
function Layer({ scene }: { scene: SceneT }) {
  const { state } = scene;
  return (
    <g className="en-layer">
      {LAMPS_ON.includes(state) &&
        LAMPS.map((x) => <path key={x} className="en-pool" d={`M${x + 6} 60.5 H${x + 13} L${x + 32} ${G} H${x - 13} Z`} />)}

      {/* People at the ledge in the big window */}
      <g clipPath="url(#en-windows)">
        {BAR_PEOPLE[state].map((i) => {
          const x = BAR_X[i];
          return (
            <g key={i} className="en-figure">
              <circle cx={x} cy={102} r={4.5} />
              <path d={`M${x - 9} 127 Q${x - 9} 109.5 ${x} 109.5 Q${x + 9} 109.5 ${x + 9} 127 Z`} />
            </g>
          );
        })}
      </g>

      {/* Morning deliveries on the pavement */}
      {state === "morning" && (
        <g>
          {[1092, 1107].map((x) => (
            <g key={x}>
              <rect className="en-o en-keg" x={x} y={114} width={13} height={16} rx={2.5} />
              <path className="en-rail" d={`M${x} 118.5 H${x + 13} M${x} 125.5 H${x + 13}`} />
            </g>
          ))}
          <rect className="en-o en-crate" x={1060} y={119} width={24} height={11} />
          <rect className="en-o en-crate" x={1062} y={108} width={24} height={11} />
          <path className="en-rail" d="M1066 119 V130 M1078 119 V130 M1068 108 V119 M1080 108 V119" />
        </g>
      )}

      {/* Basement */}
      <g clipPath="url(#en-room)">
        {CHAIRS_STACKED.includes(state) && (
          <g>
            <StackedChairs x={840} />
            <StackedChairs x={856} />
          </g>
        )}
        {CHAIRS_OUT.includes(state) &&
          SEATS.map((s, i) =>
            state === "queue" && EARLY.includes(i) ? null : (
              <rect key={i} className="en-chair" x={s.x - 3.6} y={s.y - 2.5} width={7.2} height={7.5} rx={1} />
            ),
          )}
        {state === "queue" && (
          <g className="en-crowd">
            {EARLY.map((i) => (
              <Head key={i} {...SEATS[i]} />
            ))}
            {[2, 3, 4, 5, 6].map((k) => (
              <StandingFigure key={k} {...stepAt(k)} />
            ))}
          </g>
        )}
        {state === "after" && <StandingFigure x={900} y={210} />}
        {(state === "screening" || state === "egg") && (
          <polygon className={state === "egg" ? "en-beam en-beam-egg" : "en-beam"} points="1000,147 1066,156 1000,191" />
        )}
        {state === "screening" && (
          <g className="en-audience">
            {SEATS.map((s, i) => (
              <Head key={i} {...s} rim />
            ))}
          </g>
        )}
      </g>
    </g>
  );
}

export default function Scene({ scene }: { scene: SceneT | null }) {
  return (
    <svg viewBox="0 0 2000 240" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <defs>
        {/* Wobbles every line a little, like a pencil drawing */}
        <filter id="en-wobble" x="-1%" y="-4%" width="102%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id="en-hatch" width={16} height={14} patternUnits="userSpaceOnUse">
          <path d="M2 11 l5 -3 M10 5 l4 -2" className="en-hatch" />
        </pattern>
        <pattern id="en-pencil" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0 4.5 H6" className="en-pencil" />
        </pattern>
        <clipPath id="en-room">
          <rect x={834} y={G + 2} width={332} height={78} />
        </clipPath>
        <clipPath id="en-windows">
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
        </clipPath>
      </defs>

      <g filter="url(#en-wobble)">
        <rect className="en-sky" x={0} y={0} width={2000} height={G} />
        <g className="en-night-sky">
          <circle cx={872} cy={9} r={6} className="en-moon" />
          {[
            [700, 18],
            [818, 8],
            [900, 12],
            [1040, 9],
            [1184, 25],
            [1262, 13],
            [1400, 9],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={0.9} className="en-star" />
          ))}
        </g>
        <path className="en-far" d={FAR_SKYLINE} />
        {TERRACE.map((t) => (
          <Terrace key={t.x} {...t} />
        ))}
        <Endeavour />
        {LAMPS.map((x) => (
          <Lamp key={x} x={x} />
        ))}
        <StreetFurniture />
        <rect className="en-o en-pave" x={-4} y={G} width={2008} height={5} />
        <rect className="en-earth" x={0} y={G + 5} width={2000} height={110} />
        <rect fill="url(#en-hatch)" x={0} y={G + 5} width={2000} height={110} />
        {PEBBLES.map((p, i) => (
          <ellipse key={i} className="en-pebble" cx={p.x} cy={p.y} rx={p.rx} ry={p.rx * 0.7} />
        ))}
        {CELLARS.map((c) => (
          <rect key={c.x} className="en-cellar" x={c.x} y={G + 5} width={c.w} height={c.h} />
        ))}
        <Basement />
        {scene && <Layer key={scene.state} scene={scene} />}
      </g>

      {/* 3:14am: the projector runs for an empty room, showing something off the wall */}
      {scene?.eggVideo && (
        <image
          key={scene.eggVideo}
          className="en-layer en-egg"
          href={thumb(scene.eggVideo, "mq")}
          x={872}
          y={147}
          width={128}
          height={44}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
    </svg>
  );
}
