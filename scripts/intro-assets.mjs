// Pictures for the TV intro (components/Intro.tsx) and the channel change:
//   public/intro/tv-wide.png, tv-tall.png  a TV against a basement wall, the screen cut out
//   public/intro/stills/<slug>.png         each film's first still, for the TV's screen
//   public/intro/snow.png                  static for the screen, three strengths stacked
//   public/intro/static.png                static to lay over a whole page, for the channel change
// and lib/intro.json, where the screen sits in each picture and which films have a still.
// Run by hand when the programme's stills change: node scripts/intro-assets.mjs
// (sharp comes with Next; Node 23.6+ reads lib/films.ts as it is).
//
// Everything is dithered to the two tones of Matt's reference GIF: black dots
// on a flat mid grey. Atkinson dithering, as on the first Macs.
//
// The TV is "Vintage television" by Sven Scheuermeier on Unsplash, CC0 (public
// domain dedication), via Wikimedia Commons:
// https://commons.wikimedia.org/wiki/File:Vintage_television_(Unsplash).jpg

import sharp from "sharp";
import { deflateSync, crc32 } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { films } from "../lib/films.ts";

const OUT = new URL("../public/intro/", import.meta.url);
const PHOTO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Vintage_television_%28Unsplash%29.jpg/1920px-Vintage_television_%28Unsplash%29.jpg";
const UA = { "User-Agent": "TheTube/1.0 (intro pictures, run by hand)" };

// Palette: 0 black, 1 the reference's grey, 2 see-through
const GREY = 129;
const BLACK = 0, LIGHT = 1, CLEAR = 2;

// The photo is 1920x1281. Its screen is about 542x398, centred on (544, 368);
// a superellipse is close to the shape of an old tube.
const SCREEN = { cx: 544, cy: 368, a: 268, b: 196, n: 5 };

// What each picture takes in, in the photo's pixels, and its size on disk.
// Wide is for most screens (the TV a third of the width), tall for
// phones held upright (the TV most of the width). Both are centred on the TV.
const VIEWS = {
  wide: { x: -580, y: -91, w: 2340, h: 1462, out: [720, 450] },
  tall: { x: 38, y: -330, w: 1104, h: 2208, out: [240, 480] },
};

async function fetchBuffer(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

// --- Dithering ---------------------------------------------------------------

// Luminance 0..1 (1 = the grey) to palette indexes, error spread Atkinson's way
function atkinson(lum, w, h) {
  const px = Float32Array.from(lum);
  const out = new Uint8Array(w * h);
  const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const v = px[i];
      const on = v >= 0.5;
      out[i] = on ? LIGHT : BLACK;
      const err = (v - (on ? 1 : 0)) / 8;
      for (const [dx, dy] of spread) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny < h) px[ny * w + nx] += err;
      }
    }
  }
  return out;
}

// --- A small indexed PNG writer (2 bits a pixel, so the pictures stay tiny) ---

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(indexes, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 2; // bit depth
  ihdr[9] = 3; // indexed colour
  const rowBytes = Math.ceil(w / 4);
  const raw = Buffer.alloc((rowBytes + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (rowBytes + 1);
    for (let x = 0; x < w; x++) raw[row + 1 + (x >> 2)] |= indexes[y * w + x] << (6 - 2 * (x & 3));
  }
  const used = indexes.includes(CLEAR);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("PLTE", Buffer.from([0, 0, 0, GREY, GREY, GREY, 0, 0, 0])),
    ...(used ? [chunk("tRNS", Buffer.from([255, 255, 0]))] : []),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- The TV ------------------------------------------------------------------

// Photo levels to dither input: the wall goes to flat grey, the beam and the
// set to near black, the floor in between
const tone = (v) => Math.min(1.15, Math.max(0, (v / 255 - 0.13) / 0.6));

async function scene() {
  const photo = await fetchBuffer(PHOTO);
  const { data: src, info } = await sharp(photo).toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height; // 1920 x 1281
  const at = (x, y) => src[y * W + x];

  // The photo carried on past its edges: the bare wall on the right repeats on
  // the left, plain wall above the beam, more floor below. The floor is darker
  // than in the photo, and darker still towards the front, so it reads as a
  // floor once dithered.
  const X0 = -1100, Y0 = -700, EW = 3020, EH = 2700;
  const ext = Buffer.alloc(EW * EH);
  const WALL = 205, FLOOR = 1075;
  let floor = 0;
  for (let x = 1000; x < 1900; x++) for (let y = H - 40; y < H; y++) floor += at(x, y) / (900 * 40);
  let seed = 1;
  const grain = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32 - 0.5) * 26;
  for (let ey = 0; ey < EH; ey++) {
    const y = ey + Y0;
    for (let ex = 0; ex < EW; ex++) {
      const ox = ex + X0;
      const x = ox < 0 ? 1000 + (((ox % 920) + 920) % 920) : ox;
      let v;
      if (y < 0) v = WALL;
      else if (y < H) v = at(x, y);
      else v = floor;
      // Soften the seams where the repeat and the made-up floor meet the photo
      if (ox < 0 && ox > -60 && y >= 0 && y < H) {
        const t = (ox + 60) / 60;
        v = v * (1 - t) + at(0, y) * t;
      }
      if (y >= H && y < H + 40) v = at(x, H - 1) * (1 - (y - H) / 40) + floor * ((y - H) / 40);
      // and the top of the beam
      if (y < 0 && y > -12) v = WALL * (-y / 12) + at(x, 0) * (1 + y / 12);
      if (y >= FLOOR) v = v * (0.8 - 0.2 * Math.min(1, (y - FLOOR) / 800)) + grain();
      ext[ey * EW + ex] = Math.max(0, Math.min(255, v));
    }
  }

  const geometry = {};
  for (const [name, view] of Object.entries(VIEWS)) {
    const [w, h] = view.out;
    const { data } = await sharp(ext, { raw: { width: EW, height: EH, channels: 1 } })
      .extract({ left: view.x - X0, top: view.y - Y0, width: view.w, height: view.h })
      .resize(w, h, { kernel: "lanczos3" })
      .toColourspace("b-w")
      .raw()
      .toBuffer({ resolveWithObject: true });
    const lum = Array.from(data, tone);
    const ix = atkinson(lum, w, h);
    // Cut the screen out, so the site shows through it at the end
    const s = w / view.w;
    const cx = (SCREEN.cx - view.x) * s, cy = (SCREEN.cy - view.y) * s;
    const a = SCREEN.a * s, b = SCREEN.b * s;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = Math.abs((x + 0.5 - cx) / a) ** SCREEN.n + Math.abs((y + 0.5 - cy) / b) ** SCREEN.n;
        if (d <= 1) ix[y * w + x] = CLEAR;
      }
    }
    const file = png(ix, w, h);
    writeFileSync(new URL(`tv-${name}.png`, OUT), file);
    const pct = (n) => Math.round(n * 10000) / 100;
    geometry[name] = {
      width: w,
      height: h,
      // The screen as percentages of the picture: left, top, width, height
      screen: [pct((cx - a) / w), pct((cy - b) / h), pct((2 * a) / w), pct((2 * b) / h)],
    };
    console.log(`tv-${name}.png ${w}x${h} ${(file.length / 1024).toFixed(1)} KB`);
  }
  return geometry;
}

// --- Stills for the screen ---------------------------------------------------

const STILL = [168, 124];

async function stills() {
  mkdirSync(new URL("stills/", OUT), { recursive: true });
  const done = [];
  for (const f of films) {
    if (!f.stills[0]) continue;
    try {
      const [w, h] = STILL;
      const { data } = await sharp(await fetchBuffer(f.stills[0]))
        .resize(w, h, { fit: "cover" })
        .toColourspace("b-w")
        .normalise()
        .raw()
        .toBuffer({ resolveWithObject: true });
      // A touch lighter than the scene: the screen is lit
      const ix = atkinson(Array.from(data, (v) => Math.min(1.1, (v / 255) * 1.15 + 0.05)), w, h);
      const file = png(ix, w, h);
      writeFileSync(new URL(`stills/${f.slug}.png`, OUT), file);
      done.push(f.slug);
      console.log(`stills/${f.slug}.png ${(file.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.warn(`No still for ${f.slug}: ${e.message}`);
    }
  }
  return done;
}

// --- Static ------------------------------------------------------------------

// Three bands, top to bottom: thick (every dot black or grey), half, sparse.
// The see-through dots let a still, or the page, show through.
function snow() {
  const [w, h] = STILL;
  const ix = new Uint8Array(w * h * 3);
  const strength = [1, 0.5, 0.18];
  let seed = 7;
  const rand = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32);
  strength.forEach((p, band) => {
    for (let i = 0; i < w * h; i++) {
      ix[band * w * h + i] = rand() < p ? (rand() < 0.55 ? BLACK : LIGHT) : CLEAR;
    }
  });
  const file = png(ix, w, h * 3);
  writeFileSync(new URL("snow.png", OUT), file);
  console.log(`snow.png ${(file.length / 1024).toFixed(1)} KB`);

  // A square that tiles, about half its dots see-through
  const n = 160;
  const tile = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) tile[i] = rand() < 0.5 ? (rand() < 0.6 ? BLACK : LIGHT) : CLEAR;
  const file2 = png(tile, n, n);
  writeFileSync(new URL("static.png", OUT), file2);
  console.log(`static.png ${(file2.length / 1024).toFixed(1)} KB`);
}

mkdirSync(OUT, { recursive: true });
const geometry = await scene();
const slugs = await stills();
snow();
writeFileSync(
  new URL("../lib/intro.json", import.meta.url),
  JSON.stringify({ tv: geometry, still: STILL, stills: slugs }, null, 2) + "\n",
);
