"use client";

import { useCycle } from "@/lib/use-cycle";

// A YouTube thumbnail that, with the look switch's "cycle" idea on, steps
// through the video's three frames while the pointer is on it
// (lib/use-cycle.ts). Off, it's a plain <img>.

type Props = { id: string; src: string } & Omit<React.ComponentProps<"img">, "src">;

export default function CycleThumb({ id, src, alt = "", ...img }: Props) {
  const cycle = useCycle(id);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cycle.src ?? src} alt={alt} {...img} {...cycle.bind} />;
}
