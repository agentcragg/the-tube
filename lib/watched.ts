"use client";

import { useSyncExternalStore } from "react";

// What this browser has watched: YouTube IDs of the Rabbit hole clips it has
// played or opened, and the wall videos it has opened. Their thumbnails keep
// the red scrub bar full. Kept in localStorage and never sent anywhere; with
// storage blocked (a private window) there are simply no marks. No counts.

const STORAGE_KEY = "tube-watched";
const MAX = 500; // the most recent; older ones drop off

const EMPTY = new Set<string>();
let cache: Set<string> | null = null;
const listeners = new Set<() => void>();

function get(): Set<string> {
  if (cache) return cache;
  try {
    cache = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    cache = new Set();
  }
  return cache!;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// A clip opened in another tab marks this one too
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listeners.forEach((l) => l());
  });
}

export function markWatched(id: string) {
  const ids = get();
  if (ids.has(id)) return;
  // Newest last, so the cap drops the oldest
  cache = new Set([...ids, id].slice(-MAX));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cache]));
  } catch {}
  listeners.forEach((l) => l());
}

// Empty on the server and during hydration, so the marks appear just after
export const useWatched = () => useSyncExternalStore(subscribe, get, () => EMPTY);
