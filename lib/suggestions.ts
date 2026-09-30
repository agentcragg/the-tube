import { isVideoId, seedVideos, withYouTubeDetails, type Video } from "./videos";

// Public suggestions live in a Google Sheet (see sheet/suggestions.gs).
// Suggestions are added as rows; ticking "On the wall?" approves one.
// The Apps Script web app URL; SUGGESTIONS_SHEET_URL overrides it if set.
// Anyone with this URL can add rows, but nothing reaches the wall without a tick.

export const SHEET_URL =
  process.env.SUGGESTIONS_SHEET_URL ??
  "https://script.google.com/macros/s/AKfycbzM2rCwMZuK_PavJTwYl-6sFNIr4n3BU4NYELmjtU3hanDR3SnXRjLzmlhEWwj07qAG/exec";

// The first script only listed ticked suggestions, which went after our own
// list. From version 2 every video on the wall is a row, starters included,
// so the sheet's ticked rows are the whole wall and unticking hides one.
type Sheet = { version?: number; videos?: Video[] };

// Refreshed every few minutes so ticks show up quickly. null if unreachable.
async function readSheet(): Promise<Sheet | null> {
  if (!SHEET_URL) return null;
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()) as Sheet;
  } catch {
    return null;
  }
}

// Ticked rows, in the sheet's order (oldest first), each video once. Makers and
// years for the starters still come from seedVideos, since the sheet only has the channel.
function sheetVideos(sheet: Sheet): Video[] {
  const seen = new Set<string>();
  return (sheet.videos ?? []).flatMap((v) => {
    const id = String(v.id ?? "").trim();
    if (!isVideoId(id) || seen.has(id)) return [];
    seen.add(id);
    const seed = seedVideos.find((s) => s.id === id);
    return [
      {
        id,
        title: String(v.title ?? ""),
        channel: v.channel ? String(v.channel) : undefined,
        url: v.url ? String(v.url) : undefined,
        suggestedOn: v.suggestedOn || undefined,
        maker: seed?.maker,
        year: seed?.year,
      },
    ];
  });
}

const isV2 = (sheet: Sheet | null) => !!sheet && (sheet.version ?? 1) >= 2;
// The first script only ever sent YouTube suggestions
const approvedV1 = (sheet: Sheet | null) =>
  sheet && !isV2(sheet) ? (sheet.videos ?? []).filter((v) => /^[\w-]{11}$/.test(v.id)) : [];

// Everything on the wall. If the sheet can't be reached, or has nothing
// ticked, the starter list stands in so the wall is never empty.
export async function wallVideos(): Promise<Video[]> {
  const sheet = await readSheet();
  const videos = sheet && isV2(sheet) ? sheetVideos(sheet) : [];
  if (videos.length) return videos;
  const seed = await withYouTubeDetails(seedVideos);
  // Approved suggestions join our own list (skipping any already on it)
  return [...seed, ...approvedV1(sheet).filter((a) => !seed.some((s) => s.id === a.id))];
}

// The front page's "Just suggested": newest first
export async function latestVideos(count: number): Promise<Video[]> {
  const sheet = await readSheet();
  const videos = sheet && isV2(sheet) ? sheetVideos(sheet) : [];
  if (videos.length) return videos.reverse().slice(0, count);
  const seed = await withYouTubeDetails(seedVideos);
  // Newest approved suggestions first, then the most recently added of our own
  return [...approvedV1(sheet).reverse(), ...seed.slice().reverse()]
    .filter((v, i, all) => all.findIndex((w) => w.id === v.id) === i)
    .slice(0, count);
}
