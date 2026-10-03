"use client";

import { useEffect, useState } from "react";
import { daysBetween, londonParts, useLondonNow } from "@/lib/clock";
import { films } from "@/lib/films";
import { useLook } from "@/lib/use-look";

// The About profile's live rows (the building look): the wall's count and
// the days since the last night. About is built once, ahead, so these are
// filled in the browser, and only with the look on: nobody else reads the
// sheet for them.

export default function ProfileStats() {
  return useLook("building") ? <Stats /> : null;
}

function Stats() {
  const [onWall, setOnWall] = useState<number>();
  useEffect(() => {
    fetch("/api/wall-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setOnWall(d?.count))
      .catch(() => {});
  }, []);

  // No row until a night has gone by (London time, the look switch's ?today included)
  const now = useLondonNow();
  const today = now ? londonParts(now).isoDate : undefined;
  const last = today ? films.filter((f) => f.date < today).at(-1) : undefined;
  const ago = last && today ? daysBetween(last.date, today) : undefined;

  return (
    <>
      <dt>On the wall</dt>
      <dd>{onWall}</dd>
      {ago !== undefined && (
        <>
          <dt>Last screening</dt>
          <dd>
            {ago} {ago === 1 ? "day" : "days"} ago
          </dd>
        </>
      )}
    </>
  );
}
