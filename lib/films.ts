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
  colour: string; // taken from the film's own stills
  rabbitHole: { label: string; url: string }[];
};

const search = (site: "wiki" | "letterboxd" | "youtube", q: string) => {
  const e = encodeURIComponent(q);
  if (site === "wiki") return `https://en.wikipedia.org/w/index.php?search=${e}`;
  if (site === "letterboxd") return `https://letterboxd.com/search/${e}/`;
  return `https://www.youtube.com/results?search_query=${e}`;
};

const TMDB = "https://image.tmdb.org/t/p/w780";

export const films: Film[] = [
  {
    slug: "southland-tales",
    title: "Southland Tales",
    credit: "Richard Kelly, 2006",
    date: "2027-01-19",
    runtime: 8661, // 2h 24m 21s, BBFC, UK cinema version (the 2020 Arrow cut is 2h 38m)
    runtimeExact: true,
    colour: "#126994", // steel blue from the flag and sky
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
    colour: "#b8893a", // honey gold
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
    slug: "ryan-trecartin-double-bill",
    title: "Ryan Trecartin Double Bill: A Family Finds Entertainment & Center Jenny",
    credit: "Ryan Trecartin, 2004 & 2013",
    date: "2027-02-02",
    runtime: (42 + 54) * 60, // TMDB: A Family Finds Entertainment 42m + Center Jenny 54m
    colour: "#a39a1b", // acid mustard from the face paint in the first still (#cfc54b), deepened for legibility
    stills: [
      `${TMDB}/qgvSsvpaSswgM6av75xHIbpdYf5.jpg`, // A Family Finds Entertainment
      `${TMDB}/pLTZpfPJSK4A05WrXQz1oWuMmZy.jpg`, // Center Jenny
      `${TMDB}/syvkd78a169rKQBSGoClWPH2hiD.jpg`, // A Family Finds Entertainment
      `${TMDB}/uHw0cDA9aTrOMR1uV23cxtFU6Qf.jpg`, // Center Jenny
    ],
    rabbitHole: [
      { label: "Ryan Trecartin on Wikipedia", url: search("wiki", "Ryan Trecartin") },
      { label: "A Family Finds Entertainment on Letterboxd", url: search("letterboxd", "A Family Finds Entertainment") },
      { label: "Center Jenny on Letterboxd", url: search("letterboxd", "Center Jenny") },
      { label: "Search YouTube", url: search("youtube", "Ryan Trecartin") },
    ],
  },
  {
    slug: "in-the-dark",
    title: "In the Dark",
    credit: "Clifton Holmes, 2000",
    date: "2027-02-09",
    runtime: 106 * 60, // TMDB
    colour: "#4a4f55", // graphite; the film is black and white
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
  {
    slug: "trash-humpers",
    title: "Trash Humpers",
    credit: "Harmony Korine, 2009",
    date: "2027-02-16",
    runtime: 77 * 60, // TMDB
    colour: "#b0607a", // dusty pink from the night footage
    stills: [
      `${TMDB}/AdDmk6rJaimVvSKJLbpiSFBYur5.jpg`,
      `${TMDB}/tlR1zNcsT5BCPLxcWl1bCLIhcYC.jpg`,
      `${TMDB}/agdMFeFu6JfzKgs8Sw84pbKtw5j.jpg`,
      `${TMDB}/oZfBL31jabTW5XeIF2yFlhOePyu.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Trash Humpers") },
      { label: "Letterboxd", url: search("letterboxd", "Trash Humpers") },
      { label: "Search YouTube", url: search("youtube", "Trash Humpers Harmony Korine") },
    ],
  },
  {
    slug: "a-self-induced-hallucination",
    title: "A Self-Induced Hallucination",
    credit: "Jane Schoenbrun, 2018",
    date: "2027-02-23",
    runtime: 72 * 60, // TMDB
    colour: "#2b44b0", // the blue of screen light
    stills: [
      `${TMDB}/1ApEDkKQyfdnT4bkYcRBHv8S5IF.jpg`,
      `${TMDB}/usCNN9qedHzC0wpkUbHH5TgJFWO.jpg`,
      `${TMDB}/t3vmHBltEEZvf8EXldyd40cQ3NP.jpg`,
      `${TMDB}/gQkCv5PXlrk8SMdLww1p5PVx8Pj.jpg`,
    ],
    rabbitHole: [
      { label: "Letterboxd", url: search("letterboxd", "A Self-Induced Hallucination") },
      { label: "Slender Man on Wikipedia", url: search("wiki", "Slender Man") },
      { label: "Search YouTube", url: search("youtube", "A Self-Induced Hallucination Jane Schoenbrun") },
    ],
  },
  {
    slug: "summer-wars",
    title: "Summer Wars",
    credit: "Mamoru Hosoda, 2009",
    date: "2027-03-02",
    runtime: 114 * 60, // TMDB
    colour: "#5f9a3a", // green from the summer fields
    stills: [
      `${TMDB}/sle590EkpwG8O26aJE73pT5iT2q.jpg`,
      `${TMDB}/i00fQQsMi05iMzbG8P6uI3rHwzL.jpg`,
      `${TMDB}/v0AVNgZ0qy3cdzxpOfL1eukqARn.jpg`,
      `${TMDB}/XSDflMt9fLzWs8Hym8T2GUJ3wm.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Summer Wars") },
      { label: "Letterboxd", url: search("letterboxd", "Summer Wars") },
      { label: "Search YouTube", url: search("youtube", "Summer Wars Hosoda") },
    ],
  },
  {
    slug: "reflections-of-evil",
    title: "Reflections of Evil",
    credit: "Damon Packard, 2002",
    date: "2027-03-09",
    runtime: 138 * 60, // TMDB
    colour: "#8a3a3a", // oxblood from its red-maroon cast
    stills: [
      `${TMDB}/x4sJOw6I9Kyvxhte1zdRCjGTlOn.jpg`,
      `${TMDB}/wXEfm5iipWddgXXNa7H4eejvTv5.jpg`,
      `${TMDB}/fLuzgGCuLEi0Xv7af0YR1rD9mXK.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Reflections of Evil") },
      { label: "Letterboxd", url: search("letterboxd", "Reflections of Evil") },
      { label: "Search YouTube", url: search("youtube", "Reflections of Evil Damon Packard") },
    ],
  },
  {
    slug: "skinamarink",
    title: "Skinamarink",
    credit: "Kyle Edward Ball, 2022",
    date: "2027-03-16",
    runtime: 100 * 60, // TMDB
    colour: "#0b7480", // teal from the TV glow
    stills: [
      `${TMDB}/rryI5WchAXVJKazxnZeGalvSllc.jpg`,
      `${TMDB}/cTG4dJZQNxWGxDKfdaWe0ZfNZEQ.jpg`,
      `${TMDB}/tjPpoTWBZOSUudnDyCYAqGcXBAS.jpg`,
      `${TMDB}/1lgMBTgxlJ0rJ7zke9SVuTkyG1Z.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Skinamarink") },
      { label: "Letterboxd", url: search("letterboxd", "Skinamarink") },
      { label: "Search YouTube", url: search("youtube", "Kyle Edward Ball Bitesized Nightmares") },
    ],
  },
  {
    slug: "crank",
    title: "Crank",
    credit: "Mark Neveldine, Brian Taylor, 2006",
    date: "2027-03-23",
    runtime: 88 * 60, // TMDB
    colour: "#d0661e", // hot orange
    stills: [
      `${TMDB}/xCB02ebMOe2xaAPffVemQPzSgbY.jpg`,
      `${TMDB}/iF7Ay1Q0D0IbEq1rjSetrRKed1N.jpg`,
      `${TMDB}/dbXhv4agJ0c2NNCHr2K2OKolpYy.jpg`,
      `${TMDB}/kSTvteM3ekuoeO7u7GJtZQkZuom.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "Crank (film)") },
      { label: "Letterboxd", url: search("letterboxd", "Crank 2006") },
      { label: "Search YouTube", url: search("youtube", "Crank 2006 Neveldine Taylor") },
    ],
  },
  {
    slug: "the-color-wheel",
    title: "The Color Wheel",
    credit: "Alex Ross Perry, 2011",
    date: "2027-05-11",
    runtime: 83 * 60, // TMDB
    colour: "#6e6a64", // warm grey; the film is black and white
    stills: [
      `${TMDB}/x2bZXdIFD7XrwWmfi9VMHXTUvaJ.jpg`,
      `${TMDB}/a2J3jc9l7hSN0AkJeSiLNV7FV6p.jpg`,
      `${TMDB}/qgYF2uqtsNzhfBc8S943c6qPet9.jpg`,
      `${TMDB}/ekweWfq5ZXS1DmTDWeGJ7FVq4AZ.jpg`,
    ],
    rabbitHole: [
      { label: "Wikipedia", url: search("wiki", "The Color Wheel (film)") },
      { label: "Letterboxd", url: search("letterboxd", "The Color Wheel") },
      { label: "Search YouTube", url: search("youtube", "The Color Wheel Alex Ross Perry") },
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

// The venue, used in the footer, Find us, calendar entries and map links
export const VENUE = {
  name: "Endeavour",
  lines: ["Endeavour", "39 Deptford Broadway", "London SE8 4PQ"],
  oneLine: "Endeavour, 39 Deptford Broadway, London SE8 4PQ",
  map: "https://www.google.com/maps/search/?api=1&query=Endeavour%2C+39+Deptford+Broadway%2C+London+SE8+4PQ",
};

// A night counts as past once its date is over
export const isPast = (iso: string) => new Date(iso + "T23:59:59").getTime() < Date.now();
