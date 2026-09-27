// Endeavour and its neighbours on Deptford Broadway, with the basement cinema
// cut away underneath. Drawn like a 2008 web graphic rather than a sketch:
// hard edges, blocky sprites, banded GIF skies and dithered soil.
//
// One wide drawing (2000 x 240). The strip crops it with "slice": a wide
// screen sees the whole street, a phone sees just Endeavour, top to bottom.
// Colours come from CSS variables that change with data-state on the
// wrapper (app/endeavour.css). The street is drawn in daylight colours and
// darkened by one overlay; anything lit (windows, bulbs, lamps, the sign) is
// drawn on top of it. Things that come and go per state are in <Layer>,
// which fades in when the state changes.

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

// Neighbours along the Broadway. Made-up shops, apart from the phone shop
// to the left and the navy door to the right, as in the photos.
type Shop = {
  x: number;
  w: number;
  top: number;
  wall: "stock" | "red" | "render";
  fascia: string;
  lit: number[]; // upstairs windows lit at night
  door?: string;
};
const TERRACE: Shop[] = [
  { x: 170, w: 130, top: 50, wall: "red", fascia: "#6b1e2b", lit: [2] },
  { x: 300, w: 130, top: 44, wall: "render", fascia: "#1f5a3a", lit: [1] },
  { x: 430, w: 130, top: 36, wall: "stock", fascia: "#b8860b", lit: [] },
  { x: 560, w: 130, top: 28, wall: "red", fascia: "#222222", lit: [0, 4] },
  { x: 690, w: 140, top: 40, wall: "stock", fascia: "#1d4f91", lit: [2] }, // the phone shop
  { x: 1170, w: 130, top: 30, wall: "stock", fascia: "#1b2440", lit: [1], door: "#1f2a4d" }, // navy door
  { x: 1300, w: 140, top: 60, wall: "render", fascia: "#5a2d82", lit: [] },
  { x: 1440, w: 130, top: 34, wall: "red", fascia: "#222222", lit: [3] },
  { x: 1570, w: 130, top: 50, wall: "stock", fascia: "#8a1c1c", lit: [0] },
  { x: 1700, w: 130, top: 42, wall: "render", fascia: "#1f5a3a", lit: [] },
];

const LAMPS = [364, 806, 1260, 1640];

// The neighbours' cellars
const CELLARS = [
  { x: 700, w: 118, h: 52 },
  { x: 1182, w: 104, h: 48 },
  { x: 440, w: 108, h: 44 },
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

// Endeavour's shopfront, from the photos: the wooden door to the flats (39),
// the black bar door, each under a barred transom, then the big window.
const FRONT = { x: 836, w: 328, top: 80 };
const WINDOW = { x: 925, y: 82, w: 233, h: 44 };
const BULBS = [948, 1004, 1062, 1118];
const STOOLS = [958, 990, 1022, 1054, 1086];

// People at the ledge in the big window, by state
const BAR_X = [944, 976, 1012, 1042, 1090, 1122];
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

const CHAIRS_OUT: State[] = ["setup", "queue"];
const CHAIRS_STACKED: State[] = ["after", "night", "egg", "morning", "day", "evening"];

// A white-framed sash window, top and bottom panes
function Sash({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect className="en-frame" x={x - 2} y={y - 2} width={w + 4} height={h + 5} />
      <rect className="en-glass" x={x} y={y} width={w} height={h} />
      <rect className="en-frame" x={x} y={y + h / 2 - 1} width={w} height={2} />
      <rect className="en-frame" x={x + w / 2 - 1} y={y} width={2} height={h} />
    </g>
  );
}

// Blocky "lettering" on a shop sign: bars, not words
function SignBars({ x, y, w }: { x: number; y: number; w: number }) {
  const bars: number[] = [];
  for (let bx = x; bx + 6 <= x + w; bx += 9) bars.push(bx);
  return (
    <g className="en-sign-bars">
      {bars.map((bx, i) => (
        <rect key={bx} x={bx} y={y} width={i % 4 === 3 ? 3 : 6} height={4} />
      ))}
    </g>
  );
}

function wallFill(wall: Shop["wall"]) {
  return wall === "render" ? "en-render" : undefined;
}

function Terrace({ x, w, top, wall, fascia, door }: Shop) {
  const cols = Math.max(2, Math.floor((w - 20) / 34));
  const gap = (w - cols * 16) / (cols + 1);
  const rows: number[] = [];
  for (let y = top + 12; y + 18 <= 76; y += 28) rows.push(y);
  return (
    <g>
      <rect className={wallFill(wall)} fill={wall === "render" ? undefined : `url(#en-brick-${wall})`} x={x} y={top} width={w} height={G - top} />
      <rect className="en-coping" x={x - 2} y={top - 4} width={w + 4} height={4} />
      {rows.map((y) =>
        Array.from({ length: cols }, (_, c) => <Sash key={`${y}-${c}`} x={x + gap + c * (16 + gap)} y={y} w={16} h={18} />),
      )}
      <rect x={x + 4} y={80} width={w - 8} height={12} fill={fascia} />
      <SignBars x={x + 14} y={84} w={w - 28} />
      <rect className="en-frame" x={x + 6} y={93} width={w - 12} height={G - 93} />
      <rect className="en-glass" x={x + 9} y={96} width={w - 46} height={31} />
      <rect x={x + w - 30} y={97} width={18} height={G - 97} fill={door ?? "#3a2e24"} />
      <g className="en-shutter">
        <rect x={x + 6} y={93} width={w - 12} height={G - 93} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} className="en-shutter-line" x={x + 6} y={96 + i * 4} width={w - 12} height={1} />
        ))}
      </g>
    </g>
  );
}

// Upstairs windows that light up at night, as coordinates of the Sash grid above
function terraceLit({ x, w, top, lit }: Shop) {
  const cols = Math.max(2, Math.floor((w - 20) / 34));
  const gap = (w - cols * 16) / (cols + 1);
  const rows: number[] = [];
  for (let y = top + 12; y + 18 <= 76; y += 28) rows.push(y);
  return lit
    .filter((i) => Math.floor(i / cols) < rows.length)
    .map((i) => ({ x: x + gap + (i % cols) * (16 + gap), y: rows[Math.floor(i / cols)] }));
}
const LIT_WINDOWS = TERRACE.flatMap(terraceLit);

function Lamp({ x }: { x: number }) {
  return (
    <g>
      <rect className="en-post" x={x - 1.5} y={60} width={3} height={G - 60} />
      <rect className="en-post" x={x - 1.5} y={56} width={12} height={3} />
      <rect className="en-lamp-head" x={x + 5} y={57} width={10} height={5} />
    </g>
  );
}

// Brass gooseneck lamps on the timber batten, pointing down at the sign
const GOOSENECKS = [848, 896, 944, 992, 1040, 1088, 1136];
function Gooseneck({ x }: { x: number }) {
  return (
    <g>
      <rect className="en-brass" x={x - 1} y={51} width={2} height={7} />
      <rect className="en-brass" x={x - 1} y={51} width={7} height={2} />
      <polygon className="en-brass" points={`${x + 3},53 ${x + 9},53 ${x + 11},59 ${x + 1},59`} />
    </g>
  );
}

// Endeavour itself: bar at street level, basement cinema below
function Endeavour() {
  const { x: fx, w: fw, top: ft } = FRONT;
  return (
    <g>
      <rect fill="url(#en-brick-stock)" x={830} y={22} width={340} height={G - 22} />
      <rect className="en-coping" x={826} y={18} width={348} height={5} />
      <rect className="en-vent-sq" x={900} y={34} width={7} height={7} />
      <Sash x={925} y={27} w={44} h={22} />
      <Sash x={1022} y={27} w={48} h={22} />

      {/* Timber batten with the lamps, over the black fascia and gold lettering */}
      <rect className="en-timber" x={834} y={58} width={332} height={3} />
      {GOOSENECKS.map((x) => (
        <Gooseneck key={x} x={x} />
      ))}
      <rect className="en-fascia" x={fx} y={61} width={fw} height={20} />
      <text className="en-sign" x={1000} y={79} textAnchor="middle" textLength={272} lengthAdjust="spacing">
        ENDEAVOUR
      </text>

      {/* Pale painted frames */}
      <rect className="en-frame" x={fx} y={ft} width={fw} height={G - ft} />
      {/* The flats' door, 39, and its barred transom */}
      <rect className="en-glass-dark" x={841} y={82} width={36} height={12} />
      <g className="en-bars">
        {[847, 853, 859, 865, 871].map((x) => (
          <rect key={x} x={x} y={82} width={1.5} height={12} />
        ))}
      </g>
      <rect className="en-wood" x={841} y={96} width={36} height={G - 96} />
      <rect className="en-wood-panel" x={845} y={100} width={12} height={12} />
      <rect className="en-wood-panel" x={861} y={100} width={12} height={12} />
      <rect className="en-wood-panel" x={845} y={116} width={12} height={12} />
      <rect className="en-wood-panel" x={861} y={116} width={12} height={12} />
      <rect className="en-number" x={847} y={97.5} width={8} height={4} />
      <text className="en-number-text" x={851} y={100.9} textAnchor="middle">
        39
      </text>
      {/* The bar door */}
      <rect className="en-glass-dark" x={882} y={82} width={38} height={12} />
      <g className="en-bars">
        {[888, 894, 900, 906, 912].map((x) => (
          <rect key={x} x={x} y={82} width={1.5} height={12} />
        ))}
      </g>
      <rect className="en-bar-door" x={884} y={96} width={34} height={G - 96} />
      <rect className="en-glass-dark" x={888} y={99} width={26} height={27} />
      {/* The big window: glass, ledge and stools, the round extractor */}
      <rect className="en-glass" x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
      <rect className="en-timber" x={WINDOW.x} y={109} width={WINDOW.w} height={2} />
      {STOOLS.map((x) => (
        <g key={x} className="en-stool">
          <rect x={x - 4} y={114} width={8} height={2} />
          <rect x={x - 3} y={116} width={1.5} height={10} />
          <rect x={x + 1.5} y={116} width={1.5} height={10} />
        </g>
      ))}
      <rect className="en-pillar" x={1030} y={WINDOW.y} width={4} height={WINDOW.h} />
      {/* The film on next is in the window, bottom left */}
      <rect className="en-poster-edge" x={929} y={104} width={16} height={21} />
      <rect className="en-poster" x={930} y={105} width={14} height={19} />
      <circle className="en-vent" cx={1143} cy={92} r={6.5} />
      <g className="en-vent-grille">
        <rect x={1137} y={89} width={12} height={1} />
        <rect x={1137} y={92} width={12} height={1} />
        <rect x={1137} y={95} width={12} height={1} />
      </g>
      <rect className="en-frame" x={WINDOW.x} y={126} width={WINDOW.w} height={4} />
      {/* Brick pier on the right, with the street sign's post in front of the next door */}
      <rect fill="url(#en-brick-stock)" x={1162} y={61} width={8} height={G - 61} />
    </g>
  );
}

// Everything that gives off light, drawn over the darkening overlay
function Lights() {
  return (
    <g>
      {/* Upstairs windows along the street */}
      <g className="en-street-lit">
        {LIT_WINDOWS.map((w) => (
          <rect key={`${w.x}-${w.y}`} className="en-window-glow" x={w.x} y={w.y} width={16} height={18} />
        ))}
        {LAMPS.map((x) => (
          <g key={x}>
            <polygon className="en-pool" points={`${x + 6},62 ${x + 14},62 ${x + 34},${G} ${x - 14},${G}`} />
            <rect className="en-lamp-lit" x={x + 5} y={59} width={10} height={3} />
          </g>
        ))}
      </g>
      {/* The bar: warm window, bulbs, and the lamps lighting the sign */}
      <g className="en-bar-lit">
        <rect className="en-bar-glow" x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
        {GOOSENECKS.map((x) => (
          <polygon key={x} className="en-sign-glow" points={`${x + 1},59 ${x + 11},59 ${x + 18},80 ${x - 6},80`} />
        ))}
        <text className="en-sign en-sign-lit" x={1000} y={79} textAnchor="middle" textLength={272} lengthAdjust="spacing">
          ENDEAVOUR
        </text>
      </g>
      {/* The bulbs hang in the window whatever the time; they're brighter at night */}
      {BULBS.map((x) => (
        <g key={x}>
          <rect className="en-cord" x={x - 0.5} y={WINDOW.y} width={1} height={x % 2 ? 9 : 13} />
          <rect className="en-bulb" x={x - 2.5} y={WINDOW.y + (x % 2 ? 9 : 13)} width={5} height={5} />
        </g>
      ))}
    </g>
  );
}

// The chalkboard outside, and the Deptford Broadway sign on its post
function StreetFurniture() {
  return (
    <g>
      <polygon className="en-aboard-frame" points="1128,112 1146,112 1149,130 1125,130" />
      <polygon className="en-aboard" points="1130,114 1144,114 1146.5,128 1127.5,128" />
      <g className="en-chalk">
        <rect x={1131} y={117} width={9} height={1.5} />
        <rect x={1130.5} y={120.5} width={12} height={1.5} />
        <rect x={1130} y={124} width={8} height={1.5} />
      </g>
      <rect className="en-post" x={1180} y={60} width={3} height={G - 60} />
      <rect className="en-street-sign-edge" x={1183} y={63} width={64} height={12} />
      <rect className="en-street-sign" x={1184} y={64} width={62} height={10} />
      <text className="en-street-sign-text" x={1215} y={71.6} textAnchor="middle">
        Deptford Broadway
      </text>
    </g>
  );
}

function Basement() {
  return (
    <g>
      <rect className="en-wall" x={828} y={G} width={344} height={86} />
      <rect className="en-room" x={834} y={G + 2} width={332} height={78} />
      <rect className="en-wall" x={828} y={G} width={314} height={10} />
      <rect className="en-screen-edge" x={870} y={145} width={132} height={48} />
      <rect className="en-screen" x={872} y={147} width={128} height={44} />
      <polygon className="en-stair" points={stairPoints} />
      <polygon className="en-rail-poly" points={`${STAIR_TOP - 4},${G + 2} ${STAIR_TOP - 2},${G + 2} ${STAIR_TOP - 62},${G + 76} ${STAIR_TOP - 64},${G + 76}`} />
      {/* Projector on its stand */}
      <rect className="en-stand" x={1076} y={162} width={2} height={48} />
      <rect className="en-stand" x={1068} y={208} width={18} height={2} />
      <rect className="en-projector" x={1066} y={150} width={22} height={12} />
      <rect className="en-lens" x={1062} y={153} width={5} height={6} />
    </g>
  );
}

// A seat from behind, as a sprite: square head, wider shoulders
function Head({ x, y, r, rim }: { x: number; y: number; r: number; rim?: boolean }) {
  const s = Math.round(r * 2);
  return (
    <g>
      <rect className="en-body" x={x - r * 1.8} y={y + r * 0.9} width={r * 3.6} height={r * 2.6} />
      <rect className="en-body" x={x - s / 2} y={y - s / 2} width={s} height={s} />
      {rim && <rect className="en-rim" x={x - s / 2} y={y - s / 2 - 1} width={s} height={1.4} />}
    </g>
  );
}

function StandingFigure({ x, y }: { x: number; y: number }) {
  return (
    <g className="en-figure">
      <rect x={x - 3} y={y - 20} width={6} height={6} />
      <rect x={x - 4} y={y - 13} width={8} height={9} />
      <rect x={x - 4} y={y - 4} width={3} height={4} />
      <rect x={x + 1} y={y - 4} width={3} height={4} />
    </g>
  );
}

function StackedChairs({ x }: { x: number }) {
  return (
    <g className="en-stack">
      <rect x={x} y={196} width={2} height={14} />
      <rect x={x + 11} y={172} width={2} height={38} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={x} y={195 - i * 3} width={13} height={1.5} />
      ))}
    </g>
  );
}

// Everything that belongs to one state. Keyed by state, so it fades in on change.
function Layer({ scene }: { scene: SceneT }) {
  const { state } = scene;
  return (
    <g className="en-layer">
      {/* People at the ledge in the window */}
      <g clipPath="url(#en-window)">
        {BAR_PEOPLE[state].map((i) => {
          const x = BAR_X[i];
          return (
            <g key={i} className="en-figure">
              <rect x={x - 4} y={99} width={8} height={8} />
              <rect x={x - 8} y={108} width={16} height={20} />
            </g>
          );
        })}
      </g>

      {/* Morning deliveries on the pavement */}
      {state === "morning" && (
        <g>
          {[1092, 1107].map((x) => (
            <g key={x}>
              <rect className="en-keg" x={x} y={114} width={13} height={16} />
              <rect className="en-keg-band" x={x} y={118} width={13} height={1.5} />
              <rect className="en-keg-band" x={x} y={125} width={13} height={1.5} />
            </g>
          ))}
          <rect className="en-crate" x={1060} y={119} width={24} height={11} />
          <rect className="en-crate" x={1062} y={108} width={24} height={11} />
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
              <rect key={i} className="en-chair" x={s.x - 3.5} y={s.y - 2.5} width={7} height={7} />
            ),
          )}
        {state === "queue" && (
          <g>
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
          <polygon className={state === "egg" ? "en-beam en-beam-egg" : "en-beam"} points="1000,147 1062,156 1000,191" />
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

// A two-colour checkerboard in 4-unit squares, the way GIFs faked a gradient
function Dither({ id, a, b }: { id: string; a: string; b: string }) {
  return (
    <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
      <rect className={a} width={8} height={8} />
      <rect className={b} x={4} width={4} height={4} />
      <rect className={b} y={4} width={4} height={4} />
    </pattern>
  );
}

function Brick({ id, face }: { id: string; face: string }) {
  return (
    <pattern id={id} width={12} height={8} patternUnits="userSpaceOnUse">
      <rect className={face} width={12} height={8} />
      <rect className="en-mortar" width={12} height={1} />
      <rect className="en-mortar" y={4} width={12} height={1} />
      <rect className="en-mortar" width={1} height={4} />
      <rect className="en-mortar" x={6} y={4} width={1} height={4} />
    </pattern>
  );
}

// The sky in four flat bands, with a strip of dither where each meets the next
const BANDS = [0, 34, 66, 98];

export default function Scene({ scene }: { scene: SceneT | null }) {
  return (
    <svg
      viewBox="0 0 2000 240"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <defs>
        <Dither id="en-d1" a="en-sky1" b="en-sky2" />
        <Dither id="en-d2" a="en-sky2" b="en-sky3" />
        <Dither id="en-d3" a="en-sky3" b="en-sky4" />
        <Dither id="en-soil" a="en-earth1" b="en-earth2" />
        <Brick id="en-brick-stock" face="en-stock" />
        <Brick id="en-brick-red" face="en-redbrick" />
        <clipPath id="en-room">
          <rect x={834} y={G + 2} width={332} height={78} />
        </clipPath>
        <clipPath id="en-window">
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
        </clipPath>
      </defs>

      {/* Sky */}
      {BANDS.map((y, i) => (
        <rect key={y} className={`en-sky${i + 1}`} x={0} y={y} width={2000} height={(BANDS[i + 1] ?? G) - y} />
      ))}
      {BANDS.slice(1).map((y, i) => (
        <rect key={y} fill={`url(#en-d${i + 1})`} x={0} y={y - 4} width={2000} height={8} />
      ))}
      {/* The street, in daylight colours */}
      <path className="en-far" d={FAR_SKYLINE} />
      {TERRACE.map((t) => (
        <Terrace key={t.x} {...t} />
      ))}
      <Endeavour />
      {LAMPS.map((x) => (
        <Lamp key={x} x={x} />
      ))}
      <StreetFurniture />
      <rect className="en-pave" x={0} y={G} width={2000} height={5} />
      <rect className="en-kerb" x={0} y={G} width={2000} height={1} />

      {/* Dusk and night: one overlay darkens the street, then the lights go on */}
      <rect className="en-dark" x={0} y={0} width={2000} height={G + 5} />
      <g className="en-night-sky">
        {/* A pixel full moon */}
        <rect className="en-moon" x={869} y={5} width={6} height={12} />
        <rect className="en-moon" x={866} y={8} width={12} height={6} />
        <rect className="en-moon" x={867} y={6} width={10} height={10} />
        {[
          [700, 18],
          [818, 8],
          [900, 20],
          [1040, 11],
          [1184, 25],
          [1262, 13],
          [1400, 9],
          [1520, 20],
          [560, 10],
        ].map(([x, y]) => (
          <rect key={x} className="en-star" x={x} y={y} width={2} height={2} />
        ))}
      </g>

      <Lights />

      {/* Underground */}
      <rect fill="url(#en-soil)" x={0} y={G + 5} width={2000} height={110} />
      {CELLARS.map((c) => (
        <rect key={c.x} className="en-cellar" x={c.x} y={G + 5} width={c.w} height={c.h} />
      ))}
      <Basement />
      {scene && <Layer key={scene.state} scene={scene} />}

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
