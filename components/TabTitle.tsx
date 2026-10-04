"use client";

import { useEffect } from "react";
import { usePicked, useScene } from "@/components/endeavour/use-scene";
import { londonParts, useLondonNow } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { NIGHTS } from "@/lib/nights";
import { useLook } from "@/lib/use-look";

// The browser tab on a screening night (look switch idea "tabtitle"): from
// the chairs coming out until the film ends the tab's title scrolls like a
// 2000s marquee, and while the film is on the icon is a little TV with a
// red bar along it, as far through the film as the room is. Normal the rest
// of the week.
//
// Next.js owns the page's <title> and icon <link>, so this never edits them:
// it puts its own <title> first in <head> (the browser shows the first) and
// its own icon last, and sets Next's icons aside until it's done.

const SEP = " · "; // non-breaking, so the browser doesn't trim the gap when it comes round to the front
const STEP_MS = 350;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// How far through the film the room is, 0 to 1
function progress(film: Film, now: Date, picked: boolean) {
  if (picked) return 0.4; // from the time switch: there's no real time to go by
  const night = NIGHTS[film.slug];
  const start = toMinutes(night?.feature ?? "20:00");
  const length = film.runtime ? film.runtime / 60 : 120;
  const { hour, minute } = londonParts(now);
  return Math.min(1, Math.max(0, (hour * 60 + minute - start) / length));
}

// A TV in the site's 2008 icon style, playing, with the film's progress in red
function tvIcon(done: number) {
  const bar = Math.max(1, Math.round(16 * done));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M10 2.5l6 5 6-5" stroke="#6b7c93" stroke-width="2" fill="none"/>
<rect x="2" y="8" width="28" height="22" rx="4" fill="#8a8f99" stroke="#4d525c" stroke-width="2"/>
<rect x="5" y="11" width="18" height="16" rx="2" fill="#1a1a1a" stroke="#4d525c" stroke-width="1.5"/>
<path d="M11 14.5l7 4-7 4z" fill="#fff"/>
<rect x="6" y="24" width="16" height="2" fill="#555"/>
<rect x="6" y="24" width="${bar}" height="2" fill="#e00"/>
<circle cx="26.5" cy="15" r="1.6" fill="#333"/><circle cx="26.5" cy="21" r="1.6" fill="#333"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function TabTitle({ films }: { films: Film[] }) {
  const on = useLook("tabtitle");
  const scene = useScene(films);
  const picked = usePicked();
  const now = useLondonNow();

  const film = scene?.tonight;
  const state = scene?.state;
  const marquee =
    film && (state === "setup" || state === "queue" || state === "screening")
      ? state === "screening"
        ? `▶\u00a0${film.title}${SEP}The Tube${SEP}`
        : `Tonight${SEP}${film.title}${SEP}The Tube${SEP}`
      : null;
  const icon = film && state === "screening" && now ? tvIcon(progress(film, now, !!picked)) : null;

  // The title, going round
  useEffect(() => {
    if (!on || !marquee) return;
    const title = document.createElement("title");
    let shift = 0;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      title.textContent = marquee.slice(shift) + marquee.slice(0, shift);
      if (!still) shift = (shift + 1) % marquee.length;
      // A page change puts Next's title back in front
      if (document.head.querySelector("title") !== title) document.head.prepend(title);
    };
    tick();
    const timer = setInterval(tick, STEP_MS);
    return () => {
      clearInterval(timer);
      title.remove();
    };
  }, [on, marquee]);

  // The icon
  useEffect(() => {
    if (!on || !icon) return;
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = icon;
    const aside: HTMLLinkElement[] = [];
    const keep = () => {
      document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((l) => {
        if (l === link) return;
        l.rel = "tube-icon-aside";
        aside.push(l);
      });
      if (document.head.lastElementChild !== link) document.head.append(link);
    };
    keep();
    const timer = setInterval(keep, 1000);
    return () => {
      clearInterval(timer);
      link.remove();
      aside.forEach((l) => (l.rel = "icon"));
    };
  }, [on, icon]);

  return null;
}
