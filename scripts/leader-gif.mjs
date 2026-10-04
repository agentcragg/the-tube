// The countdown leader as a little animated GIF (public/leader.gif), for the
// look switch's "leader" idea: shown where a still or a video is still on its
// way, the way a site in 2008 had a spinning loader. Its first frame is also
// kept still (public/leader.png), for anyone who's asked for less movement.
// Run by hand from the project folder when it needs to change:
// node scripts/leader-gif.mjs
//
// Each number gets one turn of the sweep, 8 down to 3, a second each, as on
// a projectionist's leader.

import sharp from "sharp";

const W = 64, H = 48, CX = 32, CY = 24;
const STEPS = 12; // frames for each turn of the sweep
const DELAY = 80; // ms a frame; GIFs count in hundredths

function frame(n, k) {
  const a = (k / STEPS) * 2 * Math.PI;
  const x = CX + 60 * Math.sin(a), y = CY - 60 * Math.cos(a);
  // The swept part of the turn, darker, from twelve o'clock round to the hand
  const pie = k === 0 ? "" : `<path d="M${CX} ${CY} L${CX} ${CY - 60} A60 60 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z" fill="#666"/>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#9b9b9b"/>
  ${pie}
  <line x1="${CX}" y1="${CY}" x2="${x}" y2="${y}" stroke="#222" stroke-width="1"/>
  <line x1="0" y1="${CY}" x2="${W}" y2="${CY}" stroke="#222" stroke-width="1"/>
  <line x1="${CX}" y1="0" x2="${CX}" y2="${H}" stroke="#222" stroke-width="1"/>
  <circle cx="${CX}" cy="${CY}" r="19" fill="none" stroke="#fff" stroke-width="1.5"/>
  <circle cx="${CX}" cy="${CY}" r="15.5" fill="none" stroke="#fff" stroke-width="1"/>
  <text x="${CX}" y="${CY + 8}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="23" fill="#111">${n}</text>
</svg>`);
}

const frames = [];
for (let n = 8; n >= 3; n--) for (let k = 0; k < STEPS; k++) frames.push(await sharp(frame(n, k)).png().toBuffer());

await sharp(frames, { join: { animated: true } })
  .gif({ colours: 8, dither: 0, loop: 0, delay: frames.map(() => DELAY) })
  .toFile("public/leader.gif");
console.log(`public/leader.gif: ${frames.length} frames`);

await sharp(frames[0]).png({ palette: true, colours: 8 }).toFile("public/leader.png");
console.log("public/leader.png");
