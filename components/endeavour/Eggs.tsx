"use client";

// Things on the street that move when they're clicked or tapped. Nothing
// points them out (they're found by poking about), nothing runs until a click,
// and everything goes back to how it was drawn.
//
//   the fox, after dark: bolts off left, and creeps back to its spot a minute later
//   the bin bags: shift a little; after dark the fox may trot over and nose them
//   the pigeons, by day: flutter off their ledge, and settle back a few seconds later
//   the pub's sign: swings on its bracket
//   a shutter, while it's down: rattles, lifts a little, drops
//   the bar's window: the bulbs flicker, and someone turns round
//   the chalkboard: rocks in a gust
//   a street lamp, while it's lit: stutters
//
// The pencil wobble is a filter over the whole drawing, and anything that moves
// inside it makes the browser redo the whole filter every frame. So what moves
// is hidden in the drawing (busy) and a copy, wobbled on its own, moves on a
// layer over it (<Moving>); it's a pixel or so crisper, which nobody sees while
// it's moving. The flickers happen in the drawing itself (app/endeavour.css):
// a handful of changes, not one a frame. With reduced motion, things fade or
// barely move instead.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ABOARD_EDGE,
  ABOARD_FOOT,
  ABoard,
  BAGS,
  BAR_PEOPLE,
  BAR_X,
  Cabinet,
  FOX_X,
  Fox,
  G,
  LAMPS,
  LAMPS_ON,
  PIGEONS,
  Person,
  Pigeon,
  SHUTTERS,
  SHUTTERS_DOWN,
  SIGN_PIVOT,
  Shutter,
  SignFace,
  TANDOORI_TAG,
  WINDOW,
  foxHead,
  personShape,
  poolPath,
} from "./Scene";
import type { Scene, State } from "./state";

type Play = { n: number; phase: string; who?: number };
type Plays = Record<string, Play>;
const NO_PLAYS: Plays = {};

// The one at the right-hand end of the ledge stands behind the chalkboard
const BY_THE_BOARD = 5;
const DARK: State[] = ["night", "egg"];
const stillPlease = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const between = (a: number, b: number) => a + Math.random() * (b - a);

export type Eggs = {
  plays: Plays;
  busy: ReadonlySet<string>;
  poke: (id: string) => void;
  done: (id: string, n: number, phase: string) => void;
  nudge: () => void;
};

/** What's moving on the drawing, for a time of day; a new time of day starts still. */
export function useEggs(state: State | undefined): Eggs {
  const [store, setStore] = useState<{ state?: State; plays: Plays }>({ plays: NO_PLAYS });
  // Every change of time starts still, a return to one already shown included:
  // what was moving then has lost its timers, and would be stuck half done
  if (store.state !== state) setStore({ state, plays: NO_PLAYS });
  const plays = store.state === state ? store.plays : NO_PLAYS;
  const timers = useRef<number[]>([]);
  const count = useRef(0);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [state],
  );

  const busy = useMemo(() => {
    const b = new Set(Object.keys(plays));
    if (plays.bar?.who !== undefined) b.add(`person${plays.bar.who}`);
    return b;
  }, [plays]);

  // Only for the time of day this was made for; anything left from another is dropped
  const update = (f: (p: Plays) => Plays) => setStore((s) => (s.state === state ? { state, plays: f(s.plays) } : s));
  const set = (id: string, play: Play) => update((p) => ({ ...p, [id]: play }));
  // Moves a play on, unless it's been replaced or stopped since
  const advance = (id: string, n: number, play: Play | null) =>
    update((p) => {
      if (p[id]?.n !== n) return p;
      const next = { ...p };
      if (play) next[id] = play;
      else delete next[id];
      return next;
    });
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms));

  const poke = (id: string) => {
    if (!state || plays[id]) return;
    const n = ++count.current;
    if (id.startsWith("lamp")) {
      set(id, { n, phase: "on" });
      later(1000, () => advance(id, n, null));
    } else if (id === "bar") {
      const people = BAR_PEOPLE[state].filter((i) => i !== BY_THE_BOARD);
      set(id, { n, phase: "on", who: people.length ? people[Math.floor(Math.random() * people.length)] : undefined });
    } else if (id === "fox") {
      set(id, { n, phase: "bolt" });
    } else if (id.startsWith("pigeons")) {
      set(id, { n, phase: "off" });
    } else {
      set(id, { n, phase: "on" });
      // The fox, if it's under its lamp, may go and see what that was
      if (id === "bags" && DARK.includes(state) && !plays.fox && !stillPlease() && Math.random() < 0.65) {
        set("fox", { n: ++count.current, phase: "bins" });
      }
    }
  };

  const done = (id: string, n: number, phase: string) => {
    if (phase === "bolt") {
      advance(id, n, { n, phase: "away" });
      later(between(45_000, 60_000), () => advance(id, n, { n, phase: "creep" }));
    } else if (phase === "off") {
      advance(id, n, { n, phase: "away" });
      later(between(4_000, 6_500), () => advance(id, n, { n, phase: "back" }));
    } else {
      advance(id, n, null);
    }
  };

  // The fox's nose in the bags
  const nudge = () => set("bags", { n: ++count.current, phase: "nosed" });

  return { plays, busy, poke, done, nudge };
}

// ---------- Where to click ----------

/** Invisible spots over the things that move, bigger than they are, for fingers. */
export function Spots({ scene, eggs }: { scene: Scene; eggs: Eggs }) {
  const { state } = scene;
  const { plays, poke } = eggs;
  const spot = (id: string, x: number, y: number, w: number, h: number) =>
    !plays[id] && <rect key={id} className="en-spot" x={x} y={y} width={w} height={h} onClick={() => poke(id)} />;
  const turners = BAR_PEOPLE[state].filter((i) => i !== BY_THE_BOARD);
  return (
    <g className="en-spots">
      {SHUTTERS_DOWN.includes(state) && SHUTTERS.map((s, i) => spot(`shutter${i}`, s.x, s.y, s.w, s.h + 3))}
      {spot("bags", 706, 104, 40, 30)}
      {(LAMPS_ON.includes(state) || turners.length > 0) && spot("bar", WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h)}
      {spot("aboard", 1112, 100, 46, 36)}
      {LAMPS_ON.includes(state) && LAMPS.map((l, i) => spot(`lamp${i}`, l.x - 12, l.top - 18, 46, 46))}
      {spot("sign", 324, 54, 40, 36)}
      {(state === "morning" || state === "day") &&
        PIGEONS.map((ledge, i) => {
          const xs = ledge.map(([x]) => x);
          const y = ledge[0][1];
          return spot(`pigeons${i}`, Math.min(...xs) - 12, y - 22, Math.max(...xs) - Math.min(...xs) + 26, 26);
        })}
      {DARK.includes(state) && spot("fox", FOX_X - 30, 100, 64, 34)}
    </g>
  );
}

// ---------- What moves ----------

// Calls draw(t) every frame for ms milliseconds, t going from 0 to 1. If the
// signal aborts (the time of day changed) it stops, and never finishes.
function tween(ms: number, draw: (t: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let start: number | undefined;
    const frame = (now: number) => {
      if (signal.aborted) return;
      start ??= now;
      const t = Math.min(1, (now - start) / ms);
      draw(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => clearTimeout(id));
  });
}
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const attr = (el: Element | null | undefined, name: string, value: string | number) => el?.setAttribute(name, String(value));
const f2 = (v: number) => v.toFixed(2);

// Runs a copy's moves once it's drawn, then says so
function useMoves(moves: (signal: AbortSignal, still: boolean) => Promise<void>, onDone: () => void) {
  useEffect(() => {
    const ac = new AbortController();
    moves(ac.signal, stillPlease()).then(() => {
      if (!ac.signal.aborted) onDone();
    });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, from when it's drawn
  }, []);
}

const WOBBLE = "url(#en-wobble-part)";

// ----- The fox -----

// Running, the fox brings its own legs (front pair, back pair) and head
function MovingFox({ mode, onDone, onNose }: { mode: string; onDone: () => void; onNose: () => void }) {
  const fox = useRef<SVGGElement>(null);
  const front = useRef<SVGPathElement>(null);
  const back = useRef<SVGPathElement>(null);
  const head = useRef<SVGPathElement>(null);
  const x = FOX_X;

  // dx: along the pavement from its spot. face: 1 facing left, as drawn, -1
  // facing right, in between while it turns. stride: the legs' swing in
  // degrees. dy: up (-) or down. nod: the head, nose down (-) or up.
  const pose = (dx: number, face: number, stride = 0, dy = 0, nod = 0) => {
    attr(fox.current, "transform", `translate(${f2(x + dx)} ${f2(dy)}) scale(${f2(face)} 1) translate(${-x} 0)`);
    attr(front.current, "transform", `translate(0 ${G - 5}) skewX(${f2(stride)}) translate(0 ${5 - G})`);
    attr(back.current, "transform", `translate(0 ${G - 5}) skewX(${f2(-stride)}) translate(0 ${5 - G})`);
    attr(head.current, "transform", `rotate(${f2(nod)} ${x - 4.5} ${G - 9.5})`);
  };

  useMoves(async (signal, still) => {
    const go = (ms: number, draw: (t: number, s: number) => void) => tween(ms, (t) => draw(t, (t * ms) / 1000), signal);
    // From one place to another at a walk or a trot: hz strides a second,
    // the legs swinging deg either way, the body rising lift with each step
    const walk = (from: number, to: number, ms: number, face: number, hz: number, deg: number, lift: number, shape = smooth) =>
      go(ms, (t, s) => {
        const ramp = Math.min(1, (t * ms) / 300, ((1 - t) * ms) / 300); // the legs start and settle
        const phase = 2 * Math.PI * hz * s;
        pose(from + (to - from) * shape(t), face, deg * ramp * Math.sin(phase), -lift * ramp * Math.abs(Math.sin(phase)));
      });
    // Turning round, it looks shorter, then it's facing the other way (never edge on, or it'd vanish)
    const facing = (from: number, t: number) => {
      const c = Math.cos(Math.PI * smooth(t));
      return from * (c < 0 ? -1 : 1) * Math.max(0.45, Math.abs(c));
    };
    const turn = (dx: number, from: number) => go(320, (t) => pose(dx, facing(from, t)));
    const op = (v: number) => attr(fox.current, "opacity", f2(v));

    if (mode === "bolt") {
      if (still) return go(500, (t) => op(1 - t));
      // Up to speed in a few strides, and gone off the left edge
      const a = 0.25;
      await go(1050, (t, s) => {
        const run = t < a ? (t * t) / (2 * a) : t - a / 2;
        const speed = Math.min(1, t / a);
        const phase = 2 * Math.PI * 4.5 * s;
        pose((-310 * run) / (1 - a / 2), 1, 30 * speed * Math.sin(phase), -0.9 * speed * Math.abs(Math.sin(phase / 2)));
      });
    } else if (mode === "creep") {
      if (still) return go(800, (t) => op(t));
      // Back from the left, facing its way, warily: halfway, a stop to sniff
      // the air, the rest of the way, then round to face the street again
      pose(-310, -1);
      op(1);
      await walk(-310, -150, 2600, -1, 1.6, 18, 0, (t) => t);
      await go(900, (t) => pose(-150, -1, 0, 0, 12 * Math.sin(Math.PI * t)));
      await walk(-150, 0, 2300, -1, 1.6, 18, 0, easeOut);
      await pause(300, signal);
      await go(320, (t) => pose(0, facing(-1, t)));
    } else if (mode === "bins") {
      // Round, a trot past the bags, round again to nose about in them from
      // the far side (clear of the cabinet), and back the way it came
      const bins = 486;
      await turn(0, 1);
      await walk(0, bins, 4300, -1, 2.6, 24, 0.35);
      await turn(bins, -1);
      const nose = (from: number, to: number, ms: number) => go(ms, (t) => pose(bins, 1, 0, 0, from + (to - from) * smooth(t)));
      await nose(0, -18, 350);
      onNose();
      await pause(500, signal);
      await nose(-18, -6, 300);
      await pause(250, signal);
      await nose(-6, -20, 300);
      await pause(650, signal);
      await nose(-20, 0, 350);
      await pause(300, signal);
      await walk(bins, 0, 4300, 1, 2.6, 24, 0.35);
    }
  }, onDone);

  return (
    <g ref={fox} filter={WOBBLE} opacity={mode === "creep" ? 0 : undefined}>
      <Fox
        x={x}
        legs={
          <>
            <path ref={front} className="en-rail" d={`M${x - 4} ${G - 5} V${G} M${x - 1} ${G - 5} V${G}`} />
            <path ref={back} className="en-rail" d={`M${x + 3} ${G - 5} V${G} M${x + 6} ${G - 5} V${G}`} />
          </>
        }
        head={<path ref={head} className="en-o en-fox" d={foxHead(x)} />}
      />
    </g>
  );
}

// ----- The bin bags -----

// Each rocks on its base, a little out of step with the other
function MovingBags({ soft, onDone }: { soft: boolean; onDone: () => void }) {
  const bags = useRef<(SVGGElement | null)[]>([]);
  useMoves(async (signal, still) => {
    const size = (still ? 0.25 : 1) * (soft ? 0.6 : 1);
    await tween(
      900,
      (t) => {
        const s = t * 0.9;
        BAGS.forEach((b, i) => {
          const deg = size * (i ? -5 : 3.5) * Math.exp(-4 * s) * Math.sin(2 * Math.PI * (3.2 + 0.8 * i) * s + i * 0.6) * (1 - t);
          attr(bags.current[i], "transform", `rotate(${f2(deg)} ${b.x} ${G})`);
        });
      },
      signal,
    );
  }, onDone);
  return BAGS.map((b, i) => (
    <g
      key={b.x}
      ref={(el) => {
        bags.current[i] = el;
      }}
      filter={WOBBLE}
    >
      <path className="en-o en-bag" d={b.d} />
    </g>
  ));
}

// ----- The pigeons -----

// A pigeon's near wing, from its shoulder: w is 1 at the top of a beat, -1 at the bottom
const wingPath = (x: number, y: number, w: number) =>
  `M${f2(x + 0.3)} ${f2(y - 3.6)} L${f2(x + 1.7)} ${f2(y - 3.6 - 2.6 * w)} L${f2(x + 4.6)} ${f2(y - 3.4 - 4.4 * w)}`;

function MovingPigeons({ ledge, mode, onDone }: { ledge: number; mode: string; onDone: () => void }) {
  const birds = useRef<(SVGGElement | null)[]>([]);
  const wings = useRef<(SVGPathElement | null)[]>([]);
  const spots = PIGEONS[ledge];
  useMoves(async (signal, still) => {
    const off = mode === "off";
    if (still) {
      return tween(off ? 500 : 800, (t) => birds.current.forEach((b) => attr(b, "opacity", f2(off ? 1 - t : t))), signal);
    }
    const each = 1600; // one bird's flight, ms
    const gap = off ? 120 : 280; // between one bird and the next
    const total = each + gap * (spots.length - 1);
    const draw = (ms: number) =>
        spots.forEach(([x, y], k) => {
          const u = Math.min(1, Math.max(0, (ms - k * gap) / each));
          const s = (u * each) / 1000;
          const up = y + 58; // far enough to clear the top of the drawing
          let dx: number, dy: number, w: number | null, tilt: number;
          if (off) {
            // Up and away to the left, beating hard, nose up at first
            dx = -(70 + 26 * k) * u ** 1.7;
            dy = -up * (0.55 * u + 0.45 * u * u);
            w = u > 0.01 ? Math.sin(2 * Math.PI * 9 * s) : null;
            tilt = 18 * Math.min(1, u * 8) * (1 - u);
          } else {
            // In from above on the right, a glide, then beating to slow down
            // and land
            dx = (60 + 22 * k) * (1 - u) ** 1.6;
            dy = -up * (1 - u) ** 2.2;
            const brake = Math.min(1, Math.max(0, (u - 0.55) / 0.15));
            w = u > 0.97 ? null : 0.55 * (1 - brake) + brake * Math.sin(2 * Math.PI * 11 * s);
            tilt = 22 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.6) / 0.4))));
          }
          attr(birds.current[k], "transform", `translate(${f2(dx)} ${f2(dy)}) rotate(${f2(tilt)} ${x} ${y - 2})`);
          const wing = wings.current[k];
          attr(wing, "visibility", w === null ? "hidden" : "visible");
          if (w !== null) attr(wing, "d", wingPath(x, y, w));
        });
    // Those coming back start out of sight
    draw(0);
    birds.current.forEach((b) => attr(b, "opacity", 1));
    await tween(total, (t) => draw(t * total), signal);
  }, onDone);
  return spots.map(([x, y], k) => (
    <g
      key={x}
      ref={(el) => {
        birds.current[k] = el;
      }}
      filter={WOBBLE}
      opacity={mode === "back" ? 0 : undefined}
    >
      <Pigeon x={x} y={y} />
      <path
        ref={(el) => {
          wings.current[k] = el;
        }}
        className="en-wing"
        d={wingPath(x, y, 0)}
        visibility="hidden"
      />
    </g>
  ));
}

// ----- The pub's sign -----

// Pushed, then a damped swing, about a second and a quarter each way and back
function MovingSign({ onDone }: { onDone: () => void }) {
  const sign = useRef<SVGGElement>(null);
  useMoves(async (signal, still) => {
    const [deg, ms, decay] = still ? [3, 1400, 0.4] : [15, 5200, 1.15];
    await tween(
      ms,
      (t) => {
        const s = (t * ms) / 1000;
        const a = deg * Math.exp(-s / decay) * Math.sin((2 * Math.PI * s) / 1.25) * (1 - t ** 6);
        attr(sign.current, "transform", `rotate(${f2(a)} ${SIGN_PIVOT.x} ${SIGN_PIVOT.y})`);
      },
      signal,
    );
  }, onDone);
  return (
    <>
      {/* The bracket stays put. The empty rect gives a line something to wobble in. */}
      <g filter={WOBBLE}>
        <rect x={330} y={58} width={28} height={10} fill="none" />
        <path className="en-post en-post-thin" d="M334 63 H354" />
      </g>
      <g ref={sign} filter={WOBBLE}>
        <path className="en-post en-post-thin" d="M338 63 V66 M350 63 V66" />
        <SignFace />
      </g>
    </>
  );
}

// ----- The shutters -----

// It rattles in its runners, goes up a little into its box, and drops back.
// Whatever stands in front of it in the drawing comes along, drawn on top.
function MovingShutter({ i, front, lit, onDone }: { i: number; front?: React.ReactNode; lit?: boolean; onDone: () => void }) {
  const s = SHUTTERS[i];
  const roll = useRef<SVGGElement>(null);
  const lip = useRef<SVGPathElement>(null);
  useMoves(async (signal, still) => {
    const lift = still ? 2.5 : 7;
    const at = (y: number) => {
      attr(roll.current, "transform", `translate(0 ${f2(-y)})`);
      attr(lip.current, "visibility", y > 0.3 ? "visible" : "hidden");
    };
    if (!still) await tween(380, (t) => at(0.9 * Math.abs(Math.sin(t * Math.PI * 5)) * (1 - t)), signal);
    await tween(still ? 900 : 650, (t) => at(lift * easeOut(t)), signal);
    await pause(still ? 900 : 700, signal);
    // Down it comes, faster as it falls, and a bounce at the bottom
    await tween(still ? 700 : 240, (t) => at(lift * (1 - (still ? smooth(t) : t * t))), signal);
    if (!still) await tween(320, (t) => at(0.8 * Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t) ** 2), signal);
    at(0);
  }, onDone);
  return (
    <g filter={WOBBLE}>
      <g clipPath={`url(#en-slot-${i})`}>
        <g ref={roll}>
          <Shutter {...s}>{i === 0 && <path className="en-tag" d={TANDOORI_TAG} />}</Shutter>
          {/* The street lamp's light on its face */}
          {lit && <path className="en-pool" d={poolPath(LAMPS[1])} clipPath={`url(#en-face-${i})`} />}
        </g>
      </g>
      {front}
      {/* The bottom of its box, which it slides up behind */}
      <path ref={lip} className="en-rail" d={`M${s.x} ${s.y} H${s.x + s.w}`} visibility="hidden" />
    </g>
  );
}

// ----- The bar's window -----

// The bulbs flicker in the drawing (Scene.tsx: dip); here, someone at the
// ledge looks round at them for a moment, and back
function MovingBar({ who, onDone }: { who?: number; onDone: () => void }) {
  const head = useRef<SVGCircleElement>(null);
  const nose = useRef<SVGPathElement>(null);
  const body = useRef<SVGPathElement>(null);
  useMoves(async (signal, still) => {
    if (who === undefined) return pause(800, signal);
    const x = BAR_X[who];
    const way = Math.random() < 0.5 ? -1 : 1;
    const turn = (v: number) => {
      const p = personShape(x, v * way);
      attr(head.current, "cx", f2(p.hx));
      attr(nose.current, "d", p.nose || "M0 0");
      attr(nose.current, "visibility", p.nose ? "visible" : "hidden");
      attr(body.current, "d", p.body);
    };
    await pause(150, signal);
    if (still) {
      turn(1);
      await pause(1600, signal);
      turn(0);
      return;
    }
    await tween(300, (t) => turn(smooth(t)), signal);
    await pause(1500, signal);
    await tween(350, (t) => turn(1 - smooth(t)), signal);
  }, onDone);
  if (who === undefined) return null;
  const p = personShape(BAR_X[who]);
  return (
    <g filter={WOBBLE}>
      <g clipPath="url(#en-windows)">
        <g className="en-figure">
          <circle ref={head} cx={p.hx} cy={102} r={4.5} />
          <path ref={nose} d="M0 0" visibility="hidden" />
          <path ref={body} d={p.body} />
        </g>
      </g>
    </g>
  );
}

// ----- The chalkboard -----

// The board's outline and its line, for where it covers the one behind it
const ABOARD_OUTLINE = "M1127.2 111.2 H1146.8 L1150.4 130.8 H1123.6 Z";

// A gust tips it up on its right foot; it drops back, rocks once or twice, and stops
function MovingABoard({ lit, behind, onDone }: { lit: boolean; behind: boolean; onDone: () => void }) {
  const board = useRef<SVGGElement>(null);
  const stay = useRef<SVGGElement>(null);
  useMoves(async (signal, still) => {
    const [deg, ms] = still ? [1, 500] : [4.5, 1100];
    const rock = (a: number) => `rotate(${f2(a)} ${ABOARD_FOOT.x} ${ABOARD_FOOT.y})`;
    await tween(
      ms,
      (t) => {
        const s = (t * ms) / 1000;
        const a = still ? deg * Math.sin(Math.PI * t) : deg * Math.exp(-s / 0.3) * Math.abs(Math.sin((Math.PI * s) / 0.26)) * (1 - t);
        attr(board.current, "transform", rock(a));
        attr(stay.current, "transform", rock(-a));
      },
      signal,
    );
  }, onDone);
  return (
    <g ref={board} filter={WOBBLE}>
      <ABoard />
      {/* The lamp's light falls on it */}
      {lit && <path className="en-pool" d={poolPath(LAMPS[1])} clipPath="url(#en-aboard-shape)" />}
      {/* The drawing has the one at the end of the ledge over its corner. They
          stay in the drawing, and only the bit over the board is drawn again
          (held still, and wobbled with the board so the edges meet), so
          whatever's in front of them stays there */}
      {behind && (
        <g clipPath="url(#en-aboard-outline)">
          <g ref={stay}>
            <g clipPath="url(#en-windows)">
              <Person x={BAR_X[BY_THE_BOARD]} />
            </g>
          </g>
        </g>
      )}
    </g>
  );
}

/** The layer over the drawing where the copies move. Only there while something is. */
export function Moving({ scene, eggs }: { scene: Scene; eggs: Eggs }) {
  const { plays, done, nudge } = eggs;
  const { state } = scene;
  const drawn = Object.entries(plays).filter(([id, p]) => p.phase !== "away" && !id.startsWith("lamp"));
  if (!drawn.length) return null;
  const end = (id: string) => () => done(id, plays[id].n, plays[id].phase);
  const key = (id: string) => `${plays[id].n}-${plays[id].phase}`;
  const lit = LAMPS_ON.includes(state);

  return (
    <svg className="en-moving" viewBox="0 -44 2000 284" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        {/* The drawing's pencil wobble (Scene.tsx), with room round a small thing */}
        <filter id="en-wobble-part" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* A shutter shows below its box (slot), and the lamp's light falls on its face */}
        {SHUTTERS.map((s, i) => (
          <clipPath key={i} id={`en-slot-${i}`}>
            <rect x={s.x - 2} y={s.y - 0.6} width={s.w + 4} height={s.h + 3} />
          </clipPath>
        ))}
        {SHUTTERS.map((s, i) => (
          <clipPath key={i} id={`en-face-${i}`}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} />
          </clipPath>
        ))}
        <clipPath id="en-aboard-shape">
          <path d={ABOARD_EDGE} />
        </clipPath>
        <clipPath id="en-aboard-outline">
          <path d={ABOARD_OUTLINE} />
        </clipPath>
      </defs>

      {SHUTTERS.map((_, i) => {
        const id = `shutter${i}`;
        if (!plays[id]) return null;
        // The street cabinet and bags stand in front of one; Endeavour's lamp lights another
        const front = i === 1 && (
          <>
            <Cabinet />
            {!plays.bags && BAGS.map((b) => <path key={b.x} className="en-o en-bag" d={b.d} />)}
          </>
        );
        return <MovingShutter key={key(id)} i={i} front={front} lit={i === 2 && lit} onDone={end(id)} />;
      })}
      {plays.sign && <MovingSign key={key("sign")} onDone={end("sign")} />}
      {PIGEONS.map((_, i) => {
        const id = `pigeons${i}`;
        const p = plays[id];
        return p && p.phase !== "away" && <MovingPigeons key={key(id)} ledge={i} mode={p.phase} onDone={end(id)} />;
      })}
      {plays.bar && <MovingBar key={key("bar")} who={plays.bar.who} onDone={end("bar")} />}
      {plays.aboard && (
        <MovingABoard key={key("aboard")} lit={lit} behind={BAR_PEOPLE[state].includes(BY_THE_BOARD)} onDone={end("aboard")} />
      )}
      {plays.bags && <MovingBags key={key("bags")} soft={plays.bags.phase === "nosed"} onDone={end("bags")} />}
      {plays.fox && plays.fox.phase !== "away" && <MovingFox key={key("fox")} mode={plays.fox.phase} onDone={end("fox")} onNose={nudge} />}
    </svg>
  );
}
