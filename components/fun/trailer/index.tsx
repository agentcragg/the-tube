// Fun lab idea: trailer. "Watch trailer" in the action row plays the film's
// trailer where the main still was, after a preview card in the film's colour.
// The two slots talk through a small store (./store.ts). Trailers, advice lines
// and wording live in lib/fun/trailer.ts; films with no trailer get nothing.
import type { Film } from "@/lib/films";
import { trailerFor } from "@/lib/fun/trailer";
import TrailerStill from "./TrailerStill";
import TrailerToggle from "./TrailerToggle";
import { shortClock } from "./youtube";

// Film page, inside the action row after Map.
export function TrailerButton({ film }: { film: Film }): React.ReactNode {
  const trailer = trailerFor(film.slug);
  if (!trailer) return null;
  return <TrailerToggle slug={film.slug} length={shortClock(trailer.seconds)} />;
}

// Film page, overlaid on the main still (client).
export function TrailerOverlay({ film }: { film: Film }): React.ReactNode {
  const trailer = trailerFor(film.slug);
  if (!trailer) return null;
  return <TrailerStill slug={film.slug} trailer={trailer} />;
}
