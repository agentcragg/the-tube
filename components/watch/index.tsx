// The Rabbit hole as a 2008 YouTube watch-page sidebar:
// More From the director (open), Related Videos, Statistics & Data (honours
// and sites linking to the film) and, where one existed, the film's old IMDb
// message board. Native <details>, so no JS beyond the thumbnails' scrubbing
// and the last honour's tense. Data: lib/watch.ts. Films without data
// keep the plain Rabbit hole box (see the film page).

import Scrubber from "@/components/Scrubber";
import type { Film } from "@/lib/films";
import { COPY, HOUSE_HONOUR, watchFor, type Clip } from "@/lib/watch";
import { thumb } from "@/lib/videos";
import HouseHonour from "./HouseHonour";

const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// "https://www.example.com/page" → "example.com/page"
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

function ClipRow({ clip }: { clip: Clip }) {
  const from = [clip.by, clip.year].filter(Boolean).join(" · ");
  return (
    <li>
      <a className="wp-clip" href={watchUrl(clip.id)} target="_blank" rel="noreferrer">
        {/* YouTube's own frames: the 4:3 still, then its three auto thumbnails */}
        <Scrubber
          frames={[thumb(clip.id, "hq"), thumb(clip.id, 1), thumb(clip.id, 2), thumb(clip.id, 3)]}
          seed={clip.id}
          alt=""
          duration={clip.length}
          lazy
        />
        <span className="wp-clip-text">
          <strong>{clip.title}</strong>
          {from && <em>{clip.by ? `${COPY.from} ${from}` : from}</em>}
        </span>
      </a>
    </li>
  );
}

// Film page sidebar, after Also showing, in place of the Rabbit hole box.
export function WatchPanels({ film }: { film: Film }): React.ReactNode {
  const data = watchFor(film.slug);
  if (!data) return null;

  const more = data.moreFrom?.clips.length ? data.moreFrom : undefined;
  const related = data.related?.length ? data.related : undefined;
  const honours = data.honours ?? [];
  const linking = data.linking?.length ? data.linking : undefined;
  const boards = data.boards?.threads.length ? data.boards : undefined;
  const linkingId = `wp-linking-${film.slug}`;

  return (
    <div className="wp-group">
      {more && (
        <details className="wp" open>
          <summary>
            {COPY.moreFrom} {more.name}
          </summary>
          <ul className="wp-clips">
            {more.clips.map((c) => (
              <ClipRow key={c.id} clip={c} />
            ))}
          </ul>
          {more.url && (
            <p className="wp-foot">
              <a href={more.url} target="_blank" rel="noreferrer">
                {COPY.allVideos}
              </a>
            </p>
          )}
        </details>
      )}

      {related && (
        <details className="wp">
          <summary>{COPY.related}</summary>
          <ul className="wp-clips wp-scroll">
            {related.map((c) => (
              <ClipRow key={c.id} clip={c} />
            ))}
          </ul>
        </details>
      )}

      {/* Always has at least one honour: the night itself */}
      <details className="wp">
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
        <details className="wp">
          <summary>{boards.label}</summary>
          <div className="wp-body">
            <ul className="wp-threads">
              {boards.threads.map((t) => (
                <li key={t.title}>
                  <a href={t.url} target="_blank" rel="noreferrer">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
