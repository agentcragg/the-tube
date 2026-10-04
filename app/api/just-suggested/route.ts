import { latestVideos } from "@/lib/suggestions";
import { credit } from "@/lib/videos";

// The newest suggestions on the wall, for the ticker under the tabs (the look
// switch's "ticker" idea, components/Ticker.tsx). Only fetched with that on,
// so the pages themselves stay as they're built; the sheet read is cached
// like everywhere else (lib/suggestions.ts).
export async function GET() {
  const videos = await latestVideos(8);
  return Response.json(videos.map((v) => ({ id: v.id, title: v.title || v.channel || "", credit: credit(v) })));
}
