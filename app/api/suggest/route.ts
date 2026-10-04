import { randomBytes } from "node:crypto";
import { lookUpTikTok, resolveShortTikTok } from "@/app/api/tiktok/lookup";
import { SHEET_URL } from "@/lib/suggestions";
import { parseTikTok, parseYouTubeId } from "@/lib/videos";

// Takes a suggestion from the wall and adds it to the Google Sheet.
// The body is {url} with whatever was pasted (or {id}, a YouTube ID, from older pages).
// The video is looked up on YouTube or TikTok here, so the sheet only ever gets real videos.
// Each suggestion gets a random key, kept by the sheet (version 4 on) and by
// the browser that sent it, which can then withdraw it (./withdraw).
export async function POST(request: Request) {
  if (!SHEET_URL) {
    return Response.json({ error: "Suggestions aren't switched on yet." }, { status: 503 });
  }
  let input = "";
  try {
    const body = await request.json();
    input = String(body.url ?? body.id ?? "");
  } catch {}

  let video: { id: string; title: string; channel: string; url?: string };
  const ytId = parseYouTubeId(input);
  const tt = ytId ? null : parseTikTok(input);
  if (ytId) {
    const yt = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}`,
    );
    if (!yt.ok) {
      return Response.json({ error: "Couldn't find that video. It may be private or removed." }, { status: 404 });
    }
    const { title, author_name: channel } = await yt.json();
    video = { id: ytId, title, channel };
  } else if (tt) {
    const id = "id" in tt ? tt.id : await resolveShortTikTok(tt.short);
    const found = id && (await lookUpTikTok(id.slice(2)));
    if (!id || !found) {
      return Response.json({ error: "Couldn't find that video. It may be private or removed." }, { status: 404 });
    }
    video = { id, title: found.title, channel: found.channel, url: found.url };
  } else {
    return Response.json({ error: "That doesn't look like a YouTube or TikTok link." }, { status: 400 });
  }

  const key = randomBytes(18).toString("base64url");
  let sent: { ok?: boolean; error?: string; key?: boolean } | null = null;
  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // Apps Script reads the raw body
      body: JSON.stringify({ ...video, key }),
    });
    if (res.ok) sent = await res.json();
  } catch {}
  // The first version of the sheet's script only takes YouTube IDs
  if (tt && sent?.ok === false && sent.error === "bad id") {
    return Response.json({ error: "Can't take TikTok links yet." }, { status: 503 });
  }
  if (sent?.ok !== true) {
    return Response.json({ error: "Something went wrong sending that. Try again in a minute." }, { status: 502 });
  }
  // The key only goes back if the sheet kept it: earlier versions ignore it,
  // and a video someone else suggested first stays theirs
  return Response.json(sent.key === true ? { ...video, key } : video);
}
