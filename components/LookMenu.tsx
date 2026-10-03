"use client";

import { useEffect, useState } from "react";
import { EXAMPLES, IDEAS, readLook, writeLook, type Look } from "@/lib/look";

// The look switch's menu (lib/look.ts): only shown in a browser that has
// visited a page with ?look. Any change saves and reloads the page, so the
// server-rendered parts and the clock pick it up too.

export default function LookMenu() {
  const [look, setLook] = useState<Look | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of storage
    setLook(readLook());
  }, []);

  if (!look) return null;

  const change = (next: Look | null) => {
    writeLook(next);
    location.reload();
  };
  // Opening and closing the menu needs no reload
  const toggleOpen = () => {
    const next = { ...look, closed: !look.closed };
    writeLook(next);
    setLook(next);
  };
  const on = (id: string) => look.ideas.includes(id);

  return (
    <div className="look-menu">
      <button className="look-menu-head" onClick={toggleOpen} aria-expanded={!look.closed}>
        Look{look.example ? `: ${EXAMPLES.find((e) => e.id === look.example)?.label ?? ""}` : ""}
        {look.ideas.length > 0 && ` (+${look.ideas.length})`} <span>{look.closed ? "+" : "–"}</span>
      </button>
      {!look.closed && (
        <div className="look-menu-body">
          <label className="look-menu-row">
            Example
            <select
              value={look.example ?? ""}
              onChange={(e) => change({ ...look, example: e.target.value || undefined })}
            >
              <option value="">None: the site as it is</option>
              {EXAMPLES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Ideas</legend>
            {IDEAS.map((i) => (
              <label key={i.id}>
                <input
                  type="checkbox"
                  checked={on(i.id)}
                  onChange={() =>
                    change({ ...look, ideas: on(i.id) ? look.ideas.filter((x) => x !== i.id) : [...look.ideas, i.id] })
                  }
                />
                {i.label}
              </label>
            ))}
          </fieldset>
          <label className="look-menu-row">
            Pretend it&apos;s
            <input
              type="date"
              value={look.today ?? ""}
              onChange={(e) => change({ ...look, today: e.target.value || undefined })}
            />
          </label>
          <button className="look-menu-off" onClick={() => change(null)}>
            Turn everything off
          </button>
        </div>
      )}
    </div>
  );
}
