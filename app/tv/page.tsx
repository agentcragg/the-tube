// Basement TV: a channel that's always on, the same for everyone. Reached
// from the basement screen in the footer drawing and the fat footer's link.
// Never put this player on film pages: it's a page of its own.
//
// The videos and their comments are lib/tv-channel.json, made by
// scripts/tv-comments.py and scripts/tv-channel.py (see the top of each).

import Tv from "@/components/Tv";
import data from "@/lib/tv-channel.json";
import { lineUp, type Video } from "@/lib/tv";
import "../tv.css";

export const metadata = { title: "Basement TV · The Tube" };

// The running order, worked out here so the browser only gets the result
const CHANNEL = lineUp(data.videos as Video[]);

if (process.env.NODE_ENV === "development" && !CHANNEL.length) console.warn("Basement TV: nothing to play");

export default function BasementTv() {
  return <Tv channel={CHANNEL} />;
}
