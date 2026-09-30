// Basement TV: a channel that's always on, the same for everyone. Reached
// from the basement screen in the footer drawing and the fat footer's link.
// Never put this player on film pages: it's a page of its own.
//
// The videos and their comments are lib/tv-channel.json, made by
// scripts/tv-comments.py and scripts/tv-channel.py (see the top of each).
// The rabbit holes' clips are always on. Everything else (the wall's videos
// and the nights' shorts) is on only while it's ticked in the suggestions
// sheet, and a video ticked since the list was made joins it, without
// comments until the scripts are run again.

import Tv from "@/components/Tv";
import data from "@/lib/tv-channel.json";
import { tickedVideos } from "@/lib/suggestions";
import { lineUp, type Video } from "@/lib/tv";
import { WATCH } from "@/lib/watch";
import { youtubePlayable } from "@/lib/youtube";
import "../tv.css";

export const metadata = { title: "Basement TV · The Tube" };

const LISTED = data.videos as Video[];
const IN_A_RABBIT_HOLE = new Set(Object.values(WATCH).flatMap((w) => w.clips.map((c) => c.id)));
const MAX_SECONDS = 20 * 60; // the same rule scripts/tv-channel.py uses

// What's on: the listed videos that are still wanted, and any newly ticked ones.
// If the sheet can't be read, everything listed stays on.
async function channel(): Promise<Video[]> {
  const ticked = await tickedVideos();
  if (!ticked) return LISTED;
  const on = new Set(ticked.map((v) => v.id));
  const kept = LISTED.filter((v) => IN_A_RABBIT_HOLE.has(v.id) || on.has(v.id));
  const added = await Promise.all(
    ticked
      .filter((v) => /^[\w-]{11}$/.test(v.id) && !LISTED.some((l) => l.id === v.id))
      .map(async (v): Promise<Video | null> => {
        const found = await youtubePlayable(v.id);
        if (!found?.embeddable || found.seconds <= 0 || found.seconds > MAX_SECONDS) return null;
        return { id: v.id, title: v.title, credit: v.maker ?? v.channel ?? "", seconds: found.seconds, comments: [] };
      }),
  );
  return [...kept, ...added.filter((v) => v !== null)];
}

export default async function BasementTv() {
  const videos = lineUp(await channel());
  if (process.env.NODE_ENV === "development" && !videos.length) console.warn("Basement TV: nothing to play");
  return <Tv channel={videos} />;
}
