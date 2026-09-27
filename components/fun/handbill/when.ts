import { daysBetween, londonParts } from "@/lib/clock";

// The label at the start of the handbill strip. Written in sentence case and
// set in capitals by CSS, so screen readers say "Tonight", not "T O N I G H T".

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Worked out from the ISO date itself, so it can't drift with anyone's time zone
function split(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, month: MONTHS[m - 1], d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "Tue 19 Jan" */
export function shortDate(iso: string) {
  const { d, month, wd } = split(iso);
  return `${DAYS[wd]} ${d} ${month}`;
}

export type When = {
  label: string;
  // date: the label is the date itself; soon: within the week; past: already shown
  kind: "date" | "soon" | "past";
};

/**
 * Tonight / Tomorrow / Next Tuesday / Tue 19 Jan / Shown 19 Jan 2027, by the
 * London date. `now` is null on the server, which gets the plain date.
 */
export function handbillWhen(iso: string, now: Date | null): When {
  if (!now) return { label: shortDate(iso), kind: "date" };
  const days = daysBetween(londonParts(now).isoDate, iso);
  const { y, month, d, wd } = split(iso);
  if (days < 0) return { label: `Shown ${d} ${month} ${y}`, kind: "past" };
  if (days === 0) return { label: "Tonight", kind: "soon" };
  if (days === 1) return { label: "Tomorrow", kind: "soon" };
  if (days < 7) return { label: `Next ${DAY_NAMES[wd]}`, kind: "soon" };
  return { label: shortDate(iso), kind: "date" };
}
