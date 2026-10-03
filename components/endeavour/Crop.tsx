"use client";

// A small crop of the footer drawing, used as The Tube's picture of itself
// in pages (the building look, lib/look.ts). It follows London time like the
// footer, and the footer's time switch, unless a scene is given. Its glow and
// poster are held grey (app/look-building.css), so the only colour is a film
// still on its screen. Inert: the footer's screen stays the only way into
// Basement TV.

import { useId, useSyncExternalStore } from "react";
import { useLondonNow } from "@/lib/clock";
import { CROPS } from "@/lib/endeavour";
import { films } from "@/lib/films";
import { useLook } from "@/lib/use-look";
import { seedVideos } from "@/lib/videos";
import Scene from "./Scene";
import { sceneAs, sceneAt, timePick, type Scene as SceneT, type State } from "./state";

const WALL_IDS = seedVideos.map((v) => v.id);

type Props = { crop: keyof typeof CROPS; scene?: SceneT; screenImage?: string };

// Only drawn in the browser, with the look on: nobody else gets a second
// copy of the drawing in the page, hidden or not
export default function Crop(props: Props) {
  return useLook("building") ? <Drawing {...props} /> : null;
}

function Drawing({ crop, scene, screenImage }: Props) {
  const now = useLondonNow();
  const picked = useSyncExternalStore<State | "">(timePick.subscribe, timePick.get, () => "");
  // useId's punctuation isn't safe inside url(#...)
  const idPrefix = useId().replace(/[^a-z0-9]/gi, "");
  const shown = scene ?? (now ? (picked ? sceneAs(picked, now, films, WALL_IDS) : sceneAt(now, films, WALL_IDS)) : null);

  return (
    <div className="en-strip en-crop" data-state={shown?.state} inert>
      <Scene scene={shown} viewBox={CROPS[crop]} fit="xMidYMid slice" idPrefix={idPrefix} screenImage={screenImage} />
    </div>
  );
}
