import type { Video } from "./videos";

// Public suggestions live in a Google Sheet (see sheet/suggestions.gs).
// Suggestions are added as rows; ticking "On the wall?" approves one.
// The Apps Script web app URL; SUGGESTIONS_SHEET_URL overrides it if set.
// Anyone with this URL can add rows, but nothing reaches the wall without a tick.

export const SHEET_URL =
  process.env.SUGGESTIONS_SHEET_URL ??
  "https://script.google.com/macros/s/AKfycbzM2rCwMZuK_PavJTwYl-6sFNIr4n3BU4NYELmjtU3hanDR3SnXRjLzmlhEWwj07qAG/exec";

// Approved suggestions, refreshed every few minutes so ticks show up quickly
export async function approvedSuggestions(): Promise<Video[]> {
  if (!SHEET_URL) return [];
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { videos?: Video[] };
    return (data.videos ?? []).filter((v) => /^[\w-]{11}$/.test(v.id));
  } catch {
    return [];
  }
}
