"use client";

// Basement TV (/tv): the player, the video's comments and what's next. It
// works out from the clock where the channel has got to (lib/tv.ts), loads
// that video at that second, and sets a timer for when the next comment is
// posted or the video ends, whichever comes first. There's no YouTube iframe
// API: the embed's own URL parameters and a timer are enough, and one message
// for the sound.
//
// Browsers block autoplay with sound, so it starts muted unless the visitor
// is on a computer and has already clicked something on the site (arriving
// by a link on it usually counts). Phones never let a new embed start with
// sound, so there every video starts muted. Sound on unmutes the video where
// it is, with a message to the embed; the click is what lets it. On a
// computer the videos after it load with sound; a phone needs it for each.

import { useEffect, useRef, useState, type Ref } from "react";
import { TvIcon } from "@/components/Icons";
import Comments, { type Posted } from "@/components/tv/Comments";
import { londonParts } from "@/lib/clock";
import { COPY as WATCH_COPY } from "@/lib/rabbit-hole";
import { COPY, nowPlaying, postTimes, upNext, type Video } from "@/lib/tv";
import { thumb } from "@/lib/videos";

const EMBED = "https://www.youtube-nocookie.com";

// A comment counts as just posted, and slides in, for this long after its time
const FRESH_MS = 2000;

// "21:14", London time
function londonTime(ms: number) {
  const { hour, minute } = londonParts(new Date(ms));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// "4:30", "1:02:05": a video's length, as on its thumbnail
function length(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// Tuned once, when it mounts. A new video is a new key, so a later tick of
// the clock never reloads the one that's playing.
function Screen({ src, title, ref }: { src: string; title: string; ref: Ref<HTMLIFrameElement> }) {
  const [tuned] = useState(src);
  return <iframe ref={ref} src={tuned} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" />;
}

export default function Tv({ channel }: { channel: Video[] }) {
  // null until the browser knows the time: the screen says "Tuning in…"
  const [now, setNow] = useState<number | null>(null);
  const [touch, setTouch] = useState(false);
  const [sound, setSound] = useState(false); // new videos load with sound
  const [unmuted, setUnmuted] = useState<string | null>(null); // the video Sound on unmuted
  const [tune, setTune] = useState(0); // one more to tune in again at the current second
  const frame = useRef<HTMLIFrameElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const held = useRef(false); // the video on screen was tuned in while the tab was hidden

  useEffect(() => {
    const isTouch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the time, the device and the visitor's clicks are only known in the browser
    setNow(Date.now());
    setTouch(isTouch);
    setSound(!isTouch && (navigator.userActivation?.hasBeenActive ?? false));
    // Back to the tab. Browsers hold a video tuned in while the tab was
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

  const on = now === null ? null : nowPlaying(channel, now);
  const video = on ? channel[on.index] : null;
  const next = now === null ? [] : upNext(channel, now, 6);
  const key = on && video ? `${video.id}-${on.endsAtMs}-${tune}` : null;
  const loud = sound || (key !== null && unmuted === key);

  // The comments posted so far, and when the next one is due
  const times = video ? postTimes(video, video.comments.length) : [];
  const intoMs = on && now !== null ? now - on.startsAtMs : 0;
  const posted: Posted[] = video
    ? times.flatMap((t, n) => (t <= intoMs ? [{ n, comment: video.comments[n], fresh: intoMs - t < FRESH_MS }] : []))
    : [];
  const due = times.find((t) => t > intoMs);

  useEffect(() => {
    held.current = document.hidden;
  }, [key]);

  // Look again when the next comment is due or this video ends. After every
  // look it sets the next one, so a timer that fires a little early just
  // looks again.
  const wake = on ? Math.min(on.endsAtMs, due === undefined ? Infinity : on.startsAtMs + due) : null;
  useEffect(() => {
    if (wake === null || now === null) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, wake - Date.now()) + 100);
    return () => clearTimeout(timer);
  }, [wake, now]);

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

  return (
    <div className="tv">
      <article className="tv-main">
        <div className="still-frame">
          <div className="tv-screen">
            {on && video && key ? (
              <Screen
                key={key}
                ref={frame}
                src={`${EMBED}/embed/${video.id}?autoplay=1&mute=${sound ? 0 : 1}&start=${on.offset}&playsinline=1&rel=0&enablejsapi=1`}
                title={video.title}
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

        {video && (
          <>
            <p className="tv-title">
              <span>{WATCH_COPY.nowPlaying}</span> {video.title}
            </p>
            {video.credit && (
              <p className="credit">
                {WATCH_COPY.from} {video.credit}
              </p>
            )}
          </>
        )}
      </article>

      <Comments key={on && video ? `${video.id}-${on.startsAtMs}` : "tuning"} posted={posted} total={video ? video.comments.length : null} />

      <section className="box tv-next">
        <div className="box-head">
          <h2>
            <TvIcon /> {COPY.next}
          </h2>
        </div>
        <div className="box-body">
          {/* Nothing to click: it's what's coming, not a menu */}
          <ol className="tv-next-list">
            {next.map(({ video: v, atMs }) => (
              <li key={atMs}>
                <span className="tv-next-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(v.id, "mq")} alt="" loading="lazy" />
                  <i aria-hidden="true">{length(v.seconds)}</i>
                </span>
                <span>
                  <em>{londonTime(atMs)}</em>
                  <strong>{v.title}</strong>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
