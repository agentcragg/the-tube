// Fun lab idea: handbill. One hand-made banner for each night, keyed by film
// slug. It's the same artwork as the paper flyer for the bar.
//
// Files go in public/handbills/<slug>/, e.g. "/handbills/wax/wide.jpg":
//   wide: 1920x440, for computers and tablets
//   tall: 800x1000, the phone crop (optional; phones get the wide one without it)
// JPG, PNG, WebP or AVIF. Animated WebP and GIF play as they are.
// Without a wide file the banner prints the film's stills in one ink instead.

export type Handbill = {
  wide?: string;
  tall?: string;
  aside?: string; // one line, shown in brackets after the title
  by?: string; // who made it, shown as "Banner by …"; leave out until it's real
};

export const HANDBILL_SIZE = {
  wide: { width: 1920, height: 440 },
  tall: { width: 800, height: 1000 },
};

export const HANDBILLS: Record<string, Handbill> = {
  // DRAFT: asides for Matt to rewrite. Facts checked against Wikipedia (Sep 2026).
  "southland-tales": {
    aside: "set in the near future of 2008", // DRAFT
  },
  wax: {
    aside: "the first film ever streamed online, in 1993, at two frames a second", // DRAFT
  },
  skinamarink: {
    aside: "made for $15,000 in the director's childhood home", // DRAFT
  },
};
