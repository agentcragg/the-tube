"use client";

// One clip as a card: the hover-scrub thumbnail at 16:9, then the title,
// who put it up and a line on why it's here, like a 2008 channel page. Used
// by the Rabbit hole's shelves and the Start here box. A clip this browser
// has played or opened keeps its red bar full (lib/watched.ts).

import { useState } from "react";
import Scrubber from "@/components/Scrubber";
import { clipFrames, COPY, type Clip } from "@/lib/rabbit-hole";
import { markWatched, useWatched } from "@/lib/watched";

export default function ClipCard({
  clip,
  href,
  lazy,
  current,
  onClick,
}: {
  clip: Clip;
  href: string; // YouTube, or "#v-{id}" to play it in the shelves
  lazy?: boolean;
  current?: boolean; // it's the one playing
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  // Frames 2–4 only show on a hover or a swipe, so they wait for the first
  // pointer on the card. Till then the still stands in for them: one download
  // a card, and the scrub bar and the swipe are there as before.
  const [warm, setWarm] = useState(false);
  const watched = useWatched().has(clip.id);
  const frames = clipFrames(clip);
  const from = [clip.by, clip.year].filter(Boolean).join(" · ");
  const away = !href.startsWith("#"); // opens YouTube
  return (
    <a
      className="rh-card"
      href={href}
      target={away ? "_blank" : undefined}
      rel={away ? "noreferrer" : undefined}
      aria-current={current ? "true" : undefined}
      // Every way in counts: a plain click plays it here, and a modified
      // click or a middle click opens it in a new tab
      onClick={(e) => {
        markWatched(clip.id);
        onClick?.(e);
      }}
      onAuxClick={(e) => {
        if (e.button === 1) markWatched(clip.id);
      }}
      onPointerEnter={warm ? undefined : () => setWarm(true)}
    >
      <div className="rh-thumb">
        {/* 4:3 frames cropped to 16:9, which takes a widescreen video's black bars off */}
        <Scrubber
          frames={warm ? frames : frames.map(() => frames[0])}
          seed={clip.id}
          alt=""
          duration={clip.length}
          lazy={lazy}
          watched={watched}
        />
      </div>
      <strong>{clip.title}</strong>
      {from && (
        <em>
          {clip.by ? `${COPY.from} ${from}` : from}
          {clip.embed === false && (
            <span className="rh-out" title={COPY.playsOnYouTube} aria-hidden>
              {" "}↗
            </span>
          )}
        </em>
      )}
      {clip.note && (
        <span className="rh-note" title={clip.note}>
          {clip.note}
        </span>
      )}
    </a>
  );
}
