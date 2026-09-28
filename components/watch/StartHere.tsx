// The top of a film page's sidebar on desktop: the Rabbit hole's first clip,
// big, level with the still, so the hole shows on the first screen. The card
// links to #v-{id}, which plays it down in the shelves. Then the shelves by
// name and how deep it goes. RabbitHole handles these links' clicks. Hidden
// on phones, where the shelves already follow the notes.

import { COPY, depth, watchUrl, type WatchData } from "@/lib/rabbit-hole";
import ClipCard from "./ClipCard";

export default function StartHere({ data }: { data: WatchData }) {
  const first = data.sections[0]?.clips[0];
  if (!first) return null;

  return (
    <section className="box rh-start">
      <div className="box-head">
        <h2>{COPY.title}</h2>
      </div>
      <div className="box-body">
        <p className="rh-start-label">{COPY.startHere}</p>
        {/* Lazy, so a phone, where the box is hidden, never loads it */}
        <ClipCard clip={first} href={first.embed === false ? watchUrl(first) : `#v-${first.id}`} lazy />
        <p className="rh-further">{COPY.furtherDown}</p>
        <ul className="rh-further-list">
          {data.sections.map((s, n) => (
            <li key={s.heading}>
              <a href={`#rh-${n + 1}`}>
                {s.heading} ({s.clips.length})
              </a>
            </li>
          ))}
        </ul>
        <p className="rh-start-depth">{COPY.depth(depth(data))}</p>
      </div>
    </section>
  );
}
