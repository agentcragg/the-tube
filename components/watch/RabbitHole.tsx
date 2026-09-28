"use client";

// The Rabbit hole on a film page: shelves of clips under the programme notes,
// like a 2008 channel page. A plain click plays a clip in a player above its
// shelf, through youtube-nocookie. Nothing loads until someone clicks, and
// only one clip plays at a time. Cmd-click, middle-click and no JS still go to
// YouTube. While a clip plays the address ends #v-{id}, so a link to it can
// be passed on; opening one finds the clip and plays it there. After the
// clips, From the archive shows the film's old websites (ArchiveCard), and
// Elsewhere lists the other links. Data: lib/watch.ts.

import { useCallback, useEffect, useRef, useState } from "react";
import { COPY, watchUrl, type Clip, type Link, type Section } from "@/lib/rabbit-hole";
import { markWatched } from "@/lib/watched";
import ArchiveCard from "./ArchiveCard";
import ClipCard from "./ClipCard";

type Playing = { shelf: number; clip: Clip; autoplay: boolean };

// DRAFT: the shelf of the films' old websites, after the clips
const FROM_THE_ARCHIVE = "From the archive";

// Links with a screenshot go on that shelf; the rest stay in Elsewhere
const hasShot = (l: Link): l is Link & { shot: string } => !!l.shot;

const V_HASH = /^#v-([\w-]{11})$/;

// The address without the #v-{id}
const clearHash = () => history.replaceState(null, "", location.pathname + location.search);

const motion = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

export default function RabbitHole({
  sections,
  links,
  depth,
}: {
  sections: Section[];
  links?: Link[];
  depth: string; // "15 videos · 2h 51m deep"
}) {
  const [playing, setPlaying] = useState<Playing | null>(null);
  const player = useRef<HTMLDivElement>(null);
  const archive = links?.filter(hasShot) ?? [];
  const elsewhere = links?.filter((l) => !l.shot) ?? [];
  const opener = useRef<HTMLAnchorElement | null>(null); // the card that was clicked, for focus on close

  const close = useCallback(() => {
    // Focus goes back to the card that was clicked, or to the clip's own card
    // when it came from an address
    const card =
      opener.current ??
      (playing && document.querySelector<HTMLElement>(`#rh-${playing.shelf + 1} .rh-card[href*="${playing.clip.id}"]`));
    setPlaying(null);
    clearHash();
    card?.focus();
  }, [playing]);

  // The address decides: #v-{id} plays that clip, anything else closes the
  // player. That covers arriving from a shared link, and Back and Forward. A
  // clip from an address plays straight away only if the visitor has already
  // clicked something, so a shared link shows YouTube's own play button and
  // nothing blares.
  //
  // The Start here box's links (#v-{id} and #rh-{n}) come through here too.
  // Left to the browser, a jump to a #hash makes a history entry that Next's
  // Back button can't leave, so they're pushed with history.pushState. A
  // shelf link scrolls to the shelf and moves focus there, so Tab carries on
  // from it.
  useEffect(() => {
    const find = (id?: string) => {
      const shelf = sections.findIndex((s) => s.clips.some((c) => c.id === id && c.embed !== false));
      return shelf < 0 ? null : { shelf, clip: sections[shelf].clips.find((c) => c.id === id)! };
    };

    const fromHash = () => {
      const found = find(location.hash.match(V_HASH)?.[1]);
      opener.current = null;
      setPlaying(found && { ...found, autoplay: navigator.userActivation?.hasBeenActive ?? false });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hash = (e.target as Element).closest('a[href^="#v-"], a[href^="#rh-"]')?.getAttribute("href");
      const found = hash?.match(V_HASH) && find(hash.slice(3));
      const shelf = hash?.startsWith("#rh-") ? document.getElementById(hash.slice(1)) : null;
      if (!hash || !(found || shelf)) return;
      e.preventDefault();
      if (location.hash !== hash) history.pushState(null, "", hash);
      if (found) {
        opener.current = null;
        setPlaying({ ...found, autoplay: true });
      } else if (shelf) {
        shelf.scrollIntoView({ block: "start", behavior: motion() });
        shelf.focus({ preventScroll: true });
      }
    };

    fromHash();
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", onClick);
    };
  }, [sections]);

  // Bring the player into view once it opens. The clip counts as watched
  // however it got there: its card (ClipCard marks those too), Start here,
  // or an address.
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

  const onCard = (shelf: number, clip: Clip) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Anything but a plain left click is left to the browser: it opens YouTube
    if (clip.embed === false || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    opener.current = e.currentTarget;
    setPlaying({ shelf, clip, autoplay: true });
    history.replaceState(null, "", `#v-${clip.id}`);
  };

  return (
    <section id="rabbit-hole" className="box rh" aria-labelledby="rh-title">
      <div className="box-head">
        <h2 id="rh-title">{COPY.title}</h2>
        <span className="rh-depth">{depth}</span>
      </div>
      <div className="box-body">
        {sections.map((s, n) => (
          <section
            key={s.heading}
            className="rh-shelf"
            id={`rh-${n + 1}`}
            aria-labelledby={`rh-${n + 1}-title`}
            tabIndex={-1}
          >
            <h3 id={`rh-${n + 1}-title`}>
              {s.heading} ({s.clips.length})
            </h3>
            {playing?.shelf === n && (
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
              {s.clips.map((c) => (
                <li key={c.id}>
                  <ClipCard
                    clip={c}
                    href={watchUrl(c)}
                    lazy
                    current={playing?.clip.id === c.id}
                    onClick={onCard(n, c)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {archive.length ? (
          <section className="rh-shelf" id="rh-archive" aria-labelledby="rh-archive-title">
            <h3 id="rh-archive-title">
              {FROM_THE_ARCHIVE} ({archive.length})
            </h3>
            <ul className="rh-sites">
              {archive.map((l) => (
                <li key={l.url}>
                  <ArchiveCard link={l} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {elsewhere.length ? (
          <section className="rh-shelf" id="rh-elsewhere" aria-labelledby="rh-elsewhere-title">
            <h3 id="rh-elsewhere-title">{COPY.elsewhere}</h3>
            <ul className="links rh-links">
              {elsewhere.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                  {l.year && <span className="rh-year"> {l.year}</span>}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}
