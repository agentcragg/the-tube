"use client";

import { londonParts, useLondonNow } from "@/lib/clock";
import { formatDate } from "@/lib/films";

// A night's title and date in white plastic letters on a black letterboard,
// the way a cinema puts up what's on (the look switch's "letterboard" idea).
// Each letter sits a little crooked by an amount fixed by its place on the
// board, so the board looks the same on every visit. On the night itself the
// date makes way for "Tonight". Spans only, so it can sit inside a heading.

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function Line({ text }: { text: string }) {
  return (
    <span className="lb-line">
      {text
        .toUpperCase()
        .split(/\s+/)
        .map((word, w) => (
          <span className="lb-word" key={w}>
            {[...word].map((ch, i) => {
              const h = hash(`${text}:${w}:${i}`);
              const style = {
                "--lb-tilt": `${((h % 9) - 4) * 0.4}deg`,
                "--lb-drop": `${((h >> 4) % 3) - 1}px`,
                "--lb-gap": `${(h >> 8) % 3}px`,
              } as React.CSSProperties;
              return (
                <span className="lb-ch" key={i} style={style}>
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
    </span>
  );
}

export default function Letterboard({ title, date, className }: { title: string; date: string; className?: string }) {
  const now = useLondonNow();
  const tonight = now !== null && londonParts(now).isoDate === date;
  return (
    <span className={className ? `letterboard ${className}` : "letterboard"} aria-hidden>
      <Line text={title} />
      <Line text={tonight ? "Tonight" : formatDate(date)} />
    </span>
  );
}
