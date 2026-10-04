import type { CSSProperties } from "react";
import { films, isPast } from "@/lib/films";
import { INTRO_SCRIPT, scene, TV_TALL, TV_WIDE } from "@/lib/intro";

// The TV intro's markup (lib/intro.ts), first thing in <body>. Hidden unless
// its script, straight after it, decides to play. The pictures are CSS
// backgrounds rather than <img>s so nobody downloads them unless it plays.

const SCREEN_STILLS = 4;

export default function Intro() {
  // What's coming up first, topped up from the rest of the programme
  const withStill = films.filter((f) => scene.stills.includes(f.slug));
  const upcoming = withStill.filter((f) => !isPast(f.date));
  const shown = [...upcoming, ...withStill.filter((f) => isPast(f.date))].slice(0, SCREEN_STILLS);

  const [wl, wt, ww, wh] = scene.tv.wide.screen;
  const [tl, tt, tw, th] = scene.tv.tall.screen;
  // Each picture's shape and where its screen is, for app/intro.css
  const r = (n: number) => Math.round(n * 100) / 100;
  const vars = {
    "--wide-k": r(scene.tv.wide.width / scene.tv.wide.height),
    "--tall-k": r(scene.tv.tall.width / scene.tv.tall.height),
    "--wide-screen": `${wt}% ${r(100 - wl - ww)}% ${r(100 - wt - wh)}% ${wl}%`,
    "--tall-screen": `${tt}% ${r(100 - tl - tw)}% ${r(100 - tt - th)}% ${tl}%`,
    "--wide-middle": `${r(wl + ww / 2)}% ${r(wt + wh / 2)}%`,
    "--tall-middle": `${r(tl + tw / 2)}% ${r(tt + th / 2)}%`,
  } as CSSProperties;

  return (
    <>
      <div
        id="tv-intro"
        className="tv-intro"
        aria-hidden
        style={vars}
        data-wide={TV_WIDE}
        data-tall={TV_TALL}
      >
        <div className="tv-intro-scene">
          <div className="tv-intro-screen">
            {shown.map((f, i) => (
              <i
                key={f.slug}
                className="tv-intro-still"
                data-i={i}
                style={{ backgroundImage: `url(/intro/stills/${f.slug}.png)` }}
              />
            ))}
            <i className="tv-intro-snow" />
          </div>
          <div className="tv-intro-set" />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
    </>
  );
}
