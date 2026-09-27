"use client";

import { londonParts, useLondonNow } from "@/lib/clock";

// The last line of every film's honours: "Screening - Basement of Endeavour -
// Deptford - 2027", which turns to "Screened" once the night is over (London
// time). Pages are built ahead, so the server and first paint say "Screening".

export default function HouseHonour({
  date,
  before,
  after,
  where,
}: {
  date: string; // the film's ISO date
  before: string;
  after: string;
  where: string;
}) {
  const now = useLondonNow();
  const over = now !== null && londonParts(now).isoDate > date;
  return <>{`${over ? after : before} - ${where} - ${date.slice(0, 4)}`}</>;
}
