// Stills as small dithered GIFs, made by app/api/dither: in four colours of
// their own (the look switch's "dither" idea), or black on paper like a
// photocopy ("copy", for the "handout" idea). TMDB and YouTube don't let the
// browser read their pixels, so the dithering happens on the server.

// Only pictures from these hosts are dithered
export const DITHER_HOSTS = ["image.tmdb.org", "i.ytimg.com"];

// The widths it will make, so nobody can ask for a huge one; a picture is
// shown at about this width, so each dot of the pattern stays a dot
export const DITHER_WIDTHS = [120, 320, 480] as const;
export type DitherWidth = (typeof DITHER_WIDTHS)[number];

// A photocopy's two colours, which the handout's paper matches (app/idea-handout.css)
export const PAPER = "#f6f4ec";
export const TONER = "#1c1c1a";

/** The dithered copy of a still, or the still itself if it's not from a host above. */
export function ditherSrc(src: string, w: DitherWidth, kind?: "copy") {
  try {
    if (!DITHER_HOSTS.includes(new URL(src).hostname)) return src;
  } catch {
    return src;
  }
  return `/api/dither?w=${w}${kind ? `&kind=${kind}` : ""}&src=${encodeURIComponent(src)}`;
}
