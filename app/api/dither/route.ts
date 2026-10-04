import sharp, { type Sharp } from "sharp";
import { DITHER_HOSTS, DITHER_WIDTHS, PAPER, TONER } from "@/lib/dither";

// A still as a small GIF in four colours of its own, dithered in the
// cross-hatch pattern an old GIF had: /api/dither?w=320&src=<still>. With
// &kind=copy, black on paper instead, like a still run through a photocopier.
// Only from the hosts and at the widths in lib/dither.ts. Stills never change
// at their address, so the CDN and the browser keep each one for a year.

const MAX_BYTES = 4_000_000; // TMDB's w780 stills are about 100 KB
const COLOURS = 4;
const SPREAD = 90; // how far the pattern nudges a pixel before it's matched to a colour (of 255)

// 8×8 Bayer matrix: the order the dots fill in as a colour gets lighter
// prettier-ignore
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

type Rgb = [number, number, number];

// The four colours a GIF encoder would choose for this picture
async function paletteOf(img: Sharp): Promise<Rgb[]> {
  const png = await img.clone().png({ palette: true, colours: COLOURS, dither: 0 }).toBuffer();
  const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const seen = new Set<number>();
  for (let i = 0; i < data.length; i += 3) seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  return [...seen].map((c) => [c >> 16, (c >> 8) & 255, c & 255]);
}

async function dither(input: Buffer, width: number) {
  const img = sharp(input, { limitInputPixels: 4096 * 4096 }).resize({ width }).removeAlpha();
  const [{ data, info }, palette] = await Promise.all([
    img.clone().raw().toBuffer({ resolveWithObject: true }),
    paletteOf(img),
  ]);
  const out = Buffer.alloc(data.length);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const t = ((BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64 - 0.5) * SPREAD;
      const i = (y * info.width + x) * 3;
      const r = data[i] + t, g = data[i + 1] + t, b = data[i + 2] + t;
      // Nearest of the four, weighted the way the eye weighs red, green and blue
      let best = palette[0], bestD = Infinity;
      for (const p of palette) {
        const d = 0.3 * (p[0] - r) ** 2 + 0.59 * (p[1] - g) ** 2 + 0.11 * (p[2] - b) ** 2;
        if (d < bestD) [best, bestD] = [p, d];
      }
      [out[i], out[i + 1], out[i + 2]] = best;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
    .gif({ colours: COLOURS, dither: 0 })
    .toBuffer();
}

const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;

// One bit a pixel, in Atkinson's error diffusion (the early Macs' own), after
// pushing the contrast the way a copier does: shadows fill in, highlights go
async function photocopy(input: Buffer, width: number) {
  const { data, info } = await sharp(input, { limitInputPixels: 4096 * 4096 })
    .resize({ width })
    .greyscale()
    .normalise()
    .linear(1.3, -30)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const g = Float32Array.from(data);
  const out = Buffer.alloc(w * h * 3);
  const [paper, toner] = [rgb(PAPER), rgb(TONER)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const on = g[i] >= 128;
      const err = (g[i] - (on ? 255 : 0)) / 8;
      for (const [dx, dy] of [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]) {
        if (x + dx >= 0 && x + dx < w && y + dy < h) g[i + dy * w + dx] += err;
      }
      [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]] = on ? paper : toner;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } }).gif({ colours: 2, dither: 0 }).toBuffer();
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const width = Number(q.get("w"));
  const kind = q.get("kind");
  let src: URL;
  try {
    src = new URL(q.get("src") ?? "");
  } catch {
    return new Response("Not a picture we dither", { status: 400 });
  }
  if (
    src.protocol !== "https:" ||
    !DITHER_HOSTS.includes(src.hostname) ||
    !(DITHER_WIDTHS as readonly number[]).includes(width) ||
    (kind !== null && kind !== "copy")
  ) {
    return new Response("Not a picture we dither", { status: 400 });
  }
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) throw new Error(`${res.status}`);
    if (Number(res.headers.get("content-length")) > MAX_BYTES) throw new Error("too big");
    const input = Buffer.from(await res.arrayBuffer());
    if (input.length > MAX_BYTES) throw new Error("too big");
    const gif = await (kind === "copy" ? photocopy(input, width) : dither(input, width));
    return new Response(new Uint8Array(gif), {
      headers: { "Content-Type": "image/gif", "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
    });
  } catch {
    // The plain still rather than a hole in the page, and try again soon
    return new Response(null, { status: 302, headers: { Location: src.href, "Cache-Control": "public, max-age=300" } });
  }
}
