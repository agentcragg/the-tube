// Screenshots of archived film websites for the rabbit hole's "From the archive" shelf
// (public/archive/<slug>/<name>.jpg, listed as links[].shot in lib/watch.ts).
// Run by hand, rarely. Playwright isn't a dependency of the site, so run it from
// a scratch folder:
//   mkdir /tmp/shots && cp scripts/archive-shots.mjs /tmp/shots/ && cd /tmp/shots
//   npm init -y && npm i playwright && npx playwright install chromium
//   node archive-shots.mjs [name ...]
// then look at every image in out/ and copy the good ones into public/archive/.
//
// Screenshots of archived film websites for THE TUBE's "From the archive" shelf.
// node capture.mjs [name ...]   (no names: all)
// Loads each Wayback capture in its if_ form (no toolbar) at 1024x768, waits for
// networkidle or 20s, saves raw/<slug>--<name>.png, then sips makes
// out/<slug>/<name>.jpg at 800x600, quality ~70. Writes results.json.

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const ENTRIES = [
  // The Jun 2007 frameset's intro frame is a register.com parking page; Dec 2006 is the real one (Flash)
  ["southland-tales", "southlandtales", "http://web.archive.org/web/20061201233722/http://www.southlandtales.com:80/", { flash: true, wait: 45000 }],
  ["southland-tales", "usident", "http://web.archive.org/web/20070602094317/http://www.usident.org:80/"],
  ["southland-tales", "krysta-now", "http://web.archive.org/web/20070610051655/http://www.krysta-now.com:80/"],
  ["southland-tales", "treer", "http://web.archive.org/web/20060619204520/http://www.treer-products.com:80/", { flash: true, wait: 30000 }],
  ["wax", "waxweb", "http://web.archive.org/web/19990208211003/http://jefferson.village.virginia.edu:80/wax/"],
  ["in-the-dark", "gemineye", "https://web.archive.org/web/20000829035444/http://www.gemineye.demon.nl/"],
  ["trash-humpers", "trashhumpers", "http://web.archive.org/web/20100128062843/http://www.trashhumpers.com:80/"],
  ["trash-humpers", "trashhumpers-2011", "http://web.archive.org/web/20110208050516/http://www.trashhumpers.com:80/"],
  ["reflections-of-evil", "reflectionsofevil", "https://web.archive.org/web/20020809195025/http://www.reflectionsofevil.com:80/"],
  ["reflections-of-evil", "others-have-seen", "https://web.archive.org/web/20020814222819/http://www.reflectionsofevil.com:80/pageCR.htm"],
  ["crank", "crankfilm", "http://web.archive.org/web/20070629221547/http://www.crankfilm.com/"],
  ["crank", "crankmovie", "http://web.archive.org/web/20071231183004/http://www.crankmovie.com/"],
  ["ryan-trecartin-double-bill", "ubuweb", "http://web.archive.org/web/20080306124733/http://www.ubu.com:80/film/trecartin.html"],
  ["a-self-induced-hallucination", "somethingawful", "http://web.archive.org/web/20100213174651/http://forums.somethingawful.com:80/showthread.php?threadid=3150591"],
];

// Extra entries can be passed as slug,name,url
const extra = process.argv.slice(2).filter((a) => a.split(",").length >= 3).map((a) => {
  const [slug, name, ...rest] = a.split(",");
  return [slug, name, rest.join(",")];
});
const names = process.argv.slice(2).filter((a) => !a.includes(","));
const todo = extra.length ? extra : ENTRIES.filter(([, n]) => !names.length || names.includes(n));

// .../web/20070602094317/http://... -> .../web/20070602094317if_/http://...
const bare = (url) => url.replace(/\/web\/(\d{14})(?:[a-z]{2}_)?\//, "/web/$1if_/");

const results = existsSync("results.json") ? JSON.parse(readFileSync("results.json", "utf8")) : {};
mkdirSync("raw", { recursive: true });

// Flash pages: Ruffle, the open-source Flash player, in every frame
const RUFFLE = () => {
  window.RufflePlayer = window.RufflePlayer || {};
  window.RufflePlayer.config = { autoplay: "on", unmuteOverlay: "hidden", splashScreen: false, warnOnUnsupportedContent: false };
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle";
    document.head.appendChild(s);
  });
};

const browser = await chromium.launch();
for (const [slug, name, url, opts = {}] of todo) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  if (opts.flash) await page.addInitScript(RUFFLE);
  const src = bare(url);
  let status = null;
  for (let attempt = 0; attempt < 3 && status === null; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 15000));
    try {
      const res = await page.goto(src, { waitUntil: "load", timeout: 20000 });
      status = res?.status() ?? null;
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    } catch (e) {
      console.warn(`${name}: ${e.message.split("\n")[0]}`);
      if (!/ERR_CONNECTION|Timeout/.test(e.message)) break;
    }
  }
  await page.waitForTimeout(opts.wait ?? 1500);
  const title = await page.title().catch(() => "");
  const final = page.url();
  const png = `raw/${slug}--${name}.png`;
  await page.screenshot({ path: png, timeout: 10000 }).catch((e) => console.warn(`${name}: screenshot ${e.message}`));
  await page.close();

  const dir = `out/${slug}`;
  mkdirSync(dir, { recursive: true });
  const jpg = `${dir}/${name}.jpg`;
  if (existsSync(png)) {
    execFileSync("sips", ["-z", "600", "800", "-s", "format", "jpeg", "-s", "formatOptions", "70", png, "--out", jpg], { stdio: "ignore" });
  }
  const bytes = existsSync(jpg) ? statSync(jpg).size : 0;
  const ts = final.match(/\/web\/(\d{14})/)?.[1];
  results[name] = { slug, url, final, ts, status, title, bytes };
  await new Promise((r) => setTimeout(r, 4000)); // go gently on the Wayback Machine
  console.log(`${name}\t${status}\t${ts}\t${bytes}B\t${title}${bytes < 15000 ? "\t<-- small, probably blank" : ""}`);
}
await browser.close();
writeFileSync("results.json", JSON.stringify(results, null, 2));
