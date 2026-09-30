"use client";

// Basement TV's comments box: the video's picked YouTube comments, posted one
// at a time while it plays (lib/tv.ts postTimes), newest on top, laid out
// like YouTube's in 2008. Plain text only: React escapes it, line breaks
// are kept by the CSS, and handles aren't links.

import { useState } from "react";
import { COPY, type Comment } from "@/lib/tv";

// A new comment slides in with a yellow fade; one that was already up when
// the visitor tuned in, or came back to the tab, just sits there.
export type Posted = { n: number; comment: Comment; fresh: boolean };

const ThumbUp = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
    <rect x="1.5" y="7" width="3" height="7.5" rx=".5" fill="#9fcf6f" stroke="#4d7a2a" />
    <path
      d="M4.5 7.5 7.4 2.6c.5-.9 2.1-.6 2 .6L9 6.5h3.9c1 0 1.7.9 1.4 1.8l-1.5 5c-.2.7-.8 1.2-1.5 1.2H4.5z"
      fill="#b9e08f"
      stroke="#4d7a2a"
    />
  </svg>
);

const ThumbDown = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
    <g transform="rotate(180 8 8)">
      <rect x="1.5" y="7" width="3" height="7.5" rx=".5" fill="#e79a8f" stroke="#8a3a2e" />
      <path
        d="M4.5 7.5 7.4 2.6c.5-.9 2.1-.6 2 .6L9 6.5h3.9c1 0 1.7.9 1.4 1.8l-1.5 5c-.2.7-.8 1.2-1.5 1.2H4.5z"
        fill="#f2bdb5"
        stroke="#8a3a2e"
      />
    </g>
  </svg>
);

export const BubbleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 2.5h11a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H7l-3 3v-3H2.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" fill="#fff" stroke="#6b7c93" />
    <path d="M4 5.5h8M4 8h5.5" stroke="#9fb3cc" />
  </svg>
);

function Item({ comment, fresh }: { comment: Comment; fresh: boolean }) {
  // Decided once, when it first shows, so a later tick never replays it
  const [slide] = useState(fresh);
  const liked = comment.votes !== "0" && comment.votes !== "";
  return (
    <li className={slide ? "tv-c tv-c-new" : "tv-c"}>
      <div>
        <p className="tv-c-head">
          <b>
            <bdi>{comment.author.replace(/^@/, "")}</bdi>
          </b>{" "}
          {comment.time && <span className="tv-c-time">({comment.time})</span>}
          <span className="tv-c-votes">
            <span className={liked ? "tv-c-score" : "tv-c-score tv-c-zero"}>{comment.votes || "0"}</span>
            <span className="sr-only"> likes</span>
            <ThumbUp />
            <ThumbDown />
          </span>
        </p>
        <p className="tv-c-text" dir="auto">
          {comment.text}
        </p>
      </div>
    </li>
  );
}

export default function Comments({ posted, total }: { posted: Posted[]; total: number | null }) {
  return (
    <section className="box tv-comments">
      <div className="box-head">
        <h2>
          <BubbleIcon /> {COPY.comments}
          {!!total && <span className="tv-c-count">({posted.length})</span>}
        </h2>
      </div>
      <div className="box-body">
        {total === 0 ? (
          <p className="box-empty tv-c-none">{COPY.noComments}</p>
        ) : (
          <ol className="tv-c-list">
            {[...posted].reverse().map(({ n, comment, fresh }) => (
              <Item key={n} comment={comment} fresh={fresh} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
