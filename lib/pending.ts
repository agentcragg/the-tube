"use client";

import { useSyncExternalStore } from "react";

// The visitor's own suggestions, kept in their browser: the wall shows them as
// their own tiles and in the tray under it, and the Suggest a video tab counts
// the ones still waiting. Only the IDs (and a withdrawal's key) are ever sent
// back, to ask where they've got to. With storage blocked there's no list.

export type Pending = {
  id: string;
  title: string;
  author?: string;
  at?: number; // when it was sent
  key?: string; // proves it's theirs when withdrawing it (sheet version 4 on)
  wallAt?: number; // when it was first seen on the wall
  withdrawnAt?: number; // withdrawn from the sheet
};

export type PendingState = "waiting" | "wall" | "withdrawn";

const STORAGE_KEY = "tube-pending";
const TRAY_KEY = "tube-tray"; // "closed" when the tray's been folded away

const DAY = 24 * 60 * 60 * 1000;
// A suggestion that's never approved is forgotten after this long
const FORGET_AFTER_MS = 30 * DAY;
// One that's made it onto the wall stays on the list this long
const KEEP_ON_WALL_MS = 7 * DAY;

const EMPTY: Pending[] = [];
let cache: Pending[] | null = null;
const listeners = new Set<() => void>();

// Read once per visit. What was withdrawn last time, or has had its time on
// the list, is left out (and goes for good on the next change).
function get(): Pending[] {
  if (cache) return cache;
  const now = Date.now();
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = (Array.isArray(list) ? list : []).filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        !p.withdrawnAt &&
        !(p.wallAt && now - p.wallAt > KEEP_ON_WALL_MS) &&
        !(!p.wallAt && p.at && now - p.at > FORGET_AFTER_MS),
    );
  } catch {
    cache = [];
  }
  return cache!;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Another tab's suggestion shows up here too
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY && e.key !== TRAY_KEY) return;
    cache = null;
    closed = null;
    listeners.forEach((l) => l());
  });
}

export const pendingStore = {
  get,
  set(next: Pending[]) {
    cache = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  },
  update(id: string, patch: Partial<Pending>) {
    pendingStore.set(get().map((p) => (p.id === id ? { ...p, ...patch } : p)));
  },
  // Stamped now: withdrawn from the sheet, or found on the wall
  mark(id: string, as: "withdrawnAt" | "wallAt") {
    pendingStore.update(id, { [as]: Date.now() });
  },
  forget(id: string) {
    pendingStore.set(get().filter((p) => p.id !== id));
  },
  subscribe,
};

export const usePending = () => useSyncExternalStore(subscribe, get, () => EMPTY);

/** Still waiting, as far as this browser knows (the wall page finds out more). */
export const isWaiting = (p: Pending) => !p.wallAt && !p.withdrawnAt;

// Folded away or not; kept here too, so it still works with storage blocked
let closed: boolean | null = null;

function trayClosed() {
  if (closed === null) {
    try {
      closed = localStorage.getItem(TRAY_KEY) === "closed";
    } catch {
      closed = false;
    }
  }
  return closed;
}

export const useTrayClosed = () => useSyncExternalStore(subscribe, trayClosed, () => false);

export function setTrayClosed(next: boolean) {
  closed = next;
  try {
    if (next) localStorage.setItem(TRAY_KEY, "closed");
    else localStorage.removeItem(TRAY_KEY);
  } catch {}
  listeners.forEach((l) => l());
}
