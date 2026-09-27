// Fun lab idea: handbill. One hand-made banner for the next night at the top
// of the front page, and the same banner on each film's page.
import type { Film } from "@/lib/films";
import Handbill from "./Handbill";

// Front page, full width above Coming up. Next film.
export function HandbillHome({ film }: { film: Film }): React.ReactNode {
  return <Handbill film={film} variant="home" />;
}

// Film page, between the action row and Programme notes.
export function HandbillFilm({ film }: { film: Film }): React.ReactNode {
  return <Handbill film={film} variant="film" />;
}
