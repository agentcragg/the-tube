"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { DiceIcon, StarIcon } from "@/components/Icons";
import { credit, parseYouTubeId, thumb, type Video } from "@/lib/videos";

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

type Pending = { id: string; title: string; author?: string };

// Small per-browser lists (your pending suggestions, your favourites), kept in
// localStorage until there's a database behind the wall.
function localList<T>(key: string) {
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();
  return {
    get(): T[] {
      if (cache) return cache;
      try {
        cache = JSON.parse(localStorage.getItem(key) ?? "[]");
      } catch {
        cache = [];
      }
      return cache!;
    },
    set(next: T[]) {
      cache = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
const pendingStore = localList<Pending>("tube-pending");
const favStore = localList<string>("tube-favourites");
const NO_PENDING: Pending[] = [];
const NO_FAVS: string[] = [];

const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

// A fixed lattice step keeps nearby cells on different videos
const videoIndex = (cx: number, cy: number, count: number) => (((cx * 5 + cy * 7) % count) + count) % count;

const formatDay = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Tile({
  video,
  style,
  onOpen,
  onHover,
  starred,
  onStar,
}: {
  video: Video;
  style: React.CSSProperties;
  onOpen: () => void;
  onHover: (on: boolean) => void;
  starred: boolean;
  onStar: () => void;
}) {
  return (
    <div className="tile" style={style} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <button className="tile-open" onClick={onOpen}>
        {/* hqdefault is 4:3 with the video letterboxed inside; cropping it to 16:9
            cuts the bars off both widescreen and 4:3 videos */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(video.id, "hq")} alt="" draggable={false} />
        <span className="tile-info">
          <strong>{video.title}</strong>
          {credit(video) && <span>{credit(video)}</span>}
          {video.suggestedBy && (
            <span>
              Suggested by {video.suggestedBy}
              {video.suggestedOn && `, ${formatDay(video.suggestedOn)}`}
            </span>
          )}
        </span>
      </button>
      <button
        className={starred ? "tile-star tile-star-on" : "tile-star"}
        onClick={onStar}
        aria-pressed={starred}
        aria-label={starred ? `Remove ${video.title} from favourites` : `Add ${video.title} to favourites`}
        title={starred ? "Remove from favourites" : "Add to favourites"}
      >
        <StarIcon filled={starred} />
      </button>
    </div>
  );
}

type FilmTag = { slug: string; title: string; tags?: string[] };

export default function Wall({ videos: all, films }: { videos: Video[]; films: FilmTag[] }) {
  const params = useSearchParams();
  const tag = params.get("tag");
  const showFavs = params.get("show") === "favourites";
  const favs = useSyncExternalStore(favStore.subscribe, favStore.get, () => NO_FAVS);
  const videos = all.filter(
    (v) => (!tag || v.tags?.includes(tag)) && (!showFavs || favs.includes(v.id)),
  );
  const wallTags = [...new Set(all.flatMap((v) => v.tags ?? []))].sort();
  const filmsWithTag = tag ? films.filter((f) => f.tags?.includes(tag)) : [];
  const toggleFav = (id: string) =>
    favStore.set(favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]);
  const surprise = () => {
    const pool = videos.length ? videos : all;
    setOpen(pickRandom(pool));
  };

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

  const [open, setOpen] = useState<Video | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{ kind: "error" | "ok" | "busy"; msg: string } | null>(null);
  const pending = useSyncExternalStore(pendingStore.subscribe, pendingStore.get, () => NO_PENDING);

  useEffect(() => {
    playing.current = !!open;
  }, [open]);

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

  useLayoutEffect(() => {
    const el = viewport.current!;
    // Start with a tile centred
    offset.current = { x: el.clientWidth / 2 - TILE_W / 2, y: el.clientHeight / 2 - TILE_H / 2 };
    apply();

    let raf = 0;
    const tick = () => {
      const v = velocity.current;
      const coasting = Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05;
      if (!drag.current && coasting) {
        v.x *= FRICTION;
        v.y *= FRICTION;
      } else if (!drag.current) {
        v.x = v.y = 0;
      }

      const idle = !drag.current && !coasting && !hovering.current && !playing.current;
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
    const stopping = Math.hypot(v.x, v.y) > 1;
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = parseYouTubeId(input);
    if (!id) return setStatus({ kind: "error", msg: "That doesn't look like a YouTube link." });
    if (all.some((v) => v.id === id) || pending.some((p) => p.id === id)) {
      return setStatus({ kind: "error", msg: "Someone's already suggested that one." });
    }
    setStatus({ kind: "busy", msg: "Looking it up…" });
    const res = await fetch(`/api/oembed?id=${id}`);
    const data = await res.json();
    if (!res.ok) return setStatus({ kind: "error", msg: data.error });

    pendingStore.set([{ id, title: data.title, author: data.author }, ...pending]);
    setInput("");
    setStatus({ kind: "ok", msg: `Got it: "${data.title}". It goes on the wall once it's been approved.` });
  }

  const onHover = (on: boolean) => {
    hovering.current = on;
  };

  const tiles = [];
  for (let cy = view.cy; videos.length && cy < view.cy + view.rows; cy++) {
    for (let cx = view.cx; cx < view.cx + view.cols; cx++) {
      const video = videos[videoIndex(cx, cy, videos.length)];
      tiles.push(
        <Tile
          key={`${cx},${cy}`}
          video={video}
          onOpen={() => setOpen(video)}
          onHover={onHover}
          starred={favs.includes(video.id)}
          onStar={() => toggleFav(video.id)}
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
            id="yt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a YouTube link"
            autoComplete="off"
          />
          <button type="submit" disabled={status?.kind === "busy"}>
            Suggest
          </button>
        </form>
        <p className="wall-explainer">
          {status ? (
            <span className={`status-${status.kind}`}>{status.msg}</span>
          ) : (
            <>
              Every night at The Tube has YouTube videos alongside the feature. Send us the ones that
              deserve a big screen. Everything on the wall was suggested by someone.
            </>
          )}
          {pending.length > 0 && <span className="pending-count"> · {pending.length} of yours waiting for approval</span>}
        </p>
        <nav className="wall-filters" aria-label="Filter the wall">
          <Link href="/wall" scroll={false} className={!tag && !showFavs ? "on" : undefined}>
            All ({all.length})
          </Link>
          <Link href="/wall?show=favourites" scroll={false} className={showFavs ? "on" : undefined}>
            <StarIcon filled /> My favourites ({favs.length})
          </Link>
          <span className="wall-filters-sep" />
          {wallTags.map((t) => (
            <Link
              key={t}
              href={`/wall?tag=${encodeURIComponent(t)}`}
              scroll={false}
              className={t === tag ? "tag-chip on" : "tag-chip"}
            >
              {t}
            </Link>
          ))}
          <button type="button" className="surprise" onClick={surprise}>
            <DiceIcon /> Surprise me
          </button>
        </nav>
      </div>

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
        {!videos.length && (
          <div className="wall-empty">
            {showFavs ? (
              <p>No favourites yet. Click the star on any video to keep it here.</p>
            ) : (
              <>
                <p>Nothing on the wall is tagged &ldquo;{tag}&rdquo; yet.</p>
                {filmsWithTag.length > 0 && (
                  <p>
                    Films tagged &ldquo;{tag}&rdquo;:{" "}
                    {filmsWithTag.map((f, n) => (
                      <span key={f.slug}>
                        {n > 0 && ", "}
                        <Link href={`/films/${f.slug}`}>{f.title}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </>
            )}
            <p>
              <Link href="/wall">Show everything</Link>
            </p>
          </div>
        )}
      </div>

      {open && (
        <div className="modal" onClick={() => setOpen(null)} role="dialog" aria-label={open.title}>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="modal-bar">
              <span>{open.title}</span>
              <button onClick={() => setOpen(null)} aria-label="Close">
                ×
              </button>
            </div>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1`}
              title={open.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
