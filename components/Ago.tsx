"use client";

import { ago, fullDay } from "@/lib/ago";
import { londonParts, useLondonNow } from "@/lib/clock";

// A date as an age, "3 days ago", with the date itself in the tooltip. Pages
// are built ahead, so the server and first paint show the date ("30 Sep
// 2026") and the age follows in the browser: a cached page never shows a
// stale age. relativeOnly is for places that already show the date: nothing
// until the age is known.

export default function Ago({ iso, relativeOnly }: { iso: string; relativeOnly?: boolean }) {
  const now = useLondonNow();
  const age = now ? ago(iso, londonParts(now).isoDate) : undefined;
  if (!age && relativeOnly) return null;
  return (
    <time dateTime={iso} title={fullDay(iso)}>
      {age ?? fullDay(iso)}
    </time>
  );
}
