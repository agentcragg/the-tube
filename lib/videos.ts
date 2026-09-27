// Seed videos for the suggestion wall. In production these come from the
// database, and only approved suggestions appear.

export type Video = {
  id: string;
  title: string;
  channel?: string;
  suggestedBy?: string;
  suggestedOn?: string; // ISO date
};

export const seedVideos: Video[] = [
  { id: "jNQXAC9IVRw", title: "Me at the zoo" },
  { id: "EwTZ2xpQwpA", title: "Chocolate Rain" },
  { id: "txqiwrbYGrs", title: "David After Dentist" },
  { id: "_OBlgSz8sSM", title: "Charlie bit my finger" },
  { id: "dMH0bHeiRNg", title: "Evolution of Dance" },
  { id: "ZZ5LpwO-An4", title: "HEYYEYAAEYAAAEYAEYAA" },
  { id: "OQSNhk5ICTI", title: "Double Rainbow" },
  { id: "kfVsfOSbJY0", title: "Friday" },
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up" },
  { id: "M3iOROuTuMA", title: "Salad Fingers 1: Spoons" },
  { id: "9C_HReR_McQ", title: "Don't Hug Me I'm Scared" },
  { id: "jJOwdrTA8Gw", title: "Llamas with Hats" },
  { id: "QrGrOK8oZG8", title: "Too Many Cooks" },
  { id: "CsGYh8AacgY", title: "Charlie the Unicorn" },
  { id: "wCF3ywukQYA", title: "Shoes" },
  { id: "Tx1XIm6q4r4", title: "Potter Puppet Pals: The Mysterious Ticking Noise" },
];

// Fills in real titles and channel names from YouTube. Falls back to the
// stored title if the lookup fails.
export async function withYouTubeDetails(videos: Video[]): Promise<Video[]> {
  return Promise.all(
    videos.map(async (v) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.id}`)}`,
          { next: { revalidate: 86400 } },
        );
        if (!res.ok) return v;
        const d = await res.json();
        return { ...v, title: d.title ?? v.title, channel: d.author_name ?? v.channel };
      } catch {
        return v;
      }
    }),
  );
}

// "mq" is 16:9 with no letterboxing; "hq" and the numbered frames are 4:3.
export const thumb = (id: string, frame: 0 | 1 | 2 | 3 | "mq" | "hq" = "hq") =>
  typeof frame === "number"
    ? `https://i.ytimg.com/vi/${id}/${frame}.jpg`
    : `https://i.ytimg.com/vi/${id}/${frame}default.jpg`;

// Accepts watch URLs, youtu.be links, shorts, embeds, or a bare 11-char ID.
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}
