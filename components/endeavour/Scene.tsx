// Endeavour and its neighbours on Deptford Broadway, with the basement
// cinema cut away underneath. A pencil line drawing in greys: the only
// colour is the film's.
//
// One wide drawing (2000 x 284, with 44 units of sky above the rooftops). The strip crops it with "slice": a wide
// screen sees the whole street, a phone sees just Endeavour, top to bottom.
// Colours come from CSS variables that change with data-state on the
// wrapper (app/endeavour.css); things that come and go per state are in
// <Layer>, which fades in when the state changes.
//
// The basement screen is a link to Basement TV, the only way there: Matt
// wants it found, not signposted. The drawing is hidden from screen readers
// and the keyboard.

import Link from "next/link";
import { thumb } from "@/lib/videos";
import { SeasonalStreet } from "./Seasonal";
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

// Street lamps: where the post stands, and how high its head is
const LAMPS = [
  { x: 250, top: 50 },
  { x: 1156, top: 28 }, // in front of Endeavour, with the Deptford Broadway sign on it
];

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
  { x: 90, w: 120, h: 46 },
  { x: 600, w: 150, h: 50 },
  { x: 1230, w: 120, h: 44 },
  { x: 1640, w: 130, h: 48 },
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

function Lamp({ x, top }: { x: number; top: number }) {
  return (
    <g>
      <path className="en-post" d={`M${x} ${G} V${top + 6} Q${x} ${top} ${x + 8} ${top}`} />
      <rect className="en-o en-lamp" x={x + 5} y={top} width={9} height={4.5} rx={1} />
    </g>
  );
}

// A window with a round top, and a sill unless it's at street level
function Arched({ x, y, w, h, lit, sill = true }: { x: number; y: number; w: number; h: number; lit?: boolean; sill?: boolean }) {
  const r = w / 2;
  return (
    <g>
      <path className={`en-o ${lit ? "en-lit" : "en-win"}`} d={`M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z`} />
      <line className="en-bar-line" x1={x + r} x2={x + r} y1={y} y2={y + h} />
      {sill && <rect className="en-o en-end" x={x - 2} y={y + h} width={w + 4} height={2.5} />}
    </g>
  );
}

// A roller shutter, down at night and first thing (or always, if the shop has shut for good)
function Shutter({ x, y, w, h, always }: { x: number; y: number; w: number; h: number; always?: boolean }) {
  const lines = Array.from({ length: Math.floor((h - 4) / 4.2) }, (_, i) => y + 4 + i * 4.2);
  return (
    <g className={always ? "en-shutter en-shutter-down" : "en-shutter"}>
      <rect className="en-o" x={x} y={y} width={w} height={h} />
      {lines.map((ly) => (
        <line key={ly} x1={x} x2={x + w} y1={ly} y2={ly} />
      ))}
    </g>
  );
}

// The rest of the block, after Street View, left to right. Kept simple: the
// shapes, heights and windows are the real ones; the signs are left blank.
function Neighbours() {
  return (
    <g>
      {/* Behind the pub: the taller brick block */}
      <path className="en-far" d="M40 130 V16 L135 2 L230 16 V130 Z" />

      {/* The corner pub: red brick, slate mansard roof, arched windows, painted front */}
      <path className="en-aerial" d="M64 12 V1 M56 3 H72 M58 6.5 H70" />
      <path className="en-o en-roof" d="M-6 26 L6 12 H356 L368 26 Z" />
      <rect className="en-o en-brick" x={0} y={26} width={370} height={G - 26} />
      <rect fill="url(#en-pencil)" x={0} y={26} width={370} height={54} />
      <rect className="en-o en-nbr1" x={-4} y={24} width={378} height={4} />
      <rect className="en-o en-nbr1" x={-4} y={52} width={378} height={3} />
      {[62, 172, 282].map((x, i) => (
        <g key={x}>
          <Arched x={x} y={31} w={26} h={17} lit={i === 1} />
          <Arched x={x} y={58} w={26} h={17} />
        </g>
      ))}
      <rect className="en-o en-pubfront" x={0} y={80} width={370} height={G - 80} />
      {[30, 118, 206, 294].map((x, i) => (
        <Arched key={x} x={x} y={90} w={36} h={G - 90} lit={i === 1 || i === 2} sill={false} />
      ))}
      {/* Its hanging sign */}
      <path className="en-post en-post-thin" d="M334 63 H354 M338 63 V66 M350 63 V66" />
      <rect className="en-o en-case" x={336} y={66} width={16} height={14} />
      <circle className="en-o en-nbr1" cx={344} cy={73} r={3.4} />

      {/* Narrow cream house: one window a floor; the tandoori's shutter is down for good */}
      <rect className="en-o en-nbr2" x={382} y={6} width={12} height={14} />
      <rect className="en-o en-nbr1" x={370} y={20} width={170} height={G - 20} />
      <rect fill="url(#en-pencil)" x={370} y={20} width={170} height={60} />
      <rect className="en-o en-nbr1" x={368} y={17} width={174} height={4} />
      <Sash x={445} y={28} w={20} h={18} />
      <Sash x={445} y={54} w={20} h={18} lit />
      <rect className="en-o en-fascia" x={374} y={82} width={162} height={10} />
      <Shutter x={378} y={94} w={110} h={G - 94} always />
      <path className="en-tag" d="M404 100 Q390 104 394 116 Q398 125 410 120 M418 104 q6 -3 8 3 q2 6 -5 8 q8 1 7 8 M436 108 l6 -4 l-2 14 m6 -8 q8 -3 10 4 M392 125 H470" />
      <rect className="en-o en-frame" x={496} y={97} width={20} height={G - 97} />

      {/* Tall cream building, four storeys, two windows a floor; shop with an awning */}
      <rect className="en-o en-nbr2" x={540} y={6} width={290} height={G - 6} />
      <rect fill="url(#en-pencil)" x={540} y={6} width={290} height={74} />
      <rect className="en-o en-nbr2" x={534} y={2} width={302} height={5} />
      {[12, 34, 56].map((y, row) => (
        <g key={y}>
          <Sash x={612} y={y} w={24} h={18} lit={row === 0} />
          <Sash x={718} y={y} w={24} h={18} />
        </g>
      ))}
      <rect className="en-o en-fascia" x={544} y={82} width={282} height={10} />
      <path className="en-o en-awning" d="M546 92 H824 L830 101 H540 Z" />
      <path className="en-awning-stripes" d={Array.from({ length: 23 }, (_, i) => `M${556 + i * 12} 92.5 L${554 + i * 12.3} 100.5`).join(" ")} />
      <rect className="en-o en-win" x={552} y={101} width={200} height={G - 101} />
      <rect className="en-o en-door" x={764} y={101} width={22} height={G - 101} />
      <Shutter x={546} y={101} w={278} h={G - 101} />
      {/* On the pavement: a street cabinet, tagged, and the bin bags */}
      <rect className="en-o en-cabinet" x={690} y={111} width={22} height={19} rx={1} />
      <path className="en-tag" d="M694 118 q4 -4 7 0 q3 4 7 -1 M695 124 H708" />
      <path className="en-o en-bag" d="M716 130 Q713 121 720 119 L719 116 L723 118 Q730 120 728 130 Z" />
      <path className="en-o en-bag" d="M727 130 Q726 124 731 122 L731 119.5 L734 122 Q739 124 737 130 Z" />

      {/* Autocolour: low brick shop with a hipped roof, one window upstairs */}
      <path className="en-o en-roof" d="M1162 53 L1186 36 H1439 L1463 53 Z" />
      <rect className="en-o en-brick" x={1170} y={52} width={285} height={G - 52} />
      <rect fill="url(#en-pencil)" x={1170} y={52} width={285} height={28} />
      <Sash x={1236} y={57} w={26} h={17} />
      <rect className="en-o en-fascia" x={1174} y={82} width={277} height={10} />
      <rect className="en-o en-frame" x={1176} y={93} width={273} height={G - 93} />
      <rect className="en-o en-win" x={1180} y={96} width={110} height={30} />
      <rect className="en-o en-win" x={1296} y={96} width={110} height={30} />
      <rect className="en-o en-door" x={1413} y={96} width={30} height={G - 96} />
      <Shutter x={1176} y={93} w={273} h={G - 93} />

      {/* Harton Street goes off between here and the next building: 20mph */}
      <path className="en-post en-post-thin" d={`M1497 ${G} V98`} />
      <circle className="en-roundel" cx={1497} cy={92} r={6.5} />
      <text className="en-roundel-text" x={1497} y={94} textAnchor="middle">
        20
      </text>

      {/* The big Victorian corner building: yellow brick, two floors of arched windows */}
      {[1596, 1896].map((x) => (
        <g key={x}>
          <rect className="en-o en-nbr1" x={x} y={-2} width={20} height={10} />
          <rect className="en-o en-nbr2" x={x + 3} y={-6} width={5} height={5} />
          <rect className="en-o en-nbr2" x={x + 12} y={-6} width={5} height={5} />
        </g>
      ))}
      <rect className="en-o en-nbr2" x={1540} y={8} width={470} height={G - 8} />
      <rect fill="url(#en-pencil)" x={1540} y={8} width={470} height={72} />
      <rect className="en-o en-nbr1" x={1534} y={4} width={480} height={5} />
      <rect className="en-o en-nbr1" x={1534} y={40} width={480} height={3} />
      {[1566, 1628, 1690, 1752, 1814, 1876, 1938].map((x, i) => (
        <g key={x}>
          <Arched x={x} y={14} w={22} h={19} lit={i === 1 || i === 4} />
          <Arched x={x} y={47} w={22} h={21} lit={i === 5} />
        </g>
      ))}
      <rect className="en-o en-fascia" x={1544} y={80} width={466} height={11} />
      {[1552, 1662, 1772, 1882].map((x) => (
        <rect key={x} className="en-o en-win" x={x} y={95} width={92} height={31} />
      ))}
      <Shutter x={1546} y={93} w={462} h={G - 93} />
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
      <rect className="en-o en-street-sign" x={1124} y={37} width={64} height={12} rx={1} />
      <text className="en-street-sign-text" x={1156} y={45.6} textAnchor="middle">
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
      {/* The look switch's house lights: the screen's light on the room */}
      <rect className="en-screen-glow" x={868} y={143} width={136} height={52} clipPath="url(#en-room)" />
      {/* Out of tab order: the footer's own link does this for the keyboard.
          Not prefetched, since the footer is on every page. */}
      <Link href="/tv" className="en-tv" tabIndex={-1} prefetch={false}>
        {/* DRAFT */}
        <title>Basement TV</title>
        <rect className="en-o en-screen" x={872} y={147} width={128} height={44} />
      </Link>
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

// A pigeon sitting on a ledge whose top is at y
function Pigeon({ x, y }: { x: number; y: number }) {
  return (
    <g className="en-bird">
      <ellipse cx={x} cy={y - 2.2} rx={3.4} ry={2.2} />
      <circle cx={x - 3} cy={y - 4} r={1.4} />
      <path d={`M${x + 3} ${y - 2.6} L${x + 6.5} ${y - 1.4} L${x + 3} ${y - 0.8} Z`} />
    </g>
  );
}

// An urban fox on the pavement, facing left, nose at x - 12
function Fox({ x }: { x: number }) {
  return (
    <g>
      <path className="en-o en-fox" d={`M${x + 6} ${G - 7} Q${x + 15} ${G - 11} ${x + 17} ${G - 5} Q${x + 12} ${G - 3} ${x + 6} ${G - 5} Z`} />
      <path className="en-fox-tip" d={`M${x + 14} ${G - 8.5} Q${x + 17} ${G - 8} ${x + 17} ${G - 5} Q${x + 15} ${G - 4.5} ${x + 14} ${G - 5} Z`} />
      <path className="en-rail" d={`M${x - 4} ${G - 5} V${G} M${x - 1} ${G - 5} V${G} M${x + 3} ${G - 5} V${G} M${x + 6} ${G - 5} V${G}`} />
      <ellipse className="en-o en-fox" cx={x} cy={G - 7} rx={7.5} ry={3.6} />
      <path className="en-o en-fox" d={`M${x - 5} ${G - 9} L${x - 12} ${G - 8} L${x - 8.5} ${G - 12} L${x - 8} ${G - 15} L${x - 6.3} ${G - 12.5} L${x - 5} ${G - 15} L${x - 4.2} ${G - 11} Z`} />
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
        LAMPS.map(({ x, top }) => (
          <path key={x} className="en-pool" d={`M${x + 6} ${top + 4.5} H${x + 13} L${x + 32} ${G} H${x - 13} Z`} />
        ))}

      {/* Pigeons on the ledges by day */}
      {(state === "morning" || state === "day") &&
        [
          [150, 24],
          [161, 24],
          [1318, 36],
          [1712, 40],
          [1726, 40],
        ].map(([x, y]) => <Pigeon key={x} x={x} y={y} />)}

      {/* A fox under the lamp by the pub, after dark */}
      {(state === "night" || state === "egg") && <Fox x={266} />}

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
    <svg viewBox="0 -44 2000 284" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <defs>
        {/* Wobbles every line a little, like a pencil drawing */}
        <filter id="en-wobble" x="-1%" y="-4%" width="102%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="en-glow" x="-40%" y="-90%" width="180%" height="280%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <pattern id="en-hatch" width={16} height={14} patternUnits="userSpaceOnUse">
          <path d="M2 11 l5 -3 M10 5 l4 -2" className="en-hatch" />
        </pattern>
        <pattern id="en-pencil" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0 4.5 H6" className="en-pencil" />
        </pattern>
        {/* The soil darkens with depth until it meets the footer */}
        <linearGradient id="en-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="en-deep-0" />
          <stop offset="0.45" className="en-deep-1" />
          <stop offset="1" className="en-deep-2" />
        </linearGradient>
        <clipPath id="en-room">
          <rect x={834} y={G + 2} width={332} height={78} />
        </clipPath>
        <clipPath id="en-screen-clip">
          <rect x={872} y={147} width={128} height={44} />
        </clipPath>
        <clipPath id="en-windows">
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
        </clipPath>
      </defs>

      <g filter="url(#en-wobble)">
        <rect className="en-sky" x={0} y={-44} width={2000} height={G + 44} />
        <g className="en-night-sky">
          <circle cx={1108} cy={-24} r={7} className="en-moon" />
          {[
            [240, -30],
            [420, -14],
            [610, -36],
            [700, -8],
            [818, -26],
            [900, -38],
            [1040, -12],
            [1184, -34],
            [1262, -4],
            [1400, -28],
            [1480, -10],
            [1620, -32],
            [1760, -18],
            [1900, -36],
            [560, -24],
            [990, -20],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={0.9} className="en-star" />
          ))}
        </g>
        <path className="en-far" d={FAR_SKYLINE} />
        <Neighbours />
        <Endeavour />
        {LAMPS.map((l) => (
          <Lamp key={l.x} {...l} />
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
        <rect fill="url(#en-deep)" x={0} y={G + 5} width={2000} height={240 - G - 5} />
        <Basement />
        {scene && <Layer key={scene.state} scene={scene} />}
        {scene && <SeasonalStreet scene={scene} />}
      </g>

      {/* 3am to 4am: the projector runs for an empty room, showing something off the wall.
          The 4:3 "hq" thumbnail, drawn a little larger than the screen and cropped to it,
          fills the screen with no black bars whether the video is 4:3 or widescreen.
          Clicks go through it to Basement TV (.en-layer). */}
      {scene?.eggVideo && (
        <image
          key={scene.eggVideo}
          className="en-layer en-egg"
          href={thumb(scene.eggVideo, "hq")}
          x={864}
          y={143}
          width={144}
          height={52}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#en-screen-clip)"
        />
      )}
    </svg>
  );
}
