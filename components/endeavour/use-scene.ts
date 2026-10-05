import { useSyncExternalStore } from "react";
import { useLondonNow } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { seedVideos } from "@/lib/videos";
import { sceneAs, sceneAt, type Scene, type State } from "./state";

// The scene the footer drawing shows, and the time switch's pick, kept here
// rather than in the drawing so dark mode (components/DarkMode.tsx) moves
// with it when it changes.

export const WALL_IDS = seedVideos.map((v) => v.id);

let picked: State | "" = "";
const listeners = new Set<() => void>();

export function pickState(state: State | "") {
  picked = state;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** The time switch's chosen state, or "" for real time. */
export function usePicked(): State | "" {
  return useSyncExternalStore(subscribe, () => picked, () => "");
}

/** What the drawing shows now: null on the server and until the browser knows the time. */
export function useScene(films: Film[]): Scene | null {
  const now = useLondonNow();
  const state = usePicked();
  if (!now) return null;
  return state ? sceneAs(state, now, films, WALL_IDS) : sceneAt(now, films, WALL_IDS);
}
