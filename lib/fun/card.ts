// The programmer's card (Fun lab idea "card"), keyed by film slug.
//
// card: a scan of a real handwritten 3×5 index card, written in biro and shot
//   flat. Put it at public/cards/<slug>.webp, 1200 × 720. Never a handwriting
//   font. On Q&A nights the guest writes it. Until a scan exists the page shows
//   a blank ruled card marked as a stand-in.
// ifYouLike: the titles written at the bottom of the card, as real links
//   (a trailer or the Wikipedia page), shown in type under the card.
// frameNotes: notes on the film page's main still, shown while the mouse
//   scrubs past that frame (on phones, as a line under the still). frame is
//   the index into film.stills; 0 is the resting frame, so use 1 and up. x, y,
//   w and h place the box, in % of the still. The label goes under the box, or
//   above it when the box reaches into the bottom quarter.

export type IndexCard = {
  src: string; // "/cards/<slug>.webp"
  text: string; // the card transcribed, used as the image's alt text
  signed: string; // as signed on the card, e.g. "Matt, Tues 19 Jan"
};

export type FrameNote = {
  frame: number;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  by: string;
};

export type CardNight = {
  card?: IndexCard;
  ifYouLike?: { label: string; url: string }[];
  frameNotes?: FrameNote[];
};

// DRAFT: written on the blank stand-in card. Goes away once a scan is in.
export const BLANK_CARD = {
  host: "Matt's card goes here",
  guest: "The guest's card goes here", // Q&A nights
};

export const CARDS: Record<string, CardNight> = {
  "southland-tales": {
    // DRAFT: stand-ins to show the links under the card; Matt's card decides
    // the real ones. Both are Richard Kelly films (Wikipedia).
    ifYouLike: [
      { label: "Donnie Darko", url: "https://en.wikipedia.org/wiki/Donnie_Darko" },
      { label: "The Box", url: "https://en.wikipedia.org/wiki/The_Box_(2009_film)" },
    ],
  },
  wax: {
    frameNotes: [
      // DRAFT: the eyes, second still
      {
        frame: 1,
        x: 2,
        y: 28,
        w: 35,
        h: 38,
        // Wikipedia: first film streamed across the internet, 23 May 1993, at 2 frames a second
        text: "first film streamed online, 1993, at two frames a second",
        by: "Matt",
      },
      // DRAFT: the bees, third still
      { frame: 2, x: 38, y: 24, w: 17, h: 26, text: "count the bees", by: "Matt" },
    ],
  },
};

export const cardFor = (slug: string): CardNight => CARDS[slug] ?? {};

// Q&A nights get a card from the guest instead
export const isGuestNight = (extra?: string) => Boolean(extra?.includes("Q&A"));
