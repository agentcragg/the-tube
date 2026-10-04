import { useCallback, useEffect, useRef, useState } from "react";
import { useLook } from "@/lib/use-look";
import { thumb } from "@/lib/videos";

// 2008 YouTube's hover thumbnails, for the look switch's "cycle" idea: while
// the pointer is on one it steps through the video's three automatic frames
// (1.jpg, 2.jpg, 3.jpg) and round again, and off it it's the usual picture.
// The frames are fetched on the first hover, so a page of thumbnails costs
// nothing extra until then, and every hover after that is instant.

export const CYCLE_MS = 800; // how long each frame shows
export const CYCLE_FIRST_MS = 200; // the first change comes sooner, so the hover is felt

// null if it didn't load
const load = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Per video, the frames that loaded: 480x360 where YouTube made them, else
// the 120x90 originals. YouTube answers for a big frame it never made with a
// 120x90 grey picture, which is how a missing one is spotted.
const loaded = new Map<string, Promise<string[]>>();
function framesFor(id: string) {
  let frames = loaded.get(id);
  if (!frames) {
    frames = Promise.all(
      ([1, 2, 3] as const).map(async (n) => {
        const big = await load(thumb(id, `hq${n}` as const));
        if (big && big.naturalWidth > 120) return big.src;
        return (await load(thumb(id, n)))?.src;
      }),
    ).then((list) => list.filter((src) => src !== undefined));
    loaded.set(id, frames);
  }
  return frames;
}

/** Warms the frames without showing them, e.g. for a Scrubber that shows them itself. */
export const preloadFrames = (srcs: string[]) => srcs.forEach((src) => load(src));

/**
 * The frame to show in place of a YouTube thumbnail (null: the usual one) and
 * the handlers that start and stop it. With `touch`, a finger held on it
 * cycles it too (the wall, where a press is already part of moving around);
 * elsewhere a long press is the phone's own, so it's left alone.
 */
export function useCycle(id: string, { skip, touch }: { skip?: boolean; touch?: boolean } = {}) {
  const on = useLook("cycle") && !skip;
  const [src, setSrc] = useState<string | null>(null);
  const live = useRef(false);
  const run = useRef(0); // which hover a late-loading set of frames belongs to
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stop = useCallback(() => {
    if (!live.current) return;
    live.current = false;
    run.current++;
    clearTimeout(timer.current);
    setSrc(null);
  }, []);

  const start = useCallback(() => {
    if (live.current) return;
    live.current = true;
    const mine = ++run.current;
    const began = performance.now();
    framesFor(id).then((frames) => {
      if (mine !== run.current || !frames.length) return;
      let n = 0;
      const step = () => {
        setSrc(frames[n++ % frames.length]);
        timer.current = setTimeout(step, CYCLE_MS);
      };
      timer.current = setTimeout(step, Math.max(0, CYCLE_FIRST_MS - (performance.now() - began)));
    });
  }, [id]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const bind = on
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType === "mouse") start();
        },
        onPointerDown: (e: React.PointerEvent) => {
          if (touch && e.pointerType !== "mouse") start();
        },
        onPointerUp: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") stop();
        },
        onPointerLeave: stop,
        onPointerCancel: stop,
      }
    : {};

  return { src: on ? src : null, bind };
}
