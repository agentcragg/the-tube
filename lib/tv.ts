// Basement TV (/tv): a channel that's always on, the same for everyone. It
// plays this week's night round and round, the shorts first, then the
// film's rabbit hole, on a fixed schedule. There's no server and no
// database: every browser works the slot out from the clock, so whoever
// tunes in at 21:14 sees the same video at the same second.
//
// This week's film is the next one on, today's included, or the last one
// once the season is over. Clips that won't embed or have no length are
// left out. A loop under 20 minutes, or a film with no rabbit hole, gets the
// other films' holes after its own.

import { films, type Film } from "./films";
import { NIGHTS } from "./nights";
import { seedVideos } from "./videos";
import { COPY as WATCH_COPY, lengthSeconds, watchFor } from "./watch";

export type Slot = {
  id: string; // YouTube video ID
  title: string;
  credit?: string; // "From: Arrow Video · 2020"
  start: number; // seconds into the video to start at (a clip's good bit)
  seconds: number; // how long it's on for
};

// One film's channel, built ahead of time for every film so a page left open
// carries on into the next week
export type Week = { slug: string; title: string; date: string; when: string; shorts: boolean; slots: Slot[] };

// DRAFT: all of it
export const COPY = {
  name: "Basement TV",
  tuning: "Tuning in…",
  soundOn: "Sound on",
  next: "Next on Basement TV",
  about: "Always on. Whoever's tuned in is watching the same thing.",
};

// The schedule's zero. Moving it moves everyone's channel together.
export const EPOCH = Date.UTC(2026, 0, 1);
const SHORTEST_LOOP = 20 * 60;

// "From: Arrow Video · 2020", as under a clip on a film page; just the year
// if there's no one to credit
const from = (by?: string, year?: string) => {
  const line = [by, year].filter(Boolean).join(" · ");
  return by ? `${WATCH_COPY.from} ${line}` : line || undefined;
};

// That night's shorts, which already have their seconds
const shortSlots = (slug: string): Slot[] =>
  (NIGHTS[slug]?.shorts?.items ?? []).map((s) => {
    const v = seedVideos.find((w) => w.id === s.id);
    return { id: s.id, title: s.title, credit: from(v?.maker ?? v?.channel, v?.year), start: 0, seconds: s.seconds };
  });

// The rabbit hole's clips in order, each from its good bit if it has one
const holeSlots = (slug: string): Slot[] =>
  (watchFor(slug)?.clips ?? []).flatMap((c) => {
      const start = c.start ?? 0;
      const seconds = (lengthSeconds(c.length) ?? 0) - start;
      if (c.embed === false || seconds <= 0) return [];
      return [{ id: c.id, title: c.title, credit: from(c.by, c.year), start, seconds }];
    });

const loopSeconds = (slots: Slot[]) => slots.reduce((sum, s) => sum + s.seconds, 0);

export function slotsFor(film: Film): Slot[] {
  const own = [...shortSlots(film.slug), ...holeSlots(film.slug)];
  const topUp = loopSeconds(own) < SHORTEST_LOOP || !watchFor(film.slug)?.clips.length;
  const all = topUp ? [...own, ...films.filter((f) => f.slug !== film.slug).flatMap((f) => holeSlots(f.slug))] : own;
  // Once each, if a video turns up twice
  return all.filter((s, i) => all.findIndex((t) => t.id === s.id) === i);
}

/** The next film on from a London date (YYYY-MM-DD), that day's included, or the last once the season is over. */
export const thisWeek = <T extends { date: string }>(weeks: T[], isoDate: string): T =>
  weeks.find((w) => w.date >= isoDate) ?? weeks[weeks.length - 1];

/** What's on at a moment: which slot, how far into it, and when it ends. Null for an empty loop. */
export function nowPlaying(slots: Slot[], nowMs: number) {
  const loop = loopSeconds(slots);
  if (!loop) return null;
  const elapsed = Math.floor((nowMs - EPOCH) / 1000);
  let t = ((elapsed % loop) + loop) % loop;
  for (let index = 0; index < slots.length; index++) {
    const { seconds } = slots[index];
    if (t < seconds) return { index, offset: t, endsAtMs: EPOCH + (elapsed - t + seconds) * 1000 };
    t -= seconds;
  }
  return null;
}

/** The next n slots after the one on now, with when each starts. */
export function upNext(slots: Slot[], nowMs: number, n: number) {
  const on = nowPlaying(slots, nowMs);
  if (!on) return [];
  let atMs = on.endsAtMs;
  return Array.from({ length: n }, (_, k) => {
    const slot = slots[(on.index + 1 + k) % slots.length];
    const next = { slot, atMs };
    atMs += slot.seconds * 1000;
    return next;
  });
}
