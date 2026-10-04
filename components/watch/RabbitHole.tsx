"use client";

// The Rabbit hole on a film page: one big grid of clips under the programme
// notes, then the film's old websites (ArchiveCard). A plain click plays a
// clip in a player at the top of the box, through youtube-nocookie. Nothing
// loads until someone clicks, and only one clip plays at a time. Cmd-click,
// middle-click and no JS still go to YouTube. While a clip plays the address
// ends #v-{id}, so a link to it can be passed on; opening one finds the clip
// and plays it there. Data: lib/watch.ts.

import { useCallback, useEffect, useRef, useState } from "react";
import { COPY, watchUrl, type Clip, type Link } from "@/lib/rabbit-hole";
import { markWatched } from "@/lib/watched";
import ArchiveCard from "./ArchiveCard";
import ClipCard from "./ClipCard";

type Playing = { clip: Clip; autoplay: boolean };

const V_HASH = /^#v-([\w-]{11})$/;

// The address without the #v-{id}
const clearHash = () => history.replaceState(null, "", location.pathname + location.search);

const motion = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

export default function RabbitHole({ clips, sites }: { clips: Clip[]; sites: Link[] }) {
  const [playing, setPlaying] = useState<Playing | null>(null);
  const player = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null); // the card that was clicked, for focus on close

  const close = useCallback(() => {
    // Focus goes back to the card that was clicked, or to the clip's own card
    // when it came from an address
    const card =
      opener.current ?? (playing && document.querySelector<HTMLElement>(`#rabbit-hole .rh-card[href*="${playing.clip.id}"]`));
    setPlaying(null);
    clearHash();
    card?.focus();
  }, [playing]);

  // The address decides: #v-{id} plays that clip, anything else closes the
  // player. That covers arriving from a shared link, and Back and Forward. A
  // clip from an address plays straight away only if the visitor has already
  // clicked something, so a shared link shows YouTube's own play button and
  // nothing blares.
  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.match(V_HASH)?.[1];
      const clip = clips.find((c) => c.id === id && c.embed !== false);
      opener.current = null;
      setPlaying(clip ? { clip, autoplay: navigator.userActivation?.hasBeenActive ?? false } : null);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [clips]);

  // Bring the player into view once it opens. The clip counts as watched
  // however it got there: its card (ClipCard marks those too) or an address.
  useEffect(() => {
    if (!playing) return;
    markWatched(playing.clip.id);
    player.current?.scrollIntoView({ block: "nearest", behavior: motion() });
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, close]);

  const onCard = (clip: Clip) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Anything but a plain left click is left to the browser: it opens YouTube
    if (clip.embed === false || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    opener.current = e.currentTarget;
    setPlaying({ clip, autoplay: true });
    history.replaceState(null, "", `#v-${clip.id}`);
  };

  return (
    <section id="rabbit-hole" className="box rh" aria-labelledby="rh-title">
      <div className="box-head">
        <h2 id="rh-title">{COPY.title}</h2>
      </div>
      <div className="box-body">
        {playing && (
          <div ref={player} id={`v-${playing.clip.id}`} className="rh-player" role="region" aria-label="Now playing">
            <div className="rh-bar">
              <span className="rh-bar-title">
                <b>{COPY.nowPlaying}</b> {playing.clip.title}
              </span>
              <a href={watchUrl(playing.clip)} target="_blank" rel="noreferrer">
                <span className="rh-wide">{COPY.onYouTube}</span>
                <span className="rh-narrow">{COPY.onYouTubeShort}</span>
              </a>
              <button type="button" onClick={close} aria-label="Close">
                ×
              </button>
            </div>
            {/* A new clip is a new iframe, which stops the old one */}
            <iframe
              key={playing.clip.id}
              src={`https://www.youtube-nocookie.com/embed/${playing.clip.id}?autoplay=${playing.autoplay ? 1 : 0}&playsinline=1&rel=0${playing.clip.start ? `&start=${playing.clip.start}` : ""}`}
              title={playing.clip.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            />
          </div>
        )}
        <ul className="rh-grid">
          {clips.map((c) => (
            <li key={c.id}>
              <ClipCard clip={c} href={watchUrl(c)} lazy current={playing?.clip.id === c.id} onClick={onCard(c)} />
            </li>
          ))}
          {sites.map((l) => (
            <li key={l.url}>
              <ArchiveCard link={l as Link & { shot: string }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
