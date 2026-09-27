"use client";

import { useEffect, useState } from "react";
import { CLOCK_EVENT, PRETEND_KEY } from "@/lib/clock";

// Floating panel for trying the design ideas. Each tickbox adds a class to
// <html> (e.g. "x-handbill"); an idea's pieces only show while it's on.
// "Pretend it's…" sets a fake London time so time-based ideas can be seen
// before the first screening. Everything is remembered in this browser only;
// everyone else sees the site with every idea off.

export const IDEAS = [
  { id: "handbill", label: "1. Weekly handbill" },
  { id: "running", label: "2. Tuesday running order" },
  { id: "watch", label: "3. Watch-page rabbit hole" },
  { id: "card", label: "4. Programmer's card" },
  { id: "endeavour", label: "5. Endeavour, drawn" },
  { id: "trailer", label: "6. Trailer, made to feel made" },
  { id: "signature", label: "7. One move per film" },
  { id: "laurels", label: "8. Laurels on the wall" },
] as const;

// Handy moments around the first night (Southland Tales, Tue 19 Jan 2027) and after it
const PRETEND = [
  { value: "", label: "Real time" },
  { value: "2027-01-18T12:00:00Z", label: "Mon 18 Jan 2027, noon (night before)" },
  { value: "2027-01-19T15:00:00Z", label: "Tue 19 Jan 2027, 3pm (day of)" },
  { value: "2027-01-19T20:40:00Z", label: "Tue 19 Jan 2027, 8:40pm (during the film)" },
  { value: "2027-01-19T22:50:00Z", label: "Tue 19 Jan 2027, 10:50pm (after)" },
  { value: "2027-01-20T03:14:00Z", label: "Wed 20 Jan 2027, 3:14am" },
  { value: "2027-01-21T10:00:00Z", label: "Thu 21 Jan 2027, 10am (week after)" },
  { value: "2027-03-02T20:10:00Z", label: "Tue 2 Mar 2027, 8:10pm (Nebraska City)" },
];

const KEY = "tube-fun-lab";

export default function FunLab() {
  const [on, setOn] = useState<string[]>([]);
  const [open, setOpen] = useState(true);
  const [pretend, setPretend] = useState("");

  useEffect(() => {
    let saved: { on?: string[]; open?: boolean } = {};
    let savedPretend = "";
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      savedPretend = localStorage.getItem(PRETEND_KEY) ?? "";
    } catch {}
    /* eslint-disable react-hooks/set-state-in-effect -- one-off restore from storage */
    if (saved.on) setOn(saved.on);
    if (saved.open === false) setOpen(false);
    setPretend(savedPretend);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    for (const idea of IDEAS) html.classList.toggle(`x-${idea.id}`, on.includes(idea.id));
  }, [on]);

  // Saved only when you change something, so loading a page never overwrites it
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
  const allOn = on.length === IDEAS.length;

  const changePretend = (value: string) => {
    setPretend(value);
    try {
      if (value) localStorage.setItem(PRETEND_KEY, value);
      else localStorage.removeItem(PRETEND_KEY);
    } catch {}
    window.dispatchEvent(new Event(CLOCK_EVENT));
  };

  return (
    <div className="fun-lab">
      <button
        className="fun-lab-head"
        onClick={() => {
          setOpen(!open);
          save(on, !open);
        }}
        aria-expanded={open}
      >
        Fun lab {on.length > 0 && `(${on.length} on)`} <span>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="fun-lab-body">
          {IDEAS.map((idea) => (
            <label key={idea.id}>
              <input type="checkbox" checked={on.includes(idea.id)} onChange={() => toggle(idea.id)} />
              {idea.label}
            </label>
          ))}
          <button className="fun-lab-all" onClick={() => setIdeas(allOn ? [] : IDEAS.map((i) => i.id))}>
            {allOn ? "Turn all off" : "Turn all on"}
          </button>
          <label className="fun-lab-pretend">
            Pretend it&apos;s…
            <select value={pretend} onChange={(e) => changePretend(e.target.value)}>
              {PRETEND.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
