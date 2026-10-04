import { STATUS_MAX, suggestionStates } from "@/lib/suggestions";
import { isVideoId } from "@/lib/videos";

// Where a browser's own suggestions have got to: ?ids=id,id,... (up to
// STATUS_MAX) answers {states: {id: "waiting" | "wall" | "withdrawn" | "gone"}}.
// Kept for half a minute; the browser asks again every minute or so.
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(","))];
  if (raw.length > 1000 || ids.length > STATUS_MAX || !ids.every(isVideoId)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const states = await suggestionStates(ids.sort());
  if (!states) return Response.json({ error: "Couldn't reach the sheet" }, { status: 502 });
  return Response.json(
    { states },
    // Only shared caches keep it: a browser serving its own stale copy would hide an approval
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30" } },
  );
}
