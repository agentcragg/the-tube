"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Ago from "@/components/Ago";
import { Laurel } from "@/components/laurels";
import SuggestTray from "@/components/SuggestTray";
import { pendingStore, setTrayClosed, usePending, useTrayClosed, type Pending, type PendingState } from "@/lib/pending";
import type { SuggestionState } from "@/lib/suggestions";
import {
  credit,
  isTikTok,
  parseTikTok,
  parseYouTubeId,
  thumb,
  tikTokPlayer,
  tikTokThumb,
  type Video,
} from "@/lib/videos";
import { useCycle } from "@/lib/use-cycle";
import { markWatched, useWatched } from "@/lib/watched";

// An endless grid of thumbnails. Drag to move it; a hard flick keeps gliding
// and eases to a stop. Left alone, it drifts slowly, and the drift pauses
// while you hover a thumbnail or watch a video. Wheels and trackpads scroll it.
// The plane is split into cells; each cell deterministically gets a video, so
// the same spot always shows the same thing, and only cells near the viewport
// are rendered.

const TILE_W = 192;
const TILE_H = 108; // 16:9
const GAP = 48;
const CELL_W = TILE_W + GAP;
const CELL_H = TILE_H + GAP;
const MARGIN = 1; // extra cells rendered beyond the edges

const DRIFT = { x: -0.25, y: -0.12 }; // idle drift, px per frame
const DRIFT_EASE = 0.02; // how gently the drift fades in and out
const FRICTION = 0.95; // per-frame slowdown after a flick; closer to 1 glides further
const DRAG_THRESHOLD = 4; // px before a press counts as a drag rather than a click
const MAX_FLING = 45; // px per frame cap, so a violent flick doesn't fly off for miles

// The visitor's own suggestions (lib/pending.ts) are on the wall too, for
// them only: greyed until they're approved. A new one flies from the box onto
// the wall, which glides over to catch it.
type Cell = [number, number];
type Glide = { from: { x: number; y: number }; to: { x: number; y: number }; t0: number; ms: number };
// Where the waiting ones go when the wall opens: round the tile it starts on
const SLOTS: Cell[] = [
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [0, 2],
  [2, 0],
  [-2, 0],
  [0, -2],
];
// Then on outwards a ring at a time, for anyone who's sent more than that
for (let r = 2; r <= 6; r++) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !SLOTS.some(([x, y]) => x === dx && y === dy)) {
        SLOTS.push([dx, dy]);
      }
    }
  }
}
const FLY_MS = 900;
const FADE_MS = 2600; // the yellow fade on one just sent or found
const LEAVE_MS = 400;
const HOLD_MS = 2500; // the drift waits this long after a glide, so you can see what it found
// Ask where the visitor's suggestions have got to this often, while the page is in view
const ASK_EVERY_MS = 60 * 1000;
const ASK_MAX = 30; // the most /api/suggest/status takes at once
// What the sheet says can be this old (the status route's cache), so it's only
// believed against a suggestion when it was heard well after that was sent,
// or found on the wall
const STALE_MS = 2 * 60 * 1000;

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// A fixed lattice step keeps nearby cells on different videos
const videoIndex = (cx: number, cy: number, count: number) => (((cx * 5 + cy * 7) % count) + count) % count;

const formatDay = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Tile({
  video,
  style,
  watched,
  onOpen,
  onHover,
  mine,
  fade,
  land,
  nudge,
}: {
  video: Video;
  style: React.CSSProperties;
  watched: boolean; // opened in this browser before: a red line along the bottom
  onOpen: () => void;
  onHover: (on: boolean) => void;
  mine?: PendingState | "leaving"; // one of the visitor's own suggestions
  fade?: number; // the yellow fade; a new number starts it again
  land?: boolean; // just landed
  nudge?: Cell; // a neighbour just landed: pushed this way for a moment
}) {
  const className = ["tile", mine && `tile-mine tile-${mine}`, land && "tile-land", nudge && "tile-nudge"]
    .filter(Boolean)
    .join(" ");
  // The look switch's "cycle" idea: only the picture changes, while hovered or held
  const cycle = useCycle(video.id, { skip: isTikTok(video.id), touch: true });
  return (
    <button
      className={className}
      style={nudge ? ({ ...style, "--nx": nudge[0], "--ny": nudge[1] } as React.CSSProperties) : style}
      onClick={onOpen}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      {...cycle.bind}
    >
      {isTikTok(video.id) ? (
        // Upright, over a blurred and darkened copy of itself filling the tile,
        // the way YouTube shows vertical videos
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tikTokThumb(video.id)} alt="" draggable={false} className="tile-blur" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tikTokThumb(video.id)} alt="" draggable={false} className="tile-upright" />
        </>
      ) : (
        <>
          {/* hqdefault is 4:3 with the video letterboxed inside; cropping it to 16:9
              cuts the bars off both widescreen and 4:3 videos */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cycle.src ?? thumb(video.id, "hq")} alt="" draggable={false} />
          <Laurel videoId={video.id} />
        </>
      )}
      <span className="tile-info">
        {video.title && <strong>{video.title}</strong>}
        {credit(video) && <span>{credit(video)}</span>}
        {video.suggestedBy && (
          <span>
            Suggested by {video.suggestedBy}
            {video.suggestedOn && `, ${formatDay(video.suggestedOn)}`}
          </span>
        )}
        {/* How long ago the sheet says it came in */}
        {video.suggestedOn && (
          <span>
            <Ago iso={video.suggestedOn} />
          </span>
        )}
      </span>
      {/* DRAFT: "Watched" is for screen readers only */}
      {watched && (
        <span className="tile-watched">
          <span className="sr-only">Watched</span>
        </span>
      )}
      {mine === "waiting" && (
        <span className="tile-note">
          <span className="queue-spinner" aria-hidden="true" /> Waiting for approval
        </span>
      )}
      {fade !== undefined && <span key={fade} className="queue-fade" />}
    </button>
  );
}

export default function Wall({ videos }: { videos: Video[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 }); // momentum left over from a flick
  const drift = useRef(0); // 0..1, eased towards 1 when idle and 0 when paused
  const drag = useRef<{ x: number; y: number; t: number; moved: number; stopping: boolean } | null>(null);
  const suppressClick = useRef(false);
  const hovering = useRef(false);
  const playing = useRef(false);
  const [view, setView] = useState({ cx: 0, cy: 0, cols: 8, rows: 6 });
  const glide = useRef<Glide | null>(null); // under way to one of the visitor's tiles
  const hold = useRef(0); // no drift until then
  const field = useRef<HTMLInputElement>(null);
  const tray = useRef<HTMLElement>(null);

  const [open, setOpen] = useState<Video | null>(null);
  const [input, setInput] = useState("");
  // `about`: the suggestion a thanks is for
  const [status, setStatus] = useState<{ kind: "error" | "ok" | "busy"; msg: string; about?: string } | null>(null);
  const pending = usePending();
  const trayClosed = useTrayClosed();
  const watched = useWatched();
  // What the sheet says about the visitor's suggestions (/api/suggest/status)
  const [states, setStates] = useState<Record<string, SuggestionState>>({});
  const [heardAt, setHeardAt] = useState(0);
  const [landed, setLanded] = useState<Record<string, Cell>>({}); // sent this visit: where they landed
  const [landing, setLanding] = useState<{ id: string; cell: Cell; from: DOMRect } | null>(null);
  // The yellow fade, on a cell, or (cell left out) on the visitor's own tile for that video
  const [fade, setFade] = useState<{ id: string; cell?: Cell; n: number; land: boolean } | null>(null);
  const lastHeard = useRef<Record<string, SuggestionState>>({});
  const [leaving, setLeaving] = useState<Record<string, { p: Pending; cell: Cell }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const onWall = useMemo(() => new Set(videos.map((v) => v.id)), [videos]);
  const stateOf = useCallback(
    (p: Pending): PendingState =>
      p.withdrawnAt ? "withdrawn" : p.wallAt || onWall.has(p.id) || states[p.id] === "wall" ? "wall" : "waiting",
    [onWall, states],
  );

  // The visitor's own tiles, by cell: the ones not on this page's wall yet.
  // Each keeps its slot for the visit (counted oldest first, so a new one
  // doesn't move the rest); one sent this visit stays where it landed.
  const own = useMemo(() => {
    const cells = new Map<string, { p: Pending; mine: PendingState | "leaving" }>();
    const at = new Map<string, Cell>();
    const put = (p: Pending, cell: Cell | undefined, mine: PendingState | "leaving") => {
      const k = cell && `${cell[0]},${cell[1]}`;
      if (!cell || !k || cells.has(k)) return;
      cells.set(k, { p, mine });
      at.set(p.id, cell);
    };
    [...pending]
      .reverse()
      .filter((p) => !onWall.has(p.id))
      .forEach((p, i) => {
        if (!p.withdrawnAt) put(p, landed[p.id] ?? SLOTS[i], stateOf(p));
      });
    Object.values(leaving).forEach(({ p, cell }) => put(p, cell, "leaving"));
    return { cells, at };
  }, [pending, landed, leaving, onWall, stateOf]);

  useEffect(() => {
    playing.current = !!open;
  }, [open]);

  // Ask the sheet where they've got to: now, every minute or so, and on coming back to the tab
  const askIds = pending
    .filter((p) => !p.withdrawnAt)
    .map((p) => p.id)
    .slice(0, ASK_MAX)
    .sort()
    .join(",");
  useEffect(() => {
    if (!askIds) return;
    let live = true;
    const ask = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/suggest/status?ids=${askIds}`);
        const data = res.ok ? await res.json() : null;
        if (!live || !data?.states) return;
        // Approved while they were looking: it lights up
        const approved = Object.keys(data.states).find(
          (id) => data.states[id] === "wall" && lastHeard.current[id] === "waiting",
        );
        lastHeard.current = data.states;
        setStates(data.states);
        setHeardAt(Date.now());
        if (approved) setFade({ id: approved, n: Date.now(), land: false });
      } catch {}
    };
    ask();
    const timer = setInterval(ask, ASK_EVERY_MS);
    document.addEventListener("visibilitychange", ask);
    return () => {
      live = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ask);
    };
  }, [askIds]);

  // Keep the list in step. Once on the wall it says so; if it's taken off the
  // wall again, or its row's deleted, it's off the list rather than back to waiting.
  useEffect(() => {
    const now = Date.now();
    let changed = false;
    const next = pending.flatMap((p) => {
      if (p.withdrawnAt) return [p];
      const s = states[p.id];
      if (onWall.has(p.id) || s === "wall") {
        if (p.wallAt) return [p];
        changed = true;
        return [{ ...p, wallAt: now }];
      }
      if (!s || heardAt - (p.wallAt ?? p.at ?? 0) < STALE_MS) return [p];
      if (s === "withdrawn") {
        changed = true;
        return [{ ...p, withdrawnAt: now }];
      }
      if (p.wallAt || s === "gone") {
        changed = true;
        return [];
      }
      return [p];
    });
    if (changed) pendingStore.set(next);
  }, [pending, states, heardAt, onWall]);

  useEffect(() => {
    if (!fade) return;
    const t = setTimeout(() => setFade(null), FADE_MS);
    return () => clearTimeout(t);
  }, [fade]);

  // Move the layer directly; only re-render when a new row/column of cells is needed.
  const apply = useCallback(() => {
    const { x, y } = offset.current;
    if (layer.current) layer.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const el = viewport.current;
    if (!el) return;
    const cx = Math.floor(-x / CELL_W) - MARGIN;
    const cy = Math.floor(-y / CELL_H) - MARGIN;
    const cols = Math.ceil(el.clientWidth / CELL_W) + MARGIN * 2 + 1;
    const rows = Math.ceil(el.clientHeight / CELL_H) + MARGIN * 2 + 1;
    setView((v) => (v.cx === cx && v.cy === cy && v.cols === cols && v.rows === rows ? v : { cx, cy, cols, rows }));
  }, []);

  const moveBy = useCallback(
    (dx: number, dy: number) => {
      offset.current.x += dx;
      offset.current.y += dy;
      apply();
    },
    [apply],
  );

  // The part of the wall that can be seen: not under the tray. Layout
  // positions (both are in .wall-stage), so the tray's slide-in doesn't count.
  const visible = useCallback(() => {
    const el = viewport.current!;
    let w = el.clientWidth;
    let h = el.clientHeight;
    const t = tray.current;
    if (t) {
      if (t.offsetTop > h / 2) h = Math.min(h, t.offsetTop);
      else if (t.offsetLeft > w / 2) w = Math.min(w, t.offsetLeft);
    }
    return { w, h };
  }, []);

  const middleCell = useCallback((): Cell => {
    const { w, h } = visible();
    return [Math.floor((w / 2 - offset.current.x) / CELL_W), Math.floor((h / 2 - offset.current.y) / CELL_H)];
  }, [visible]);

  // Glides the wall until this cell's in the middle of what can be seen, and
  // says where the wall will end up
  const glideTo = useCallback(
    ([cx, cy]: Cell) => {
      const { w, h } = visible();
      const to = { x: w / 2 - (cx * CELL_W + TILE_W / 2), y: h / 2 - (cy * CELL_H + TILE_H / 2) };
      const from = { ...offset.current };
      velocity.current = { x: 0, y: 0 };
      drift.current = 0;
      hold.current = performance.now() + HOLD_MS;
      const far = Math.hypot(to.x - from.x, to.y - from.y);
      if (reducedMotion() || far < 1) {
        glide.current = null;
        moveBy(to.x - from.x, to.y - from.y);
      } else {
        glide.current = { from, to, t0: performance.now(), ms: Math.min(1400, Math.max(600, far * 0.9)) };
      }
      return to;
    },
    [moveBy, visible],
  );

  useLayoutEffect(() => {
    const el = viewport.current!;
    // Start with a tile centred
    offset.current = { x: el.clientWidth / 2 - TILE_W / 2, y: el.clientHeight / 2 - TILE_H / 2 };
    apply();

    let raf = 0;
    const tick = () => {
      // Gliding to one of the visitor's suggestions: eased, and nothing else moves it
      const g = glide.current;
      if (g) {
        const t = Math.min(1, (performance.now() - g.t0) / g.ms);
        const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        moveBy(
          g.from.x + (g.to.x - g.from.x) * e - offset.current.x,
          g.from.y + (g.to.y - g.from.y) * e - offset.current.y,
        );
        if (t === 1) {
          glide.current = null;
          hold.current = performance.now() + HOLD_MS;
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      const v = velocity.current;
      const coasting = Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05;
      if (!drag.current && coasting) {
        v.x *= FRICTION;
        v.y *= FRICTION;
      } else if (!drag.current) {
        v.x = v.y = 0;
      }

      const idle =
        !drag.current && !coasting && !hovering.current && !playing.current && performance.now() > hold.current;
      drift.current += ((idle ? 1 : 0) - drift.current) * DRIFT_EASE;

      const dx = (drag.current ? 0 : v.x) + DRIFT.x * drift.current;
      const dy = (drag.current ? 0 : v.y) + DRIFT.y * drift.current;
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) moveBy(dx, dy);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => apply();
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      glide.current = null;
      hold.current = 0;
      velocity.current = { x: 0, y: 0 };
      moveBy(-e.deltaX, -e.deltaY);
    };
    window.addEventListener("resize", onResize);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("wheel", onWheel);
    };
  }, [apply, moveBy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(null);
      if (open || (e.target as HTMLElement).tagName === "INPUT") return;
      const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d) {
        e.preventDefault();
        glide.current = null;
        hold.current = 0;
        velocity.current = { x: d[0] * 14, y: d[1] * 14 };
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // A press while the wall is gliding just stops it; it shouldn't open a video
    const v = velocity.current;
    const stopping = Math.hypot(v.x, v.y) > 1 || !!glide.current;
    glide.current = null;
    hold.current = 0;
    suppressClick.current = false;
    velocity.current = { x: 0, y: 0 };
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, stopping };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (d.moved > DRAG_THRESHOLD && !viewport.current!.hasPointerCapture(e.pointerId)) {
      // Capturing makes the release land on the viewport, so a drag never counts as a click
      viewport.current!.setPointerCapture(e.pointerId);
      viewport.current!.classList.add("dragging");
    }
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    // Smoothed px-per-frame, so the flick speed reflects the last few moves
    const v = velocity.current;
    v.x = v.x * 0.6 + ((dx / dt) * 16) * 0.4;
    v.y = v.y * 0.6 + ((dy / dt) * 16) * 0.4;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
    moveBy(dx, dy);
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    viewport.current!.classList.remove("dragging");
    // Swallow the click that follows a drag or a stop, so neither opens a video
    if (d && (d.moved > DRAG_THRESHOLD || d.stopping)) {
      suppressClick.current = true;
    }
    // Held still before letting go: no fling
    const v = velocity.current;
    if (d && performance.now() - d.t > 80) velocity.current = { x: 0, y: 0 };
    else {
      const speed = Math.hypot(v.x, v.y);
      if (speed > MAX_FLING) velocity.current = { x: (v.x / speed) * MAX_FLING, y: (v.y / speed) * MAX_FLING };
    }
  };

  // The nearest tile showing this video, if it's on the wall
  const nearest = (id: string): Cell | null => {
    const i = videos.findIndex((v) => v.id === id);
    if (i < 0) return null;
    const [mx, my] = middleCell();
    for (let r = 0; r <= 24; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const cell: Cell = [mx + dx, my + dy];
          if (
            Math.max(Math.abs(dx), Math.abs(dy)) === r &&
            videoIndex(cell[0], cell[1], videos.length) === i &&
            !own.cells.has(`${cell}`)
          ) {
            return cell;
          }
        }
      }
    }
    return null;
  };

  // Brings one into view and gives it the yellow fade, here and in the tray
  const find = (id: string) => {
    const cell = own.at.get(id) ?? nearest(id);
    if (!cell) return;
    glideTo(cell);
    setFade({ id, cell, n: Date.now(), land: false });
  };

  // Where a new one lands: just past the middle of the view, so the wall moves to catch it
  const landingCell = (): Cell => {
    const [mx, my] = middleCell();
    for (let r = 0; ; r++) {
      for (const [dx, dy] of [
        [1, 1],
        [1, 0],
        [0, 1],
        [1, -1],
        [-1, 1],
        [0, -1],
        [-1, 0],
        [-1, -1],
      ]) {
        const cell: Cell = [mx + dx * (r + 1), my + dy * (r + 1)];
        if (!own.cells.has(`${cell}`)) return cell;
      }
    }
  };

  // The flight: the thumbnail leaves the box, arcs over and lands on its cell
  // as the wall glides there. Then a thump, the neighbours budge, the yellow fade.
  useLayoutEffect(() => {
    if (!landing) return;
    const { id, cell, from } = landing;
    const to = glideTo(cell);
    const v = viewport.current!.getBoundingClientRect();
    const end = { x: v.left + to.x + cell[0] * CELL_W, y: v.top + to.y + cell[1] * CELL_H };
    const flyer = document.createElement("div");
    flyer.className = "queue-flyer";
    Object.assign(flyer.style, { left: `${end.x}px`, top: `${end.y}px`, width: `${TILE_W}px`, height: `${TILE_H}px` });
    const img = document.createElement("img");
    img.src = isTikTok(id) ? tikTokThumb(id) : thumb(id, "hq");
    img.alt = "";
    flyer.append(img);
    document.body.append(flyer);
    // Starts small, where the link was typed
    const s = 64 / TILE_W;
    const sx = from.left + 6 - end.x;
    const sy = from.top + from.height / 2 - (TILE_H * s) / 2 - end.y;
    const flight = flyer.animate(
      [
        { transform: `translate(${sx}px, ${sy}px) scale(${s})`, opacity: 0 },
        { transform: `translate(${sx}px, ${sy}px) scale(${s})`, opacity: 1, offset: 0.08 },
        { transform: `translate(${sx * 0.45}px, ${sy * 0.45 - 90}px) scale(1.2) rotate(-5deg)`, offset: 0.55 },
        { transform: "none", opacity: 1 },
      ],
      { duration: reducedMotion() ? 1 : FLY_MS, easing: "cubic-bezier(.45, 0, .3, 1)" },
    );
    flight.onfinish = () => {
      flyer.remove();
      setLanding(null);
      setFade({ id, cell, n: Date.now(), land: true });
    };
    return () => {
      flight.onfinish = null;
      flight.cancel();
      flyer.remove();
    };
  }, [landing, glideTo]);

  async function withdraw(p: Pending) {
    // The thanks for sending it no longer holds: back to the usual words
    const unthank = () => setStatus((s) => (s?.about === p.id ? null : s));
    // Off this browser's list only: the tile goes, the sheet keeps it
    const forget = () => {
      leave(p);
      pendingStore.forget(p.id);
      unthank();
    };
    if (!p.key) return forget();
    setBusy(p.id);
    let done: { withdrawn?: boolean; state?: SuggestionState } | null = null;
    try {
      const res = await fetch("/api/suggest/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, key: p.key }),
      });
      if (res.ok) done = await res.json();
    } catch {}
    setBusy(null);
    if (!done) return setStatus({ kind: "error", msg: "Couldn't withdraw that. Try again in a minute." });
    if (done.withdrawn) {
      leave(p);
      pendingStore.mark(p.id, "withdrawnAt");
      unthank();
    } else if (done.state === "wall") {
      pendingStore.mark(p.id, "wallAt");
    } else {
      forget();
    }
  }

  // Its tile shrinks away rather than vanishing
  const leave = (p: Pending) => {
    const cell = own.at.get(p.id);
    if (!cell) return;
    setLeaving((l) => ({ ...l, [p.id]: { p, cell } }));
    setTimeout(
      () =>
        setLeaving((l) => {
          const rest = { ...l };
          delete rest[p.id];
          return rest;
        }),
      LEAVE_MS,
    );
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const yt = parseYouTubeId(input);
    const tt = yt ? null : parseTikTok(input);
    if (!yt && !tt) return setStatus({ kind: "error", msg: "That doesn't look like a YouTube or TikTok link." });
    const known = (id: string) => onWall.has(id) || pending.some((p) => p.id === id && !p.withdrawnAt);
    // And there it is
    const alreadyIn = (id: string) => {
      setStatus({ kind: "error", msg: "Someone's already suggested that one." });
      find(id);
    };
    // A short TikTok link only says which video it is once the server has followed it
    const id = yt ?? (tt && "id" in tt ? tt.id : null);
    if (id && known(id)) return alreadyIn(id);
    setStatus({ kind: "busy", msg: "Sending…" });
    let res: Response;
    try {
      res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.trim() }),
      });
    } catch {
      return setStatus({ kind: "error", msg: "Couldn't send that. Check your connection and try again." });
    }
    const data = await res.json().catch(() => ({ error: "Something went wrong sending that. Try again in a minute." }));
    if (!res.ok) return setStatus({ kind: "error", msg: data.error });
    if (!id && known(data.id)) return alreadyIn(data.id);

    const mine: Pending = { id: data.id, title: data.title, author: data.channel, at: Date.now(), key: data.key };
    // One withdrawn earlier this visit comes back as new
    pendingStore.set([mine, ...pendingStore.get().filter((p) => p.id !== mine.id)]);
    const cell = landingCell();
    setLanded((l) => ({ ...l, [mine.id]: cell }));
    setLanding({ id: mine.id, cell, from: field.current!.getBoundingClientRect() });
    setTrayClosed(false);
    setInput("");
    setStatus({
      kind: "ok",
      msg: `Thanks: "${data.title || data.channel}" has been sent. It goes on the wall once it's been approved.`,
      about: mine.id,
    });
  }

  const onHover = (on: boolean) => {
    hovering.current = on;
  };

  const tiles = [];
  for (let cy = view.cy; cy < view.cy + view.rows; cy++) {
    for (let cx = view.cx; cx < view.cx + view.cols; cx++) {
      const mine = own.cells.get(`${cx},${cy}`);
      // Still in the air: the cell keeps what it had until it lands
      if (mine && landing?.id !== mine.p.id) {
        const video = { id: mine.p.id, title: mine.p.title, channel: mine.p.author };
        const here = !!fade && (fade.cell ? fade.cell[0] === cx && fade.cell[1] === cy : fade.id === mine.p.id);
        tiles.push(
          <Tile
            key={`${cx},${cy},${mine.p.id}`}
            video={video}
            watched={watched.has(video.id)}
            onOpen={() => {
              markWatched(video.id);
              setOpen(video);
            }}
            onHover={onHover}
            mine={mine.mine}
            fade={here ? fade.n : undefined}
            land={here && fade.land}
            style={{ left: cx * CELL_W, top: cy * CELL_H, width: TILE_W, height: TILE_H }}
          />,
        );
        continue;
      }
      const video = videos[videoIndex(cx, cy, videos.length)];
      const at = fade?.cell;
      const here = !!at && at[0] === cx && at[1] === cy;
      const near = !!at && fade.land && !here && Math.abs(at[0] - cx) <= 1 && Math.abs(at[1] - cy) <= 1;
      tiles.push(
        <Tile
          key={`${cx},${cy}`}
          video={video}
          watched={watched.has(video.id)}
          onOpen={() => {
            markWatched(video.id);
            setOpen(video);
          }}
          onHover={onHover}
          fade={here && fade ? fade.n : undefined}
          nudge={near ? [Math.sign(cx - at[0]), Math.sign(cy - at[1])] : undefined}
          style={{ left: cx * CELL_W, top: cy * CELL_H, width: TILE_W, height: TILE_H }}
        />,
      );
    }
  }

  return (
    <div className="wall-page">
      <div className="wall-toolbar">
        <form className="suggest" onSubmit={submit}>
          <label htmlFor="yt">Suggest a video</label>
          <input
            ref={field}
            id="yt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a YouTube or TikTok link"
            autoComplete="off"
          />
          <button type="submit" disabled={status?.kind === "busy"}>
            Suggest
          </button>
        </form>
        <p className="wall-explainer">
          {status ? (
            <span className={`status-${status.kind}`}>
              {status.kind === "busy" && <span className="queue-spinner" aria-hidden="true" />} {status.msg}
            </span>
          ) : (
            <>
              Every screening at THE TUBE is preceded by a curated selection of oddities scavenged
              from the many corners of the internet. Send us videos that you think deserve the big
              screen treatment, you great big dogs. Everything on this wall was suggested by someone.
            </>
          )}
        </p>
      </div>

      <div className="wall-stage">
        <div
          ref={viewport}
          className="wall-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              suppressClick.current = false;
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          tabIndex={0}
          aria-label="Suggested videos. Drag, scroll or use the arrow keys to look around."
        >
          <div ref={layer} className="wall-layer">
            {tiles}
          </div>
        </div>

        {pending.length > 0 && (
          <SuggestTray
            trayRef={tray}
            items={pending.map((p) => ({ p, state: stateOf(p) }))}
            closed={trayClosed}
            busy={busy}
            fade={fade ?? undefined}
            onToggle={() => setTrayClosed(!trayClosed)}
            onFind={(p) => find(p.id)}
            onWithdraw={withdraw}
          />
        )}
      </div>

      {open && (
        <div className="modal" onClick={() => setOpen(null)} role="dialog" aria-label={open.title || open.channel}>
          <div
            className={isTikTok(open.id) ? "modal-inner modal-tall" : "modal-inner"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-bar">
              <span>{open.title || open.channel}</span>
              <button onClick={() => setOpen(null)} aria-label="Close">
                ×
              </button>
            </div>
            <iframe
              src={
                isTikTok(open.id)
                  ? tikTokPlayer(open.id)
                  : `https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1`
              }
              title={open.title || open.channel}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
