"use client";

import { useState, type Ref } from "react";
import type { Pending, PendingState } from "@/lib/pending";
import { isTikTok, thumb, tikTokThumb } from "@/lib/videos";

// The visitor's own suggestions, docked along the bottom of the wall like 2008
// YouTube's QuickList: newest first, each saying where it's got to. Pressing
// one finds it on the wall; a waiting one can be withdrawn (× then Withdraw).
// Only there when there's something on it.

export type TrayItem = { p: Pending; state: PendingState };

export default function SuggestTray({
  items,
  closed,
  busy,
  fade,
  trayRef,
  onToggle,
  onFind,
  onWithdraw,
}: {
  items: TrayItem[];
  closed: boolean;
  busy: string | null; // being withdrawn
  fade?: { id: string; n: number }; // the yellow fade, on the one just sent or found
  trayRef: Ref<HTMLElement>;
  onToggle: () => void;
  onFind: (p: Pending) => void;
  onWithdraw: (p: Pending) => void;
}) {
  const [asking, setAsking] = useState<string | null>(null); // the one showing Withdraw / Cancel

  return (
    <section ref={trayRef} className={closed ? "tray tray-closed" : "tray"} aria-label="Your suggestions">
      <button className="tray-bar" onClick={onToggle} aria-expanded={!closed}>
        <span className="tray-arrow" aria-hidden="true" />
        Your suggestions
      </button>
      {!closed && (
        <ul className="tray-list">
          {items.map(({ p, state }) => {
            const name = p.title || p.author || "";
            const find = state === "withdrawn" ? undefined : () => onFind(p);
            return (
              <li key={p.id} className={`tray-item tray-${state}${busy === p.id ? " tray-busy" : ""}`}>
                <button className="tray-thumb" onClick={find} disabled={!find} tabIndex={-1} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={isTikTok(p.id) ? tikTokThumb(p.id) : thumb(p.id, "mq")} alt="" draggable={false} />
                  {fade?.id === p.id && <span key={fade.n} className="queue-fade" />}
                </button>
                <span className="tray-text">
                  <button className="tray-title" onClick={find} disabled={!find} title={name}>
                    {name}
                  </button>
                  <span className="tray-state">
                    {state === "waiting" && (
                      <>
                        <span className="queue-spinner" aria-hidden="true" /> Waiting for approval
                      </>
                    )}
                    {state === "wall" && "On the wall"}
                    {state === "withdrawn" && "Withdrawn"}
                  </span>
                </span>
                {state === "waiting" && asking !== p.id && (
                  <button className="tray-x" onClick={() => setAsking(p.id)} aria-label="Withdraw" title="Withdraw">
                    ×
                  </button>
                )}
                {state === "waiting" && asking === p.id && (
                  <span className="tray-ask">
                    <button
                      className="tray-yes"
                      onClick={() => {
                        setAsking(null);
                        onWithdraw(p);
                      }}
                    >
                      Withdraw
                    </button>
                    <button className="tray-no" onClick={() => setAsking(null)}>
                      Cancel
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
