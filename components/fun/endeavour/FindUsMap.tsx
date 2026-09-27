// Endeavour, drawn: the little map in the front page's Find us box. Ink on
// white plus one spot colour, the next film's. A stand-in doodle for the
// illustrator's version. Positions follow OpenStreetMap, squashed a bit so
// the labels fit: Endeavour is on the south side of Deptford Broadway,
// between the bottom of Deptford High Street and Deptford Bridge DLR, with
// Deptford Church Street and the river Ravensbourne in between.
//
// The drawing is decorative; the directions underneath say the same in words.

import type { CSSProperties } from "react";
import { isPast, type Film } from "@/lib/films";
import { DIRECTIONS, MAP_CAPTION } from "@/lib/fun/endeavour";

const ROADS = [
  { d: "M-6 64 Q138 59 282 63", w: 12 }, // Deptford Broadway
  { d: "M39 -6 Q41 30 44 60", w: 9 }, // Deptford High Street
  { d: "M131 -6 Q127 30 127 60", w: 8 }, // Deptford Church Street
];

function Arrowhead({ x, y, dir }: { x: number; y: number; dir: "left" | "right" | "down" }) {
  const pts =
    dir === "left"
      ? `${x},${y} ${x + 5},${y - 3} ${x + 5},${y + 3}`
      : dir === "right"
        ? `${x},${y} ${x - 5},${y - 3} ${x - 5},${y + 3}`
        : `${x},${y} ${x - 3},${y - 5} ${x + 3},${y - 5}`;
  return <polygon className="en-spot" points={pts} />;
}

export function EndeavourMap({ films }: { films: Film[] }): React.ReactNode {
  // Same "next" as the Next screening box above it
  const next = films.find((f) => !isPast(f.date)) ?? films.at(-1);

  return (
    <div className="en-find" style={next && ({ "--film": next.colour } as CSSProperties)}>
      <figure className="en-map">
        <svg viewBox="0 0 276 196" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <defs>
            <filter id="en-map-wobble" x="-2%" y="-2%" width="104%" height="104%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={9} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.4} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          <g filter="url(#en-map-wobble)">
            {/* River Ravensbourne, under the road at Deptford Bridge */}
            <path className="en-ink-thin" d="M171 -4 Q168 40 173 64 Q176 90 172 122 M181 -4 Q178 40 183 64 Q186 90 182 122" />
            <path
              className="en-ink-thin"
              d="M173 12 q2 -2 4 0 M174 30 q2 -2 4 0 M175 48 q2 -2 4 0 M177 82 q2 -2 4 0 M177 100 q2 -2 4 0"
            />

            {/* Deptford Bridge: the road and its pavements cross the river */}
            <rect className="en-paper" x={164} y={55} width={26} height={22} />
            <path className="en-ink-thin" d="M165 76 H189" />

            {/* Roads: ink edges first, then white centres so the junctions join up */}
            {ROADS.map((r) => (
              <path key={r.d} className="en-road-edge" d={r.d} strokeWidth={r.w + 2} />
            ))}
            {ROADS.map((r) => (
              <path key={r.d} className="en-road" d={r.d} strokeWidth={r.w} />
            ))}

            {/* DLR on its viaduct, over the road */}
            <path className="en-ink-thin" d="M188 -4 Q184 40 190 62 Q194 84 198 100 L205 124" />
            <path className="en-ties" d="M188 -4 Q184 40 190 62 Q194 84 198 100 L205 124" />
            <rect className="en-paper en-ink" x={187} y={92} width={20} height={13} rx={2} />

            {/* The ways in, in the spot colour */}
            <path className="en-route" d="M190 98 Q180 71 168 71 L113 73" />
            <path className="en-route" d="M50 8 L50 56 Q50 72 64 72 L87 73" />

            {/* Endeavour */}
            <rect className="en-spot en-ink" x={92} y={69} width={16} height={10} />

            {/* North */}
            <path className="en-ink" d="M263 24 V8 M259 12 L263 7 L267 12" />

            {/* Leader down to the cutaway */}
            <path className="en-ink-thin en-dotted" d="M100 96 V124" />

            {/* Cutaway: in through the bar, down the stairs, into the cinema */}
            <rect className="en-paper en-ink" x={14} y={124} width={248} height={70} rx={4} />
            <path className="en-ink" d="M20 152 H256" />
            <path className="en-hatch-line" d="M24 158 l6 -4 M36 162 l6 -4 M28 170 l6 -4 M232 158 l6 -4 M244 164 l6 -4 M236 174 l6 -4" />
            {/* bar: roof, walls (door gap on the left), counter */}
            <path className="en-ink" d="M62 130 H222 M64 130 V137 M220 130 V152" />
            <rect className="en-ink-fill" x={110} y={145} width={34} height={7} />
            {/* basement */}
            <rect className="en-ink" x={64} y={154} width={156} height={36} />
            <path className="en-ink" d="M64 152 H192" />
            {/* stairs at the back */}
            <path className="en-ink" d="M220 152 V157 H214 V164 H208 V171 H202 V178 H196 V185 H190 V190" />
            {/* screen, beam, seats */}
            <polygon className="en-spot en-beam-map" points="72,158 196,164 72,182" />
            <rect className="en-spot" x={66} y={158} width={6} height={24} />
            <rect className="en-ink-fill" x={193} y={161} width={9} height={6} rx={1} />
            {[102, 124, 146, 168].map((x) => (
              <g key={x}>
                <circle className="en-ink-fill" cx={x} cy={176} r={3.2} />
                <path className="en-ink-thin" d={`M${x + 1} 180 V189 M${x + 1} 184 H${x - 6} V189`} />
              </g>
            ))}
            {/* the arrow */}
            <path className="en-arrow" d="M24 141 H204 Q211 141 211 147 L199 180 Q197 186 191 186 H181" />
            <Arrowhead x={176} y={186} dir="left" />
          </g>

          <Arrowhead x={112} y={73} dir="left" />
          <Arrowhead x={89} y={73} dir="right" />

          {/* Labels stay crisp: outside the wobble */}
          <text className="en-label" x={54} y={10}>
            ↑ Deptford
          </text>
          <text className="en-label" x={63} y={19}>
            station
          </text>
          <text className="en-label en-small" transform="translate(31 52) rotate(-90)">
            High St
          </text>
          <text className="en-label en-small" transform="translate(120 52) rotate(-90)">
            Church St
          </text>
          <text className="en-label en-small en-italic" transform="translate(167 56) rotate(-90)">
            Ravensbourne
          </text>
          <text className="en-label en-small" x={54} y={64.6}>
            Deptford Broadway
          </text>
          <text className="en-label en-tiny" x={197} y={101.4} textAnchor="middle">
            DLR
          </text>
          <text className="en-label" x={211} y={97}>
            Deptford
          </text>
          <text className="en-label" x={211} y={106}>
            Bridge
          </text>
          <text className="en-label en-bold" x={100} y={91} textAnchor="middle">
            Endeavour
          </text>
          <text className="en-label" x={263} y={32} textAnchor="middle">
            N
          </text>
          <text className="en-label en-small en-italic" x={160} y={138} textAnchor="middle">
            bar
          </text>
          <text className="en-label en-small en-italic" x={124} y={167} textAnchor="middle">
            cinema
          </text>
        </svg>
        <figcaption>{MAP_CAPTION}</figcaption>
      </figure>
      {DIRECTIONS.map((line) => (
        <p key={line} className="en-directions">
          {line}
        </p>
      ))}
    </div>
  );
}
