"use client";

import { useLondonNow } from "@/lib/clock";
import { formatDate, runningTime, type Film } from "@/lib/films";
import { COPY, type Night } from "@/lib/fun/nights";
import { thumb } from "@/lib/videos";
import { clock, length, onNow, secondsInto, timeline, youtube } from "./timeline";

// Film page, under Programme notes: the night as a setlist. The shorts stay
// sealed (grey, runtime only) until each one starts on the night, so after
// the night this is the record of what screened. Sealed on the server.

type Row = { time: string; label: string; items: number[]; shorts?: boolean };

export default function RunningOrderBox({
  film,
  night,
  channels,
}: {
  film: Film;
  night: Night;
  channels: Record<string, string>;
}) {
  const now = useLondonNow();
  const { doors, items, end } = timeline(film, night);
  const t = now ? secondsInto(film.date, now) : null;
  const shown = (start: number) => t !== null && t >= start;

  const shorts = items.flatMap((item, i) => (item.kind === "short" ? [{ ...item, i }] : []));
  const shortsSeconds = shorts.reduce((sum, s) => sum + s.short.seconds, 0);

  const rows: Row[] = [{ time: night.doors, label: COPY.doors, items: [] }];
  if (night.shorts && shorts.length) {
    rows.push({
      time: night.shorts.start,
      label: COPY.shorts(Math.round(shortsSeconds / 60)),
      items: shorts.map((s) => s.i),
      shorts: true,
    });
  }
  items.forEach((item, i) => {
    if (item.kind === "feature") rows.push({ time: clock(item.start), label: COPY.feature(runningTime(film)), items: [i] });
    if (item.kind === "extra") rows.push({ time: clock(item.start), label: item.label, items: [i] });
  });

  // Which row is on, while the night is on
  const live = t !== null && t >= doors && t < end;
  const itemNow = live ? onNow(items, t) : -1;
  const rowNow = !live ? -1 : itemNow < 0 ? 0 : rows.findIndex((r) => r.items.includes(itemNow));

  let seal: string | null = null;
  if (shorts.length && !shown(shorts[0].start)) {
    seal =
      t === null || t < 0
        ? COPY.sealedUntilDay(formatDate(film.date))
        : COPY.sealedUntilTonight(clock(shorts[0].start));
  } else if (shorts.length && !shown(shorts[shorts.length - 1].start)) {
    seal = COPY.opening;
  }

  return (
    <section className="box run-order">
      <div className="box-head">
        <h2>Running order</h2>
      </div>
      <div className="box-body">
        <ol className="run-list">
          {rows.map((row, r) => (
            <li key={row.time + row.label} className={r === rowNow ? "is-now" : undefined} aria-current={r === rowNow || undefined}>
              <time>{row.time}</time>
              <span className="run-what">
                {row.label}
                {r === rowNow && (
                  <>
                    {" "}
                    <span className="run-on">{COPY.onNow}</span>
                  </>
                )}
              </span>
              {row.shorts && (
                <>
                  <ul className="run-tiles">
                    {shorts.map(({ short, start, i }) =>
                      shown(start) ? (
                        <li key={short.id} className={i === itemNow ? "run-tile is-now" : "run-tile"}>
                          <a href={youtube(short.id)} target="_blank" rel="noreferrer">
                            <span className="run-pic">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={thumb(short.id, "hq")} alt="" loading="lazy" />
                              <span className="scrub-time">{length(short.seconds)}</span>
                            </span>
                            <strong>{short.title}</strong>
                            <em>
                              {[channels[short.id], short.uploaded, short.quality].filter(Boolean).join(" · ")}
                            </em>
                          </a>
                        </li>
                      ) : (
                        <li key={short.id} className="run-tile is-sealed">
                          <span className="run-pic" role="img" aria-label={COPY.sealedShort(length(short.seconds))}>
                            <span className="scrub-time">{length(short.seconds)}</span>
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                  {seal && <p className="run-seal">{seal}</p>}
                </>
              )}
            </li>
          ))}
        </ol>
        <p className="run-foot">{COPY.approximate}</p>
      </div>
    </section>
  );
}
