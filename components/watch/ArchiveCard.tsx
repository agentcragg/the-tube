// One of a film's old websites as the Wayback Machine keeps it: a screenshot
// in a plain grey browser window, its old address in the bar, and the day it
// was archived underneath. The whole card opens the Wayback copy. The
// screenshots are static files in public/archive/<slug>/, so the page never
// calls the Wayback Machine itself. Used by the Rabbit hole's last shelf.

import type { Link } from "@/lib/rabbit-hole";

// DRAFT
const WAYBACK = "Wayback Machine »";

// "http://web.archive.org/web/20070602094317/http://www.usident.org:80/"
// → "http://www.usident.org/"
const original = (url: string) => url.replace(/^.*?\/web\/\d+[a-z_]*\//, "").replace(/:80\//, "/");

// "http://www.usident.org/" → "usident.org"
const domain = (url: string) => new URL(url).hostname.replace(/^www\./, "");

// "2007-06-02" → "2 Jun 2007", the same in every browser and time zone
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso + "T00:00:00Z"),
  );

export default function ArchiveCard({ link }: { link: Link & { shot: string } }) {
  const address = original(link.url);
  // "... (Wayback Machine)": the caption's second line already says so
  const label = link.label.replace(/\s*\([^)]*Wayback Machine[^)]*\)$/, "");
  return (
    <a className="rh-site" href={link.url} target="_blank" rel="noreferrer">
      <figure>
        <div className="rh-frame">
          <div className="rh-window" aria-hidden>
            <span className="rh-window-title">{domain(address)}</span>
            <span className="rh-window-buttons">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="rh-address" aria-hidden>
            <span>{address}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={link.shot} alt="" loading="lazy" width={800} height={600} />
        </div>
        <figcaption>
          <strong>{label}</strong>
          <em>
            {link.archived && `${day(link.archived)} · `}
            {WAYBACK}
          </em>
        </figcaption>
      </figure>
    </a>
  );
}
