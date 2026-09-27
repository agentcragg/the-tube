"use client";

// Endeavour, drawn: the cutaway strip at the top of the fat footer. It
// follows London time. On a screening night
// the basement screen glows in that night's film colour; the poster case by
// the door always shows the next film's colour (on a film page, that film's,
// since the page sets --film on :root). There's no interaction and no seat
// data, on purpose: it's something to look at, not a meter.

import type { CSSProperties } from "react";
import { useLondonNow } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { seedVideos } from "@/lib/videos";
import Scene from "./Scene";
import { sceneAt } from "./state";

const WALL_IDS = seedVideos.map((v) => v.id);

export function EndeavourStrip({ films }: { films: Film[] }): React.ReactNode {
  // null while rendering on the server: the drawing's shell shows, in neutral
  // greys, and the right state fades in once the browser knows the time
  const now = useLondonNow();
  const scene = now ? sceneAt(now, films, WALL_IDS) : null;

  const style: Record<string, string> = {};
  if (scene?.next) style["--en-next"] = scene.next.colour;
  if (scene?.tonight) style["--glow"] = scene.tonight.colour;

  return (
    <div className="en-strip" data-state={scene?.state} style={style as CSSProperties} aria-hidden="true">
      <Scene scene={scene} />
    </div>
  );
}
