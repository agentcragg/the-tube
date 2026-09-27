"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PREVIEW_CARD, TRAILER_COPY, type Trailer } from "@/lib/fun/trailer";
import { closeTrailer, prefersReducedMotion } from "./store";
import { clock, loadYouTubeApi, STATE, type YTPlayer } from "./youtube";

// The trailer, playing where the still was. It opens on the house preview
// card in the film's colour, then plays. With a mouse it gets a slim 2007-style
// control bar under the frame; on touch screens YouTube's own controls are used.

type Mode = "loading" | "api" | "plain" | "error";
type Card = "on" | "fading" | "off";

const CARD_HOLD = 2000; // the card stays this long once the trailer is playing
const AUTOPLAY_GRACE = 1500; // not playing this long after it's ready: autoplay was blocked (iOS)
const CARD_MAX = 8000; // and never longer than this, however slow the connection
const PLAIN_HOLD = 2500; // fallback embed, where playback can't be seen

const watchUrl = (id: string, t = 0) =>
  `https://www.youtube.com/watch?v=${id}${t >= 1 ? `&t=${Math.floor(t)}s` : ""}`;

export default function TrailerPlayer({ slug, trailer }: { slug: string; trailer: Trailer }) {
  const frame = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const dragging = useRef(false);

  // Mounted only after a click, so the browser is always there
  const [custom] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  const [canFullScreen] = useState(() => document.fullscreenEnabled === true);
  const [mode, setMode] = useState<Mode>("loading");
  const [state, setState] = useState<number>(STATE.UNSTARTED);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(trailer.seconds);
  const [card, setCard] = useState<Card>("on");

  const hideCard = useCallback(
    () => setCard((c) => (c !== "on" ? c : prefersReducedMotion() ? "off" : "fading")),
    [],
  );

  // Create the YouTube player in the still's frame
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let cancelled = false;
    let yt: YTPlayer | null = null;
    let grace: number | undefined;
    let hold: number | undefined;
    const cap = window.setTimeout(hideCard, CARD_MAX);

    loadYouTubeApi().then(
      (api) => {
        if (cancelled) return;
        // YouTube swaps this element for its iframe, so React never owns it
        const el = document.createElement("div");
        host.appendChild(el);
        yt = new api.Player(el, {
          videoId: trailer.id,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, iv_load_policy: 3, controls: custom ? 0 : 1 },
          events: {
            onReady: ({ target }) => {
              if (cancelled) return;
              player.current = target;
              setMode("api");
              setDuration((d) => target.getDuration() || d);
              grace = window.setTimeout(() => {
                const s = target.getPlayerState();
                if (s !== STATE.PLAYING && s !== STATE.BUFFERING) hideCard();
              }, AUTOPLAY_GRACE);
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              setState(data);
              if (data === STATE.PLAYING && hold === undefined) hold = window.setTimeout(hideCard, CARD_HOLD);
              // Back to the still when it's over
              if (data === STATE.ENDED) closeTrailer(slug);
            },
            onError: () => {
              if (cancelled) return;
              setMode("error");
              setCard("off");
            },
          },
        });
      },
      () => {
        if (cancelled) return;
        setMode("plain");
        hold = window.setTimeout(hideCard, PLAIN_HOLD);
      },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
      window.clearTimeout(grace);
      window.clearTimeout(hold);
      try {
        yt?.destroy();
      } catch {}
      player.current = null;
      host.replaceChildren();
    };
  }, [trailer.id, slug, custom, hideCard]);

  // The fade, then gone
  useEffect(() => {
    if (card !== "fading") return;
    const t = window.setTimeout(() => setCard("off"), 400);
    return () => window.clearTimeout(t);
  }, [card]);

  // Keep the bar's clock and progress up to date
  useEffect(() => {
    if (mode !== "api" || !custom) return;
    const tick = window.setInterval(() => {
      const p = player.current;
      if (!p) return;
      if (!dragging.current) setTime(p.getCurrentTime() || 0);
      const d = p.getDuration();
      if (d) setDuration(d);
    }, 250);
    return () => window.clearInterval(tick);
  }, [mode, custom]);

  // Switching the idea off in the Fun lab hides the frame; stop the sound too
  useEffect(() => {
    const html = document.documentElement;
    const watch = new MutationObserver(() => {
      if (!html.classList.contains("x-trailer")) closeTrailer(slug);
    });
    watch.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => watch.disconnect();
  }, [slug]);

  const playing = state === STATE.PLAYING || state === STATE.BUFFERING;
  const ready = mode === "api";

  const playPause = () => {
    const p = player.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const seek = (to: number, final: boolean) => {
    setTime(to);
    player.current?.seekTo(to, final);
  };

  const fullScreen = () => {
    const el = frame.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  };

  const close = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    closeTrailer(slug);
    document.querySelector<HTMLButtonElement>(".trailer-button")?.focus();
  };

  const shown = Math.min(time, duration);

  return (
    <div className="trailer" ref={frame}>
      <div className="trailer-screen">
        <div className="trailer-mount" ref={mount} />

        {mode === "plain" && (
          <iframe
            className="trailer-plain"
            src={`https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&playsinline=1&rel=0`}
            title="Trailer"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}

        {mode === "error" && (
          <p className="trailer-blocked">
            {TRAILER_COPY.blocked}{" "}
            <a href={watchUrl(trailer.id)} target="_blank" rel="noreferrer">
              {TRAILER_COPY.onYouTube} »
            </a>
          </p>
        )}

        {card !== "off" && (
          <button
            type="button"
            className={`preview-card${card === "fading" ? " is-fading" : ""}`}
            onClick={hideCard}
            title="Skip"
          >
            <span className="preview-approved">{PREVIEW_CARD}</span>
            {trailer.advice && <span className="preview-advice">{trailer.advice}</span>}
          </button>
        )}
      </div>

      {custom && mode !== "plain" && (
        <div className="ytbar">
          <button
            type="button"
            className="ytbar-btn"
            onClick={playPause}
            disabled={!ready}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <input
            type="range"
            className="ytbar-seek"
            min={0}
            max={duration || 1}
            step="any"
            value={shown}
            disabled={!ready}
            aria-label="Seek"
            aria-valuetext={`${clock(shown)} of ${clock(duration)}`}
            style={{ "--p": duration ? shown / duration : 0 } as React.CSSProperties}
            onPointerDown={(e) => {
              // While dragging, seek only within what's loaded; land properly on release,
              // wherever the pointer ends up
              dragging.current = true;
              const input = e.currentTarget;
              const end = () => {
                window.removeEventListener("pointerup", end);
                window.removeEventListener("pointercancel", end);
                dragging.current = false;
                seek(Number(input.value), true);
              };
              window.addEventListener("pointerup", end);
              window.addEventListener("pointercancel", end);
            }}
            onChange={(e) => seek(Number(e.currentTarget.value), !dragging.current)}
          />

          <span className="ytbar-lcd">
            {clock(shown)} / <span className="ytbar-dur">{clock(duration)}</span>
          </span>

          <a
            className="ytbar-yt"
            href={watchUrl(trailer.id, time)}
            target="_blank"
            rel="noreferrer"
            onClick={() => player.current?.pauseVideo()}
          >
            {TRAILER_COPY.onYouTube} »
          </a>

          {canFullScreen && (
            <button type="button" className="ytbar-btn" onClick={fullScreen} aria-label="Full screen">
              <FullIcon />
            </button>
          )}
          <button type="button" className="ytbar-btn" onClick={close} aria-label={TRAILER_COPY.close}>
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}

const icon = { width: 10, height: 10, viewBox: "0 0 10 10", "aria-hidden": true } as const;

const PlayIcon = () => (
  <svg {...icon}>
    <path d="M2 1l7 4-7 4z" />
  </svg>
);

const PauseIcon = () => (
  <svg {...icon}>
    <path d="M1.5 1h2.5v8H1.5zM6 1h2.5v8H6z" />
  </svg>
);

const FullIcon = () => (
  <svg {...icon}>
    <path d="M1 1h3.2v1.3H2.3v1.9H1zM5.8 1H9v3.2H7.7V2.3H5.8zM1 5.8h1.3v1.9h1.9V9H1zM7.7 5.8H9V9H5.8V7.7h1.9z" />
  </svg>
);

const CloseIcon = () => (
  <svg {...icon}>
    <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
