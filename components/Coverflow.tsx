"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, type Film } from "@/lib/films";

// iTunes-style Coverflow of the season. Click a side still (or use the
// arrows / arrow keys) to bring it to the middle; click the middle one to
// open the film. Only shown when the Coverflow idea is switched on.

export default function Coverflow({ films }: { films: Film[] }) {
  const [active, setActive] = useState(0);
  const film = films[active];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!document.documentElement.classList.contains("x-coverflow")) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
      if (e.key === "ArrowRight") setActive((a) => Math.min(films.length - 1, a + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [films.length]);

  return (
    <section className="coverflow" aria-label="This season">
      <div className="coverflow-stage">
        {films.map((f, n) => {
          const d = n - active;
          const style: React.CSSProperties = {
            transform:
              d === 0
                ? "translateX(-50%) translateZ(120px)"
                : `translateX(calc(-50% + ${d * 120 + Math.sign(d) * 110}px)) rotateY(${d < 0 ? 60 : -60}deg)`,
            zIndex: 10 - Math.abs(d),
          };
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.stills[0]} alt={f.title} draggable={false} />
          );
          return d === 0 ? (
            <Link key={f.slug} href={`/films/${f.slug}`} className="coverflow-item on" style={style}>
              {img}
            </Link>
          ) : (
            <button key={f.slug} className="coverflow-item" style={style} onClick={() => setActive(n)}>
              {img}
            </button>
          );
        })}
      </div>
      <div className="coverflow-caption">
        <strong>{film.title}</strong>
        <span>{formatDate(film.date)}</span>
      </div>
      <div className="coverflow-controls">
        <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0} aria-label="Previous">
          ‹
        </button>
        <input
          type="range"
          min={0}
          max={films.length - 1}
          value={active}
          onChange={(e) => setActive(Number(e.target.value))}
          aria-label="Scroll through the season"
        />
        <button
          onClick={() => setActive((a) => Math.min(films.length - 1, a + 1))}
          disabled={active === films.length - 1}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </section>
  );
}
