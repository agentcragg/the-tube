// A film page's watch-page parts, 2008 YouTube style. The Rabbit hole goes in
// the main column under the programme notes (RabbitHole); the sidebar opens
// with these panels: Statistics & Data (honours and sites linking to the
// film), and, where one existed, the film's old IMDb message board, both
// open. Native <details>, so no JS beyond the last honour's tense. Data:
// lib/watch.ts. Films without clips keep the plain Rabbit hole box and get
// none of this (see the film page).

import type { Film } from "@/lib/films";
import { COPY, HOUSE_HONOUR, type WatchData } from "@/lib/rabbit-hole";
import HouseHonour from "./HouseHonour";

export { default as RabbitHole } from "./RabbitHole";

// "https://www.example.com/page" → "example.com/page"
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

// "https://web.archive.org/web/20070427192609/…" → "2007"
const captured = (url: string) => url.match(/\/web\/(\d{4})/)?.[1];

// Film page sidebar, above Also showing
export function WatchPanels({ film, data }: { film: Film; data: WatchData }): React.ReactNode {
  const honours = data.honours ?? [];
  // The pages written about it, and the other links that come with the clips
  const all = [
    ...(data.linking ?? []),
    ...(data.links ?? []).filter((l) => !l.shot).map((l) => ({ url: l.url, year: l.year ?? "" })),
  ];
  const linking = all.length ? all : undefined;
  const boards = data.boards?.threads.length ? data.boards : undefined;
  const linkingId = `wp-linking-${film.slug}`;

  return (
    <div className="wp-group">
      {/* Always has at least one honour: the night itself */}
      <details className="wp" open>
        <summary>{COPY.stats}</summary>
        <div className="wp-body wp-stats">
          <h4>{COPY.honours(honours.length + 1)}</h4>
          <ol>
            {honours.map((h) => (
              <li key={h}>{h}</li>
            ))}
            <li>
              <HouseHonour date={film.date} {...HOUSE_HONOUR} />
            </li>
          </ol>
          {linking && (
            <>
              <h4 id={linkingId}>{COPY.linking(linking.length)}</h4>
              <table className="wp-linking" aria-labelledby={linkingId}>
                <tbody>
                  {linking.map((l) => (
                    <tr key={l.url}>
                      <td className="wp-year">{l.year}</td>
                      <td className="wp-url">
                        <a href={l.url} target="_blank" rel="noreferrer" title={l.url}>
                          {bare(l.url)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </details>

      {boards && (
        // Open on arrival, so the old thread titles show
        <details className="wp" open>
          <summary>{boards.label}</summary>
          <div className="wp-body">
            <ul className="wp-threads">
              {boards.threads.map((t) => {
                const year = captured(t.url);
                return (
                  <li key={t.title}>
                    <a href={t.url} target="_blank" rel="noreferrer">
                      {t.title}
                    </a>
                    {t.user && <span className="wp-user"> {t.user}</span>}
                    {/* The year of the Wayback copy */}
                    {year && <span className="wp-cap"> ({year})</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
