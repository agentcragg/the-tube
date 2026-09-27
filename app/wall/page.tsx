import Wall from "@/components/Wall";
import { approvedSuggestions } from "@/lib/suggestions";
import { seedVideos, withYouTubeDetails } from "@/lib/videos";

export const metadata = { title: "Suggest a video · The Tube" };

export default async function WallPage() {
  const [seed, approved] = await Promise.all([withYouTubeDetails(seedVideos), approvedSuggestions()]);
  // Approved public suggestions join the wall (skipping any already on it)
  const videos = [...seed, ...approved.filter((a) => !seed.some((s) => s.id === a.id))];
  return <Wall videos={videos} />;
}
