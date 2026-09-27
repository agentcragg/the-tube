"use client";

import type { Film } from "@/lib/films";
import { cardFor, type FrameNote } from "@/lib/fun/card";

// Scrubber shows generated placeholders when a film has no stills
const PLACEHOLDER_FRAMES = 4;

// Where the label goes: under the box, or above it when the box reaches into
// the bottom quarter; lined up with the box's left edge, or its right edge
// when the box is in the right half.
function labelPosition(n: FrameNote): React.CSSProperties {
  const above = n.y + n.h > 75;
  const right = n.x + n.w / 2 > 50;
  return {
    ...(above ? { bottom: `calc(${100 - n.y}% + 4px)` } : { top: `calc(${n.y + n.h}% + 4px)` }),
    ...(right ? { right: `${100 - n.x - n.w}%` } : { left: `${n.x}%` }),
  };
}

// Film page, over the main still. Flickr-style notes: a thin box in the film's
// colour and a signed label, shown only while scrubbing past that frame. Small
// ticks on the scrub bar are the only hint. On touch screens the note shows as
// a line under the still for the frame swiped to.
export function FrameNotes({ film, frame }: { film: Film; frame: number }): React.ReactNode {
  const count = film.stills.length || PLACEHOLDER_FRAMES;
  const notes = (cardFor(film.slug).frameNotes ?? []).filter((n) => n.frame >= 0 && n.frame < count);
  if (notes.length === 0) return null;
  const note = notes.find((n) => n.frame === frame);

  return (
    <>
      <div className="frame-notes">
        {note && (
          <>
            <div
              className="frame-note"
              style={{ left: `${note.x}%`, top: `${note.y}%`, width: `${note.w}%`, height: `${note.h}%` }}
            />
            <p className="frame-note-text" style={labelPosition(note)}>
              {note.text} <em>— {note.by}</em>
            </p>
          </>
        )}
        {count > 1 && (
          <div className="frame-ticks" aria-hidden>
            {notes.map((n) => (
              <i key={`${n.frame}-${n.x}-${n.y}`} style={{ left: `${((n.frame + 0.5) / count) * 100}%` }} />
            ))}
          </div>
        )}
      </div>
      {note && (
        <p className="frame-caption">
          {note.text} <em>— {note.by}</em>
        </p>
      )}
    </>
  );
}
