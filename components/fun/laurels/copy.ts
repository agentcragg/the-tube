// Words for the laurels on the wall. "Shown before" comes from the running
// order's copy in lib/fun/nights.ts, so the wall and the Spotlight match.

import { COPY } from "@/lib/fun/nights";

// DRAFT: the three lines inside the laurel; the year is the night's
export const laurelLines = (year: string): [string, string, string] => ["THE TUBE", "DEPTFORD", year];

// DRAFT: read out by screen readers in place of the drawing
export const LAUREL_LABEL = "Screened at The Tube";

export const SHOWN_BEFORE = COPY.shownBefore;
