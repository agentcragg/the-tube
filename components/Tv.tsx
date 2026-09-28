"use client";

// Basement TV (/tv): the player, what's on and what's next. It works out
// from the clock where the channel has got to (lib/tv.ts), loads that clip
// at that second and sets a timer for when it ends, or for midnight if this
// week's film changes over first. There's no YouTube iframe API: the embed's
// own URL parameters and a timer are enough, and one message for the sound.
//
// Browsers block autoplay with sound, so it starts muted unless the visitor
// is on a computer and has already clicked something on the site (arriving
// by a link on it usually counts). Phones never let a new embed start with
// sound, so there every clip starts muted. Sound on unmutes the clip where
// it is, with a message to the embed; the click is what lets it. On a
// computer the clips after it load with sound; a phone needs it for each.

import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { TvIcon } from "@/components/Icons";
import { londonParts } from "@/lib/clock";
import { COPY, nowPlaying, thisWeek, upNext, type Week } from "@/lib/tv";
import { thumb } from "@/lib/videos";
import { COPY as WATCH_COPY } from "@/lib/rabbit-hole";

const EMBED = "https://www.youtube-nocookie.com";

// "21:14", London time
function londonTime(ms: number) {
  const { hour, minute } = londonParts(new Date(ms));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// The next London midnight, when this week's film can change over. London
// is on GMT or an hour ahead of it.
function nextMidnight(ms: number) {
  const utc = Date.parse(londonParts(new Date(ms)).isoDate + "T00:00:00Z") + 86_400_000;
  const bst = utc - 3_600_000;
  return londonParts(new Date(bst)).hour === 0 ? bst : utc;
}

// The next n clips. If the film changes over at midnight before they've all
// been on, the list goes over to the new film's channel there, starting
// with whatever it's part-way through.
function comingUp(weeks: Week[], week: Week, nowMs: number, n: number) {
  const list = upNext(week.slots, nowMs, n);
  const midnight = nextMidnight(nowMs);
  const after = thisWeek(weeks, londonParts(new Date(midnight)).isoDate);
  const on = after === week ? null : nowPlaying(after.slots, midnight);
  if (!on) return list;
  const then = [{ slot: after.slots[on.index], atMs: midnight }, ...upNext(after.slots, midnight, n)];
  return [...list.filter((c) => c.atMs < midnight), ...then].slice(0, n);
}

// Tuned once, when it mounts. A new clip is a new key, so a later tick of
// the clock never reloads the one that's playing.
function Screen({ src, title, ref }: { src: string; title: string; ref: Ref<HTMLIFrameElement> }) {
  const [tuned] = useState(src);
  return <iframe ref={ref} src={tuned} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" />;
}

export default function Tv({ weeks }: { weeks: Week[] }) {
  // null until the browser knows the time: the screen says "Tuning in…"
  const [now, setNow] = useState<number | null>(null);
  const [touch, setTouch] = useState(false);
  const [sound, setSound] = useState(false); // new clips load with sound
  const [unmuted, setUnmuted] = useState<string | null>(null); // the clip Sound on unmuted
  const [tune, setTune] = useState(0); // one more to tune in again at the current second
  const frame = useRef<HTMLIFrameElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const held = useRef(false); // the clip on screen was tuned in while the tab was hidden

  useEffect(() => {
    const isTouch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the time, the device and the visitor's clicks are only known in the browser
    setNow(Date.now());
    setTouch(isTouch);
    setSound(!isTouch && (navigator.userActivation?.hasBeenActive ?? false));
    // Back to the tab. Browsers hold a clip tuned in while the tab was
    // hidden, and phones pause one when it's put away, so either way it
    // tunes in again at the current second. One that kept playing stays.
    const onShow = () => {
      if (document.visibilityState !== "visible") return;
      if (isTouch || held.current) setTune((t) => t + 1);
      setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, []);

  const today = now === null ? null : londonParts(new Date(now)).isoDate;
  const week = today === null ? null : thisWeek(weeks, today);
  const on = week && now !== null ? nowPlaying(week.slots, now) : null;
  const slot = on && week?.slots[on.index];
  const next = week && now !== null ? comingUp(weeks, week, now, 6) : [];
  const key = on && slot ? `${slot.id}-${on.endsAtMs}-${tune}` : null;
  const loud = sound || (key !== null && unmuted === key);

  useEffect(() => {
    held.current = document.hidden;
  }, [key]);

  // Over to the next clip when this one ends, or to next week's film at
  // midnight if that comes first
  const wake = on && now !== null ? Math.min(on.endsAtMs, nextMidnight(now)) : null;
  useEffect(() => {
    if (!wake) return;
    const timer = setTimeout(() => setNow(Date.now()), wake - Date.now() + 250);
    return () => clearTimeout(timer);
  }, [wake]);

  const soundOn = () => {
    // The embed takes these as messages since its URL has enablejsapi=1
    for (const func of ["unMute", "playVideo"]) {
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), EMBED);
    }
    setUnmuted(key);
    if (!touch) setSound(true);
    // The button goes, so keyboard focus waits on the heading beside it
    heading.current?.focus();
  };

  // Once the last night has been, it stays on that film's hole
  const seasonOver = week && today !== null && week.date < today;

  return (
    <div className="watch tv">
      <article>
        <div className="still-frame">
          <div className="tv-screen">
            {on && slot && key ? (
              <Screen
                key={key}
                ref={frame}
                src={`${EMBED}/embed/${slot.id}?autoplay=1&mute=${sound ? 0 : 1}&start=${slot.start + on.offset}&playsinline=1&rel=0&enablejsapi=1`}
                title={slot.title}
              />
            ) : (
              <p>{COPY.tuning}</p>
            )}
          </div>
        </div>

        <div className="tv-top">
          <h1 ref={heading} tabIndex={-1}>
            {COPY.name}
          </h1>
          {on && !loud && (
            <button type="button" className="action tv-sound" onClick={soundOn}>
              {COPY.soundOn}
            </button>
          )}
        </div>

        {slot && week && (
          <>
            <p className="tv-title">
              <span>{WATCH_COPY.nowPlaying}</span> {slot.title}
            </p>
            {slot.credit && <p className="credit">{slot.credit}</p>}
            {/* DRAFT */}
            <p className="tv-week">
              The <Link href={`/films/${week.slug}`}>{week.title}</Link>{" "}
              {week.shorts ? "night's shorts, then its rabbit hole" : "rabbit hole"},{" "}
              {seasonOver ? "left on since the last night." : `on until ${week.when}.`}
            </p>
          </>
        )}
      </article>

      <aside className="side">
        <section className="box">
          <div className="box-head">
            <h2>
              <TvIcon /> {COPY.next}
            </h2>
          </div>
          <div className="box-body">
            <ul className="mini-list tv-next">
              {next.map(({ slot: s, atMs }) => (
                <li key={atMs}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(s.id, "mq")} alt="" loading="lazy" />
                  <span>
                    <strong>{s.title}</strong>
                    <em>{londonTime(atMs)}</em>
                  </span>
                </li>
              ))}
            </ul>
            <p className="tv-about">{COPY.about}</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
