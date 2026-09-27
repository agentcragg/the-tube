// Fun lab idea: signature. One move per film page. Everything except the lower
// third is CSS in app/fun/signature.css.
import type { Film } from "@/lib/films";
import { LOWER_THIRDS } from "./moves";

// Film page, overlaid on the main still (client). A local-TV lower third for
// the films that have one; nothing for the rest. It repeats what the page
// already says, so screen readers skip it.
export function SignatureStill({ film }: { film: Film }): React.ReactNode {
  const caption = LOWER_THIRDS[film.slug];
  if (!caption || !film.extra) return null; // no Q&A on the night, no lower third
  return (
    <div className="sig-lower" aria-hidden="true">
      <div className="sig-lower-bars">
        <span className="sig-lower-name">{film.title}</span>
        <span className="sig-lower-caption">{caption}</span>
      </div>
    </div>
  );
}
