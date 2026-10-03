import { daysBetween } from "./clock";

// How long ago a London date was, the way YouTube wrote it in 2008. A day is
// the smallest step: the sheet's dates and the nights have no time of day.

// DRAFT wording: "today", "yesterday", "3 days ago", "2 weeks ago",
// "4 months ago", "1 year ago". Nothing for a date still to come.
export function ago(iso: string, todayIso: string): string | undefined {
  const days = daysBetween(iso, todayIso);
  if (days < 0) return undefined;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  const [n, unit] =
    days < 7
      ? [days, "day"]
      : days < 31
        ? [Math.floor(days / 7), "week"]
        : days < 365
          ? [Math.max(1, Math.floor(days / 30.44)), "month"]
          : [Math.floor(days / 365), "year"];
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

// Spelt out rather than left to Intl, whose en-GB September is "Sept" in
// some browsers and "Sep" in others, which would trip up hydration
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "30 Sep 2026", the same in every browser and time zone. */
export function fullDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
