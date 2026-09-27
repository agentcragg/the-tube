import { Suspense } from "react";
import Wall from "@/components/Wall";
import { films } from "@/lib/films";
import { seedVideos, withYouTubeDetails } from "@/lib/videos";

export const metadata = { title: "Suggest a video · The Tube" };

export default async function WallPage() {
  const videos = await withYouTubeDetails(seedVideos);
  const filmTags = films.map(({ slug, title, tags }) => ({ slug, title, tags }));
  // The wall reads ?tag= and ?show= from the address, which needs a Suspense boundary
  return (
    <Suspense>
      <Wall videos={videos} films={filmTags} />
    </Suspense>
  );
}
