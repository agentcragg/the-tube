import { daysUntil, films, formatDate } from "@/lib/films";

// A small "Next at The Tube" box that other sites can embed in an iframe,
// the way 2008 blogs and profiles collected widgets.
export const metadata = { title: "The Tube widget" };
export const revalidate = 3600; // keep the countdown current

export default function Widget() {
  const next = films[0];
  const days = daysUntil(next.date);
  return (
    <a className="widget" href={`/films/${next.slug}`} target="_blank" rel="noreferrer">
      <span className="widget-logo">THE TUBE</span>
      <span className="widget-body">
        <span className="widget-label">Next screening</span>
        <strong>{next.title}</strong>
        <span>
          {formatDate(next.date)} · {days} days to go
        </span>
      </span>
    </a>
  );
}
