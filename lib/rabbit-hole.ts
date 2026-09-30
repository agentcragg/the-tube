// The rabbit hole's types, wording and helpers, without the clips themselves
// (those are in lib/watch.ts). Kept apart so the film page's client
// components don't carry every film's picks into the browser.

import { thumb } from "./videos";

export type Clip = {
  id: string; // YouTube video ID
  title: string;
  by?: string; // the uploading channel, as YouTube shows it
  year?: string; // year uploaded
  length?: string; // "8:43" or "1:16:39"
  start?: number; // seconds into the clip to start the player at (the good bit)
  embed?: false; // the uploader has switched embedding off: the card opens YouTube instead
  smallFrames?: true; // YouTube never made the 480x360 frames for this one, so it scrubs the small ones
};

// A link with a `shot` (a screenshot of the Wayback copy the url opens, in
// public/archive/<slug>/) goes in the Rabbit hole after the clips; `archived`
// is the day of that copy (captured 28 Sep 2026). The rest are listed under
// Sites linking to this film. `label` is only a note for whoever edits this.
export type Link = { label: string; url: string; year?: string; shot?: string; archived?: string };

export type WatchData = {
  clips: Clip[];
  links?: Link[];
  // YouTube's hyphenated form. The house line (below) is added after these.
  honours?: string[];
  // `year` is the year the page was written
  linking?: { url: string; year: string }[];
  // Only for films that really had a lively board; each thread links to an archived copy
  boards?: { label: string; threads: { title: string; url: string; user?: string }[] };
};

// DRAFT: the last honour on every film with panels. "Screening" becomes
// "Screened" once the night is over (London time). The year is the film's.
export const HOUSE_HONOUR = {
  before: "Screening",
  after: "Screened",
  where: "Basement of Endeavour - Deptford",
};

// DRAFT: wording, after YouTube's own (Feb 2008)
export const COPY = {
  title: "Rabbit hole",
  nowPlaying: "Now playing:",
  onYouTube: "Watch on YouTube »",
  onYouTubeShort: "YouTube »", // the same link in the player's bar on a phone
  playsOnYouTube: "Plays on YouTube", // the ↗ on a clip that won't embed
  allNights: "All nights »",
  stats: "Statistics & Data",
  honours: (n: number) => `Honours for this film (${n})`,
  linking: (n: number) => `Sites linking to this film (${n})`,
  from: "From:",
};

// "1:16:39" → 4599
export const lengthSeconds = (l?: string) =>
  l ? l.split(":").reduce((sum, n) => sum * 60 + Number(n), 0) : undefined;

// YouTube's own link, at the good bit if there is one
export const watchUrl = (c: Clip) =>
  `https://www.youtube.com/watch?v=${c.id}${c.start ? `&t=${c.start}s` : ""}`;

// YouTube's own frames: the still, then its three auto thumbnails
export const clipFrames = (c: Clip) =>
  c.smallFrames
    ? [thumb(c.id, "hq"), thumb(c.id, 1), thumb(c.id, 2), thumb(c.id, 3)]
    : [thumb(c.id, "hq"), thumb(c.id, "hq1"), thumb(c.id, "hq2"), thumb(c.id, "hq3")];
