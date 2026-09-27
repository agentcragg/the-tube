import { films, formatDate } from "@/lib/films";

// RSS feed of upcoming screenings, for feed readers (and the orange icon).
// Built per request so the links use whatever address the site is served from.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(request: Request) {
  const site = new URL(request.url).origin;
  const items = films
    .map((f) => {
      const url = `${site}/films/${f.slug}`;
      return `    <item>
      <title>${esc(`${formatDate(f.date)}: ${f.title}`)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${esc(`${f.credit}. Endeavour, Deptford. £10.`)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Tube</title>
    <link>${site}</link>
    <description>Upcoming screenings at The Tube, Endeavour, Deptford</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
