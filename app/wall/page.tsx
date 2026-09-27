import Wall from "@/components/Wall";
import { seedVideos, withYouTubeDetails } from "@/lib/videos";

export const metadata = { title: "Suggest a video · The Tube" };

export default async function WallPage() {
  return <Wall videos={await withYouTubeDetails(seedVideos)} />;
}
