import { SHEET_URL } from "@/lib/suggestions";

// Takes a suggestion from the wall and adds it to the Google Sheet.
// The video is looked up on YouTube here, so the sheet only ever gets real videos.
export async function POST(request: Request) {
  if (!SHEET_URL) {
    return Response.json({ error: "Suggestions aren't switched on yet." }, { status: 503 });
  }
  let id = "";
  try {
    id = String((await request.json()).id ?? "");
  } catch {}
  if (!/^[\w-]{11}$/.test(id)) {
    return Response.json({ error: "That doesn't look like a YouTube link." }, { status: 400 });
  }

  const yt = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
  );
  if (!yt.ok) {
    return Response.json({ error: "Couldn't find that video. It may be private or removed." }, { status: 404 });
  }
  const { title, author_name: channel } = await yt.json();

  const res = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // Apps Script reads the raw body
    body: JSON.stringify({ id, title, channel }),
  });
  if (!res.ok) {
    return Response.json({ error: "Something went wrong sending that. Try again in a minute." }, { status: 502 });
  }
  return Response.json({ id, title, channel });
}
