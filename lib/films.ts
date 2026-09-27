// Season one programme. Everything is provisional until rights are confirmed.
// Stills are hover-scrubbed in order. The current ones are hotlinked from TMDB
// and YouTube as a mock-up; swap for local files in /public/films/<slug>/.

export type Film = {
  slug: string;
  title: string;
  credit: string; // director/artist and year, as it should appear on the page
  date: string; // ISO date of the screening
  runtime?: number; // running time in seconds
  runtimeExact?: boolean; // true when known to the second (e.g. from the BBFC)
  stills: string[];
  ticketUrl?: string; // Ticket Tailor event link, once on sale
  notes?: string; // programme notes
  pairedWith?: string;
  tags?: string[];
  rabbitHole: { label: string; url: string }[];
};

const search = (site: "wiki" | "letterboxd" | "youtube", q: string) => {
  const e = encodeURIComponent(q);
  if (site === "wiki") return `https://en.wikipedia.org/w/index.php?search=${e}`;
  if (site === "letterboxd") return `https://letterboxd.com/search/${e}/`;
  return `https://www.youtube.com/results?search_query=${e}`;
};

const TMDB = "https://image.tmdb.org/t/p/w780";
const YT = "https://i.ytimg.com/vi";

export const films: Film[] = [
  {
    slug: "southland-tales",
    title: "Southland Tales",
    credit: "Richard Kelly, 2006",
    date: "2027-01-19",
    runtime: 8661, // 2h 24m 21s, BBFC, UK cinema version (the 2020 Arrow cut is 2h 38m)
    runtimeExact: true,
    tags: ["cult", "satire", "apocalypse"],
    stills: [
      `${TMDB}/eQdZzDUubjxEDNmH8ucAtt8fTer.jpg`,
      `${TMDB}/ekFUbytCbZrc9rPizJl4Gweiinj.jpg`,
      `${TMDB}/qKa7fl7eh6LMxByMeP0Ha0TwlkM.jpg`,
      `${TMDB}/18qSHoHasfgIGOgocU4jm4oiZQP.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Southland Tales") },
      { label: "Letterboxd", url: search("letterboxd", "Southland Tales") },
      { label: "Search YouTube", url: search("youtube", "Southland Tales") },
    ],
  },
  {
    slug: "wax",
    title: "Wax, or the Discovery of Television Among the Bees",
    credit: "David Blair, 1991",
    date: "2027-01-26",
    runtime: 85 * 60, // TMDB
    tags: ["video art", "early internet", "bees"],
    stills: [
      `${TMDB}/h62Aotz1fAV3n8c0DDQBcs0wkdH.jpg`,
      `${TMDB}/A8QbpEFB1dKvvbdZN4o8tLulZVk.jpg`,
      `${TMDB}/v5z4ZO9XxPcG9GixrzlZuftxOZH.jpg`,
      `${TMDB}/tuejJ9b7mk6X7Ia75zFPzmt2w7B.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Wax, or the Discovery of Television Among the Bees") },
      { label: "Letterboxd", url: search("letterboxd", "Wax or the Discovery of Television Among the Bees") },
      { label: "Search YouTube", url: search("youtube", "Wax or the Discovery of Television Among the Bees") },
    ],
  },
  {
    slug: "a-family-finds-entertainment",
    title: "A Family Finds Entertainment",
    credit: "Ryan Trecartin, 2004",
    date: "2027-02-02",
    runtime: 42 * 60, // TMDB
    tags: ["video art"],
    stills: [
      `${TMDB}/syvkd78a169rKQBSGoClWPH2hiD.jpg`,
      `${TMDB}/qgvSsvpaSswgM6av75xHIbpdYf5.jpg`,
      `${YT}/ObcDCDDJN8k/hq2.jpg`,
      `${YT}/ObcDCDDJN8k/hq3.jpg`,
    ],
    rabbitHole: [
      { label: "Ryan Trecartin on Wikipedia", url: search("wiki", "Ryan Trecartin") },
      { label: "Letterboxd", url: search("letterboxd", "A Family Finds Entertainment") },
      { label: "Search YouTube", url: search("youtube", "Ryan Trecartin A Family Finds Entertainment") },
    ],
  },
  {
    slug: "in-the-dark",
    title: "In the Dark",
    credit: "Clifton Holmes, 2000",
    date: "2027-02-09",
    runtime: 106 * 60, // TMDB
    stills: [
      `${TMDB}/Ah5ELScm7dyiC1f3jFx32FPRVql.jpg`,
      `${TMDB}/gJj9n7gA8L46d6x1dl6AT2hLswy.jpg`,
      `${TMDB}/oj6VNaMkOACM7fkbMJAMgUOIa0M.jpg`,
      `${TMDB}/eDYqSHBvLaQLb1YmIkD8x53SWVE.jpg`,
    ],
    rabbitHole: [
      { label: "Letterboxd", url: search("letterboxd", "In the Dark Clifton Holmes") },
      { label: "Search YouTube", url: search("youtube", "In the Dark 2000 Clifton Holmes") },
    ],
  },
];

export const getFilm = (slug: string) => films.find((f) => f.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Until each night has a Ticket Tailor event, Book buttons point here.
export const bookingUrl = (f: Film) => f.ticketUrl ?? "#book";

// "2h 24m 21s" when known to the second, otherwise "1h 25m"
export function runningTime(f: Film) {
  if (!f.runtime) return undefined;
  const h = Math.floor(f.runtime / 3600);
  const m = Math.floor((f.runtime % 3600) / 60);
  const sec = f.runtime % 60;
  return [h && `${h}h`, m && `${m}m`, f.runtimeExact && sec && `${sec}s`].filter(Boolean).join(" ");
}

// "2:24:21", as on a YouTube thumbnail. Seconds show as :00 unless known.
export function badgeTime(f: Film) {
  if (!f.runtime) return undefined;
  const h = Math.floor(f.runtime / 3600);
  const m = Math.floor((f.runtime % 3600) / 60);
  const sec = f.runtimeExact ? f.runtime % 60 : 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

// Whole days from now until an ISO date
export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000);
