// Basement TV (/tv): a channel that's always on, the same for everyone. It
// plays every video in lib/tv-channel.json in one shuffled order, round and
// round, from a fixed start. There's no server and no database: every
// browser works out from the clock where the channel has got to, so whoever
// tunes in at 21:14 sees the same video at the same second, and the same
// comments posted under it.
//
// lib/tv-channel.json is made by scripts/tv-comments.py (fetches the videos'
// details and YouTube comments) and scripts/tv-channel.py (keeps the picked
// comments and writes the file). No imports here, so node can run it on its
// own to check the schedule.

export type Comment = {
  author: string; // "@handle", as on YouTube
  text: string; // plain text with line breaks; never HTML
  votes: string; // likes as YouTube shows them: "0", "344", "5.5k"
  time: string; // "13 years ago", as it was when it was fetched
};

export type Video = {
  id: string; // YouTube video ID
  title: string;
  credit: string; // who made it, or the YouTube channel
  seconds: number; // how long it's on for
  comments: Comment[];
};

export const COPY = {
  name: "Basement TV",
  tuning: "Tuning in…",
  soundOn: "Sound on",
  next: "Up next",
  comments: "Comments",
  noComments: "No comments",
};

// The schedule's zero: midnight, 1 January 2026, London (GMT then). Moving
// it, or the seed, moves everyone's channel together.
export const EPOCH = Date.UTC(2026, 0, 1);
const SEED = 20260101;

// A small seeded random number generator (mulberry32), so the shuffle and
// the comments' timing come out the same in every browser
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A number from a string, to seed a video's own randomness
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The channel's running order: every video once, shuffled with a fixed seed.
 * It only depends on which videos there are, not the order they're listed
 * in. Where the same credit would come up twice running, the second is
 * swapped with a later one, so it doesn't turn into a run of one maker.
 */
export function lineUp<T extends { id: string; credit: string; seconds: number }>(videos: T[]): T[] {
  const list = videos.filter((v) => v.seconds > 0).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const rand = random(SEED);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const n = list.length;
  const clash = (i: number) => n > 2 && list[i].credit === list[(i - 1 + n) % n].credit;
  for (let i = 0; i < n; i++) {
    if (!clash(i)) continue;
    for (let k = 1; k < n; k++) {
      const j = (i + k) % n;
      [list[i], list[j]] = [list[j], list[i]];
      const ok = !clash(i) && !clash((i + 1) % n) && !clash(j) && !clash((j + 1) % n);
      if (ok) break;
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  return list;
}

const loopSeconds = (videos: { seconds: number }[]) => videos.reduce((sum, v) => sum + v.seconds, 0);

/**
 * What's on at a moment: which video, how many whole seconds into it, and
 * when it started and ends. Null for an empty channel.
 */
export function nowPlaying(videos: { seconds: number }[], nowMs: number) {
  const loop = loopSeconds(videos);
  if (!loop) return null;
  const elapsed = Math.floor((nowMs - EPOCH) / 1000);
  let t = ((elapsed % loop) + loop) % loop;
  for (let index = 0; index < videos.length; index++) {
    const { seconds } = videos[index];
    if (t < seconds) {
      const startsAtMs = EPOCH + (elapsed - t) * 1000;
      return { index, offset: t, startsAtMs, endsAtMs: startsAtMs + seconds * 1000 };
    }
    t -= seconds;
  }
  return null;
}

/** The next n videos after the one on now, with when each starts. */
export function upNext<T extends { seconds: number }>(videos: T[], nowMs: number, n: number) {
  const on = nowPlaying(videos, nowMs);
  if (!on) return [];
  let atMs = on.endsAtMs;
  return Array.from({ length: Math.min(n, videos.length) }, (_, k) => {
    const video = videos[(on.index + 1 + k) % videos.length];
    const next = { video, atMs };
    atMs += video.seconds * 1000;
    return next;
  });
}

// Comments are at least this far apart, so there's time to read each one
const MIN_GAP_MS = 4000;

/**
 * When each of a video's comments is posted, in ms from the start of the
 * video: the first a few seconds in, the last at 85% of the way through, the
 * rest spread between, each nudged a little so they don't arrive like
 * clockwork. A short video gets only as many as fit MIN_GAP_MS apart (the
 * first ones), so the list can be shorter than count. The same for everyone,
 * so someone tuning in late sees the ones already posted.
 */
export function postTimes(video: { id: string; seconds: number }, wanted: number): number[] {
  if (wanted <= 0) return [];
  const ms = video.seconds * 1000;
  const first = Math.min(3000, ms * 0.1);
  const count = Math.min(wanted, Math.max(1, Math.floor((ms * 0.85 - first) / MIN_GAP_MS) + 1));
  if (count === 1) return [Math.round(first)];
  const gap = (ms * 0.85 - first) / (count - 1);
  const rand = random(hash(video.id));
  return Array.from({ length: count }, (_, k) => {
    const nudge = k > 0 && k < count - 1 ? (rand() - 0.5) * 0.7 : 0;
    return Math.round(first + gap * (k + nudge));
  });
}
