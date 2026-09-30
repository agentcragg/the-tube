import { parseTikTok } from "@/lib/videos";

// Looking TikToks up, for app/api/suggest and the thumbnail route next to this.
// TikTok's oEmbed takes a link without the account name, so the number is enough.

type OEmbed = {
  title?: string;
  author_name?: string;
  author_unique_id?: string;
  author_url?: string;
  thumbnail_url?: string;
};

// Where TikTok keeps its images (p16-common-sign.tiktokcdn-eu.com and so on)
const IMAGE_HOST = /(^|\.)(tiktokcdn(-[a-z]+)?|ibyteimg|byteimg)\.com$/;

function imageLink(link?: string) {
  try {
    const u = new URL(link ?? "");
    return u.protocol === "https:" && IMAGE_HOST.test(u.hostname) ? u.href : undefined;
  } catch {
    return undefined;
  }
}

export async function lookUpTikTok(digits: string, init?: RequestInit) {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@/video/${digits}`)}`,
      { signal: AbortSignal.timeout(8000), ...init },
    );
    if (!res.ok) return null;
    const d = (await res.json()) as OEmbed;
    const handle = d.author_unique_id || d.author_url?.match(/\/@([\w.]+)/)?.[1] || "";
    return {
      title: d.title ?? "",
      channel: d.author_name || handle,
      url: `https://www.tiktok.com/@${handle}/video/${digits}`,
      thumbnail: imageLink(d.thumbnail_url),
    };
  } catch {
    return null;
  }
}

// Follows a short link (vm.tiktok.com/…, tiktok.com/t/…) to the video's
// number. Only ever goes to tiktok.com; a dead link lands on TikTok's home
// page, which gives null.
export async function resolveShortTikTok(url: string): Promise<string | null> {
  let next = url;
  for (let hop = 0; hop < 3; hop++) {
    let found: ReturnType<typeof parseTikTok>;
    try {
      const res = await fetch(next, { redirect: "manual", signal: AbortSignal.timeout(8000) });
      const location = res.headers.get("location");
      if (!location) return null;
      found = parseTikTok(new URL(location, next).href);
    } catch {
      return null;
    }
    if (!found) return null;
    if ("id" in found) return found.id;
    next = found.short;
  }
  return null;
}
