import Wall from "@/components/Wall";
import { wallVideos } from "@/lib/suggestions";

export const metadata = { title: "Suggest a video · The Tube" };

export default async function WallPage() {
  return <Wall videos={await wallVideos()} />;
}
