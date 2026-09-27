import type { Video } from "./videos";

// Public suggestions live in a Google Sheet (see sheet/suggestions.gs).
// Suggestions are added as rows; ticking "On the wall?" approves one.
// Set SUGGESTIONS_SHEET_URL (the Apps Script web app URL) in Vercel to switch this on.

export const SHEET_URL = process.env.SUGGESTIONS_SHEET_URL;

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
