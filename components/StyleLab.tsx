"use client";

import { useEffect, useState } from "react";

// Floating panel for trying visual ideas. Each tickbox adds a class to <html>
// (e.g. "x-page"), and the CSS for that idea only applies while it's there.
// Choices are remembered in this browser.

export const IDEAS = [
  { id: "page", label: "Centred page on a pinstripe" },
  { id: "band", label: "Dark header band" },
  { id: "coverflow", label: "Coverflow (front page)" },
  { id: "calendar", label: "Calendar-page dates" },
  { id: "stickers", label: "Starburst stickers" },
  { id: "meter", label: "Seat meters" },
  { id: "fatfooter", label: "Fat footer" },
  { id: "lightbox", label: "Lightbox (click a film page still)" },
] as const;

const KEY = "tube-style-lab";

export default function StyleLab() {
  const [on, setOn] = useState<string[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let saved: { on?: string[]; open?: boolean } = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {}
    /* eslint-disable react-hooks/set-state-in-effect -- one-off restore from storage */
    if (saved.on) setOn(saved.on);
    if (saved.open === false) setOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    for (const idea of IDEAS) html.classList.toggle(`x-${idea.id}`, on.includes(idea.id));
  }, [on]);

  // Saved only when you change something, so loading the page never overwrites it
  const save = (nextOn: string[], nextOpen: boolean) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ on: nextOn, open: nextOpen }));
    } catch {}
  };
  const setIdeas = (next: string[]) => {
    setOn(next);
    save(next, open);
  };
  const toggle = (id: string) => setIdeas(on.includes(id) ? on.filter((x) => x !== id) : [...on, id]);
  const toggleOpen = () => {
    setOpen(!open);
    save(on, !open);
  };
  const allOn = on.length === IDEAS.length;

  return (
    <div className={open ? "style-lab" : "style-lab style-lab-closed"}>
      <button className="style-lab-head" onClick={toggleOpen} aria-expanded={open}>
        Style lab {on.length > 0 && `(${on.length} on)`} <span>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="style-lab-body">
          {IDEAS.map((idea) => (
            <label key={idea.id}>
              <input type="checkbox" checked={on.includes(idea.id)} onChange={() => toggle(idea.id)} />
              {idea.label}
            </label>
          ))}
          <button className="style-lab-all" onClick={() => setIdeas(allOn ? [] : IDEAS.map((i) => i.id))}>
            {allOn ? "Turn all off" : "Turn all on"}
          </button>
        </div>
      )}
    </div>
  );
}
