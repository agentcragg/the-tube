import Link from "next/link";
import type { Film } from "@/lib/films";
import { BLANK_CARD, cardFor, isGuestNight } from "@/lib/fun/card";

// The card itself: Matt's scan once there is one, otherwise a blank ruled
// 3×5 card that says what goes there.
function Paper({ film }: { film: Film }) {
  const { card } = cardFor(film.slug);
  if (card) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="hype-scan" src={card.src} alt={`${card.text} (${card.signed})`} width={1200} height={720} />
    );
  }
  return (
    <span className="hype-blank">
      <span>{isGuestNight(film.extra) ? BLANK_CARD.guest : BLANK_CARD.host}</span>
    </span>
  );
}

// Film page, top of the Programme notes box: taped over the box's top-right
// corner, the notes wrap round it. The "If you like" titles sit underneath as links.
export function HypeCard({ film }: { film: Film }): React.ReactNode {
  const { ifYouLike } = cardFor(film.slug);
  return (
    <figure className="hype">
      <span className="hype-card">
        <Paper film={film} />
      </span>
      {ifYouLike && ifYouLike.length > 0 && (
        <figcaption>
          If you like:{" "}
          {ifYouLike.map((l, i) => (
            <span key={l.url}>
              {i > 0 && ", "}
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

// Front page, in the Next screening box: the same card, small, linking to the
// film page where it can be read.
export function HypeCardMini({ film }: { film: Film }): React.ReactNode {
  return (
    <figure className="hype-mini">
      <Link className="hype-card" href={`/films/${film.slug}`}>
        <Paper film={film} />
      </Link>
    </figure>
  );
}
