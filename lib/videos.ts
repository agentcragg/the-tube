// Videos on the suggestion wall. For now this is the shorts longlist
// (Desktop/tube-shorts.md); nothing on it is cleared for screening yet.
// Makers and years come from that list and still need checking. Later the
// wall will come from the database, showing approved public suggestions.

export type Video = {
  id: string;
  title: string;
  maker?: string; // who made it, when known; otherwise the channel is shown
  year?: string;
  channel?: string; // YouTube channel, filled in from YouTube
  suggestedBy?: string;
  suggestedOn?: string; // ISO date
  tags?: string[];
};

export const seedVideos: Video[] = [
  // Shorts-led nights
  { id: "mkRpQU2xVCo", title: "Nebraska City, episode 1: Promises", maker: "Nick Varvaro", tags: ["sketch comedy"] },
  { id: "wompmqzTWi0", title: "Nebraska City, episode 5: Pregnant", maker: "Nick Varvaro", tags: ["sketch comedy"] },
  { id: "ObcDCDDJN8k", title: "A Family Finds Entertainment (part 4)", maker: "Ryan Trecartin", year: "2004", tags: ["video art"] },
  { id: "IbpUzWGFGnM", title: "Center Jenny", maker: "Ryan Trecartin", year: "2013", tags: ["video art"] },
  { id: "i8Dt_8JSRb4", title: "Trash Talkin", maker: "Paper Rad", year: "2006", tags: ["video art", "animation"] },
  { id: "er-OWkFeeV8", title: "Welcome to My Homeypage", maker: "Paper Rad", year: "2002", tags: ["video art", "animation"] },
  { id: "S9DFdQvGn-w", title: "Feed Me", maker: "Rachel Maclean", year: "2015", tags: ["video art"] },
  // Paired with features
  { id: "6e6RK8o1fcs", title: "Petscop", maker: "Anonymous", year: "2017", tags: ["ARG", "gaming"] },
  { id: "iGOJmdxdjeA", title: "BEN.wmv (Ben Drowned)", maker: "Alex Hall", year: "2010", tags: ["ARG", "creepypasta", "gaming"] },
  { id: "3c66w6fVqOI", title: "Local 58: Contingency", maker: "Kris Straub", year: "2015", tags: ["analogue horror"] },
  { id: "M75VLQuFPrY", title: "Local 58: Weather Service", maker: "Kris Straub", year: "2017", tags: ["analogue horror"] },
  // MODERN WARFARE trilogy
  { id: "CBM-NZdWyk4", title: "FaZe 1 Million Subscribers Teamtage", maker: "FaZe MinK", tags: ["gaming", "montage"] },
  { id: "wk49clE9wuQ", title: "Genocide V2 (CoD4 montage)", maker: "iBLaCKOuTz", tags: ["gaming", "montage"] },
  // Machinima night
  { id: "BY5TBKfEIWQ", title: "Rehearsals for Retirement", maker: "Phil Solomon", year: "2007", tags: ["machinima", "experimental"] },
  { id: "eoSI9_I3sO8", title: "Last Days in a Lonely Place", maker: "Phil Solomon", year: "2007", tags: ["machinima", "experimental"] },
  { id: "u0Km5yvfDXY", title: "Still Raining, Still Dreaming", maker: "Phil Solomon", tags: ["experimental"] },
  { id: "gldQKJfmizQ", title: "Crossroad", maker: "Phil Solomon, Mark LaPore", year: "2005", tags: ["experimental"] },
  { id: "mq4Ks4Z_NGY", title: "Diary of a Camper", maker: "United Ranger Films", year: "1996", tags: ["machinima"] },
  { id: "mLyOj_QD4a4", title: "Leeroy Jenkins", year: "2005", tags: ["machinima", "gaming"] },
  { id: "jHgZh4GV9G0", title: "Meet the Heavy", maker: "Valve", year: "2007", tags: ["machinima"] },
  { id: "OR4N5OhcY9s", title: "Meet the Spy", maker: "Valve", tags: ["machinima"] },
  { id: "9BAM9fgV-ts", title: "Red vs. Blue, episode 1: Why Are We Here?", maker: "Rooster Teeth", year: "2003", tags: ["machinima"] },
  { id: "5SQhfkpX9bc", title: "Freeman's Mind, episode 1", maker: "Ross Scott", year: "2007", tags: ["machinima"] },
  { id: "nGQIQljaAc0", title: "Warthog jump", tags: ["gaming"] },
  { id: "FxD9Rw_DXOk", title: "Hardly Workin'", maker: "ILL Clan", year: "2000", tags: ["machinima"] },
  { id: "eEUR-Um21jY", title: "Skibidi Toilet, part 1", maker: "DaFuq!?Boom!", year: "2023", tags: ["animation"] },
  // Other one-offs
  { id: "dKnwhokvgxE", title: "Max Headroom broadcast intrusion (WGN news)", year: "1987", tags: ["broadcast intrusion", "found footage"] },
  { id: "klqi_h9FElc", title: "Webdriver Torso", year: "2013", tags: ["internet mystery"] },
  { id: "Bn59FJ4HrmU", title: "Marble Hornets, entry 1", year: "2009", tags: ["ARG", "found footage"] },
  // Pre-show library
  { id: "E3-vsKwQ0Cg", title: "Dots", maker: "Norman McLaren", year: "1940", tags: ["animation", "experimental"] },
];

// Fills in channel names from YouTube. Our own titles are kept, since
// YouTube's are often messy; the YouTube title is only used if we have none.
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
        return { ...v, title: v.title || d.title, channel: d.author_name ?? v.channel };
      } catch {
        return v;
      }
    }),
  );
}

// Who made it, for display: "Phil Solomon, 2007", or the channel if unknown
export const credit = (v: Video) =>
  [v.maker ?? v.channel, v.year].filter(Boolean).join(", ") || undefined;

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
