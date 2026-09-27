// What happens on each night, keyed by film slug. Used by the running order
// (components/fun/running) and the laurels on the wall (components/fun/laurels).
// Times are London time. Everything here is placeholder until Matt confirms it.

export type Short = {
  id: string; // YouTube video ID
  title: string;
  seconds: number; // length, from YouTube
  uploaded?: string; // e.g. "Mar 2007"
  quality?: string; // e.g. "240p"
};

export type Night = {
  doors: string; // "19:30"
  shorts?: { start: string; items: Short[] }; // the pre-show
  feature: string; // start time of the feature, "20:25"
  extra?: { start: string; label: string }; // e.g. a Q&A
  presentedBy?: string; // who picked the shorts, for the week-after Spotlight
  note?: string; // one line about the shorts
};

export const NIGHTS: Record<string, Night> = {};
