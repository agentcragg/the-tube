"use client";

import { londonParts, useLondonNow } from "@/lib/clock";

// Shows its children once a night is over (London time), like the "Screened"
// honour. Pages are built ahead, so the server and first paint show nothing.
// Used on film pages for the laurel, the night's age and "Screened" in place
// of Book.

export default function Screened({ date, children }: { date: string; children: React.ReactNode }) {
  const now = useLondonNow();
  return now !== null && londonParts(now).isoDate > date ? children : null;
}
