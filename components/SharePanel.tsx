"use client";

import { useState } from "react";
import { RssIcon, ShareIcon } from "@/components/Icons";

// The Share button and the panel it opens: link, email, the embeddable
// widget, and the RSS feed.
export default function SharePanel({ title, path }: { title: string; path: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Built on click, so it uses whichever address the site is running at
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = `${origin}${path}`;
  const widget = `<iframe src="${origin}/widget" width="300" height="86" style="border:0" title="Next at The Tube"></iframe>`;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <>
      <button className="action" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ShareIcon /> Share
      </button>
      {open && (
        <div className="share-panel">
          <label>
            Link
            <span className="share-row">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              <button onClick={() => copy(link, "link")}>{copied === "link" ? "Copied" : "Copy"}</button>
            </span>
          </label>
          <p>
            <a href={`mailto:?subject=${encodeURIComponent(`${title} at The Tube`)}&body=${encodeURIComponent(link)}`}>
              Email this to a friend
            </a>
          </p>
          <label>
            Get the widget: put the next screening on your blog or profile
            <span className="share-row">
              <input readOnly value={widget} onFocus={(e) => e.currentTarget.select()} />
              <button onClick={() => copy(widget, "widget")}>{copied === "widget" ? "Copied" : "Copy"}</button>
            </span>
          </label>
          <iframe className="share-widget-preview" src="/widget" title="Widget preview" width={300} height={86} />
          <p>
            <a href="/rss.xml" className="rss-link">
              <RssIcon /> Subscribe to upcoming screenings
            </a>
          </p>
        </div>
      )}
    </>
  );
}
