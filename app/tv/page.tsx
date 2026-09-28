// Basement TV: a channel that's always on, the same for everyone. Reached
// from the basement screen in the footer drawing and the fat footer's link.
// Never put this player on film pages: it's a page of its own.

import Tv from "@/components/Tv";
import { films, formatDate } from "@/lib/films";
import { NIGHTS } from "@/lib/nights";
import { COPY, slotsFor, type Week } from "@/lib/tv";
import "../tv.css";

export const metadata = { title: "Basement TV · The Tube", description: COPY.about };

// Every film's channel, so the browser can pick this week's and move on to
// the next one on its own
const WEEKS: Week[] = films.map((f) => ({
  slug: f.slug,
  title: f.title,
  date: f.date,
  when: formatDate(f.date),
  shorts: Boolean(NIGHTS[f.slug]?.shorts),
  slots: slotsFor(f),
}));

if (process.env.NODE_ENV === "development") {
  for (const w of WEEKS) if (!w.slots.length) console.warn(`Basement TV: nothing to play for ${w.slug}`);
}

export default function BasementTv() {
  return <Tv weeks={WEEKS} />;
}
