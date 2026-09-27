"use client";

import { useEffect, useState } from "react";

// Floating panel for trying colour: a hero palette for the whole site, and
// an optional "film colours" mode where each film takes its colour from its
// own stills. Remembered in this browser; red with film colours off is the
// default everyone else sees.

const PALETTES = [
  { id: "red", label: "Red (current)", swatch: "#cc0000" },
  { id: "honey", label: "Honey", swatch: "#f29500" },
  { id: "velvet", label: "Velvet", swatch: "#7b1e3a" },
  { id: "blue", label: "Projector blue", swatch: "#1f73d6" },
  { id: "coded", label: "Colour-coded sections", swatch: "linear-gradient(90deg,#f08a00,#2f7ad6,#8a4fc4,#3f9a3a)" },
];
const KEY = "tube-colour-lab";

export default function ColourLab() {
  const [palette, setPalette] = useState("red");
  const [film, setFilm] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let saved: { palette?: string; film?: boolean; open?: boolean } = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {}
    /* eslint-disable react-hooks/set-state-in-effect -- one-off restore from storage */
    if (saved.palette && PALETTES.some((p) => p.id === saved.palette)) setPalette(saved.palette);
    if (saved.film) setFilm(true);
    if (saved.open === false) setOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (palette === "red") delete html.dataset.palette;
    else html.dataset.palette = palette;
    html.classList.toggle("x-film", film);
  }, [palette, film]);

  // Saved only when you change something, so loading the page never overwrites it
  const save = (next: { palette: string; film: boolean; open: boolean }) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="colour-lab">
      <button
        className="colour-lab-head"
        onClick={() => {
          setOpen(!open);
          save({ palette, film, open: !open });
        }}
        aria-expanded={open}
      >
        Colour lab <span>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="colour-lab-body">
          <p>Hero colour</p>
          {PALETTES.map((p) => (
            <label key={p.id}>
              <input
                type="radio"
                name="palette"
                checked={palette === p.id}
                onChange={() => {
                  setPalette(p.id);
                  save({ palette: p.id, film, open });
                }}
              />
              <span className="swatch" style={{ background: p.swatch }} />
              {p.label}
            </label>
          ))}
          <p>Films</p>
          <label>
            <input
              type="checkbox"
              checked={film}
              onChange={() => {
                setFilm(!film);
                save({ palette, film: !film, open });
              }}
            />
            Each film brings its own colour
          </label>
        </div>
      )}
    </div>
  );
}
