// Fun lab idea: running. Tuesday night as it happens: a running order on each
// film page, a live band on the front page during a night, and the week
// after, that night's shorts in a Spotlight box. The night data lives in
// lib/fun/nights.ts. These wrappers run on the server and only look up
// YouTube channel names; the clock-driven parts are client components.

import type { Film } from "@/lib/films";
import { NIGHTS, nightFor } from "@/lib/fun/nights";
import { withYouTubeDetails } from "@/lib/videos";
import LiveBand from "./LiveBand";
import RunningOrderBox from "./RunningOrderBox";
import SpotlightVideos, { type SpotlightNight } from "./SpotlightVideos";

// Channel names from YouTube's oEmbed, by video ID
async function channelsFor(ids: string[]) {
  if (!ids.length) return {};
  const videos = await withYouTubeDetails([...new Set(ids)].map((id) => ({ id, title: "" })));
  return Object.fromEntries(videos.flatMap((v) => (v.channel ? [[v.id, v.channel]] : [])));
}

// Film page, after the Programme notes box.
export async function RunningOrder({ film }: { film: Film }): Promise<React.ReactNode> {
  const night = nightFor(film.slug);
  // Doors, feature and nothing else isn't worth a box
  if (!night.shorts?.items.length && !night.extra) return null;
  const channels = await channelsFor(night.shorts?.items.map((s) => s.id) ?? []);
  return <RunningOrderBox film={film} night={night} channels={channels} />;
}

// Front page, full width at the very top (Tuesday evenings only).
export function LiveBasement({ films }: { films: Film[] }): React.ReactNode {
  return <LiveBand films={films} />;
}

// Front page sidebar, after Next screening (week after a night).
export async function SpotlightBox({ films }: { films: Film[] }): Promise<React.ReactNode> {
  const nights: SpotlightNight[] = films.flatMap((film) => {
    const night = NIGHTS[film.slug];
    return night?.shorts?.items.length ? [{ film, night }] : [];
  });
  if (!nights.length) return null;
  const channels = await channelsFor(nights.flatMap((n) => n.night.shorts?.items.map((s) => s.id) ?? []));
  return <SpotlightVideos nights={nights} channels={channels} />;
}
