import { lookUpTikTok } from "../../lookup";

// When a TikTok image link stops working (its x-expires), or 0 if it doesn't say
const expires = (link: string) => Number(new URL(link).searchParams.get("x-expires")) * 1000 || 0;

// A TikTok's thumbnail: /api/tiktok/<TikTok's number for the video>/thumb.
// TikTok's image links are signed and stop working after a day or two, so
// they're never stored; this looks up the current one (at most once an hour
// per video) and sends the browser there.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{10,24}$/.test(id)) return new Response("Not found", { status: 404 });
  let found = await lookUpTikTok(id, { next: { revalidate: 3600 } });
  // After a quiet spell Next hands back the old lookup once while it refreshes,
  // and its link may have run out by then, so look again straight away
  const soon = Date.now() + 3600_000;
  if (found?.thumbnail && expires(found.thumbnail) && expires(found.thumbnail) < soon) {
    found = await lookUpTikTok(id, { cache: "no-store" });
  }
  if (!found?.thumbnail) return new Response("Not found", { status: 404 });
  // Browsers keep the redirect for an hour, or until the link runs out if sooner
  const left = expires(found.thumbnail) ? Math.floor((expires(found.thumbnail) - Date.now()) / 1000) - 60 : 3600;
  return new Response(null, {
    status: 302,
    headers: { Location: found.thumbnail, "Cache-Control": `public, max-age=${Math.max(0, Math.min(3600, left))}` },
  });
}
