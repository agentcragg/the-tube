"use client";

import { useEffect } from "react";
import type { Trailer } from "@/lib/fun/trailer";
import { closeTrailer, useOpenTrailer } from "./store";
import TrailerPlayer from "./TrailerPlayer";

// Sits in the main still's frame and swaps in the player once the
// "Watch trailer" button is pressed. Until then it renders nothing.
export default function TrailerStill({ slug, trailer }: { slug: string; trailer: Trailer }) {
  const open = useOpenTrailer() === slug;

  // Leaving the page (or moving to another film) puts the still back
  useEffect(() => () => closeTrailer(slug), [slug]);

  return open ? <TrailerPlayer key={slug} slug={slug} trailer={trailer} /> : null;
}
