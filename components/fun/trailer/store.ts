import { useSyncExternalStore } from "react";

// Which film's trailer is open, shared by the button in the action row and
// the player in the still. Keyed by slug so a trailer never follows you to
// another film page. Only ever set from a click, so it's always null on the
// server.

let openSlug: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function set(next: string | null) {
  if (next === openSlug) return;
  openSlug = next;
  for (const l of listeners) l();
}

export const openTrailer = (slug: string) => set(slug);

/** Closes the trailer, but only if it's this film's (when a slug is given). */
export function closeTrailer(slug?: string) {
  if (slug && openSlug !== slug) return;
  set(null);
}

export function useOpenTrailer(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => openSlug,
    () => null,
  );
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
