"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLook } from "@/lib/use-look";

// Idea "channel" (app/idea-channel.css): moving to another page is changing
// the channel. A few frames of dithered static over the new page as it
// arrives, then it clears. It plays over the page once it's there, so it
// never holds anything up.

const STATIC = "/intro/static.png";

export default function Channel() {
  const on = useLook("channel");
  const path = usePathname();
  const [last, setLast] = useState(path);
  const [changes, setChanges] = useState(0);
  // Counted while rendering, so the static arrives with the new page, not a frame after
  if (path !== last) {
    setLast(path);
    setChanges(changes + 1);
  }
  // Fetched ahead, or the first change would be over before the static arrived
  useEffect(() => {
    if (on) new Image().src = STATIC;
  }, [on]);
  if (!on || changes === 0) return null;
  // A new key each time, so the animation starts again
  return <div key={changes} className="channel-static" aria-hidden />;
}
