"use client";

import { londonParts, useLondonNow } from "@/lib/clock";

// On the night itself, London time, "Tonight" in place of a film's date or
// the Next screening heading. Pages are built ahead, so the server and first
// paint show the fallback, and so does every other day.

export default function Tonight({ date, fallback }: { date: string; fallback: React.ReactNode }) {
  const now = useLondonNow();
  return now && londonParts(now).isoDate === date ? <span className="tonight">Tonight</span> : fallback;
}
