import { wallVideos } from "@/lib/suggestions";

// How many videos are on the wall, for the About profile in the building look
// (components/ProfileStats.tsx). About stays a page built once, ahead; the
// sheet read here is cached like everywhere else (lib/suggestions.ts).
export async function GET() {
  return Response.json({ count: (await wallVideos()).length });
}
