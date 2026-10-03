"use client";

import { londonParts, useLondonNow } from "@/lib/clock";
import { useLook } from "@/lib/use-look";

// The Tonight idea (lib/look.ts): on the night itself, London time with the
// look switch's ?today, "Tonight" in place of a film's date or the Next
// screening heading. Pages are built ahead, so the server and first paint
// show the fallback, and so does every other day.

export default function Tonight({ date, fallback }: { date: string; fallback: React.ReactNode }) {
  const now = useLondonNow();
  const on = useLook("tonight");
  return on && now && londonParts(now).isoDate === date ? <span className="tonight">Tonight</span> : fallback;
}
