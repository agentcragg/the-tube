// Stills with black bars baked into the picture (a film shot wider than 16:9
// in a YouTube thumbnail, say), and how thick the bars are, so a frame can
// zoom just past them. Measured by hand: the pixels can't be read in the
// browser, because TMDB and YouTube images are cached without the headers
// that would allow it. Add a line here when a new still has bars.

export type Bars = { v: number; h: number }; // bar on each side, as a fraction of the height / width

const MARGIN = 0.006; // trim a hair more, so no dark line is left at the edge

const BARS: Record<string, Bars> = {
  // Nebraska City, episode 10: 38px top and bottom of 720
  "https://i.ytimg.com/vi/srgrYYqRk5g/maxresdefault.jpg": { v: 38 / 720, h: 0 },
  // Nebraska City, episode 9: 69px top and bottom of 720
  "https://i.ytimg.com/vi/SLLIXxxLcdU/maxresdefault.jpg": { v: 69 / 720, h: 0 },
  // Nebraska City, episode 1: 28px and 31px of 360 (a 16:9 frame crops these off anyway)
  "https://i.ytimg.com/vi/mkRpQU2xVCo/hqdefault.jpg": { v: 31 / 360, h: 0 },
};

// With the margin added, worked out once so each still gets the same object every time
const TRIMMED = new Map(
  Object.entries(BARS).map(([src, { v, h }]) => [src, { v: v && v + MARGIN, h: h && h + MARGIN }]),
);

export function barsFor(src: string): Bars | undefined {
  return TRIMMED.get(src);
}

/**
 * How much to zoom a picture shown with object-fit: cover so none of its bars
 * show. imageAspect and frameAspect are width / height.
 */
export function zoomPastBars({ v, h }: Bars, imageAspect: number, frameAspect: number) {
  if (!v && !h) return 1;
  // Cover already crops the longer side, which may take the bars off anyway
  const zv = imageAspect >= frameAspect ? 1 / (1 - 2 * v) : imageAspect / (frameAspect * (1 - 2 * v));
  const zh = imageAspect >= frameAspect ? frameAspect / (imageAspect * (1 - 2 * h)) : 1 / (1 - 2 * h);
  return Math.max(1, zv, zh);
}
