"use client";

// Endeavour, drawn: the cutaway strip at the top of the fat footer. It
// follows London time. On a screening night the basement screen glows in
// that night's film colour, and the poster in the window shows the next
// film's. There's no seat data, on purpose: it's something to look at, not
// a meter.
//
// Time switch: visit any page with ?time to get a small menu on the drawing
// for flicking through the times of day (remembered in that browser);
// ?time=off hides it again. Everyone else just sees the real time.

import { useEffect, useState, type CSSProperties } from "react";
import { useLondonNow } from "@/lib/clock";
import type { Film } from "@/lib/films";
import { seedVideos } from "@/lib/videos";
import Scene from "./Scene";
import { sceneAs, sceneAt, STATES, type State } from "./state";

const WALL_IDS = seedVideos.map((v) => v.id);
const SWITCH_KEY = "tube-time-switch";

export function EndeavourStrip({ films }: { films: Film[] }): React.ReactNode {
  // null while rendering on the server: the drawing's shell shows, in neutral
  // greys, and the right state fades in once the browser knows the time
  const now = useLondonNow();
  const [showSwitch, setShowSwitch] = useState(false);
  const [picked, setPicked] = useState<State | "">("");

  useEffect(() => {
    let on = false;
    try {
      const param = new URLSearchParams(window.location.search).get("time");
      if (param === "off") localStorage.removeItem(SWITCH_KEY);
      else if (param !== null) localStorage.setItem(SWITCH_KEY, "1");
      on = localStorage.getItem(SWITCH_KEY) === "1";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the URL and storage
    setShowSwitch(on);
  }, []);

  const scene = now ? (picked ? sceneAs(picked, now, films, WALL_IDS) : sceneAt(now, films, WALL_IDS)) : null;

  const style: Record<string, string> = {};
  if (scene?.next) style["--en-next"] = scene.next.colour;
  if (scene?.tonight) style["--glow"] = scene.tonight.colour;

  return (
    <div className="en-strip" data-state={scene?.state} style={style as CSSProperties}>
      <Scene scene={scene} />
      {showSwitch && (
        <div className="en-time">
          <label>
            Time{" "}
            <select value={picked} onChange={(e) => setPicked(e.target.value as State | "")}>
              <option value="">Real time</option>
              {STATES.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
