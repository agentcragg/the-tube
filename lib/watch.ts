// Watch-page rabbit hole, keyed by film slug. On a film page these replace the Rabbit hole box with the sidebar panels of a 2008
// YouTube watch page: More From the director, Related Videos, Statistics &
// Data (honours and sites linking to the film) and, where a film really had
// one, its old IMDb message board. Films with no entry keep the old box.
//
// Everything here is picked by hand. Every YouTube ID was checked with
// YouTube's oEmbed on 27 Sep 2026: `by` is the uploading channel as YouTube
// shows it, `year` is the year it was uploaded, `length` comes from the watch
// page. Honours and linking years were checked against Wikipedia or the page
// itself. Matt cuts.

export type Clip = {
  id: string; // YouTube video ID
  title: string;
  by?: string; // the uploading channel
  year?: string; // year uploaded
  length?: string; // "3:42"
};

export type WatchData = {
  // `url` is the channel, for the "All videos" link under the panel
  moreFrom?: { name: string; url?: string; clips: Clip[] };
  related?: Clip[];
  // YouTube's hyphenated form. The house line (below) is added after these.
  honours?: string[];
  // `year` is the year the page was written
  linking?: { url: string; year: string }[];
  // Only for films that really had a lively board; each thread links to an archived copy
  boards?: { label: string; threads: { title: string; url: string }[] };
};

// DRAFT: the last honour on every film with panels. "Screening" becomes
// "Screened" once the night is over (London time). The year is the film's.
export const HOUSE_HONOUR = {
  before: "Screening",
  after: "Screened",
  where: "Basement of Endeavour - Deptford",
};

// DRAFT: panel wording, after YouTube's own (Feb 2008)
export const COPY = {
  moreFrom: "More From:",
  allVideos: "All videos »",
  related: "Related Videos",
  stats: "Statistics & Data",
  honours: (n: number) => `Honours for this film (${n})`,
  linking: (n: number) => `Sites linking to this film (${n})`,
  from: "From:",
};

// Southland Tales' IMDb board as the Wayback Machine has it, Apr 2007 and Mar 2008
const IMDB_BOARD_2007 = "https://web.archive.org/web/20070427192609/http://imdb.com:80/title/tt0405336/board";
const IMDB_BOARD_2008 = "https://web.archive.org/web/20080307041933/http://www.imdb.com/title/tt0405336/board";

export const WATCH: Record<string, WatchData> = {
  "southland-tales": {
    moreFrom: {
      name: "Richard Kelly",
      clips: [
        // His USC student short (Wikipedia: Richard Kelly (filmmaker))
        { id: "2YTs8lUxePw", title: "The Goodbye Place", by: "Kapta Prism", year: "2020", length: "8:43" },
        { id: "qdKbNuhXWvQ", title: "Donnie Darko - Official Trailer [2001]", by: "PakoMorientes", year: "2010", length: "1:29" },
        { id: "9zgLlzTQc5Q", title: "Donnie Darko (2001) - U.S. TV Spot", by: "Movie fun", year: "2022", length: "0:31" },
        { id: "0Q1N3Mz0rMI", title: "The Box - Official UK Trailer (2009)", by: "Icon Film Distribution", year: "2009", length: "2:04" },
      ],
    },
    related: [
      { id: "Sbovtczv99U", title: "Southland Tales Original Trailer (Richard Kelly, 2006)", by: "Arrow Video", year: "2020", length: "2:27" },
      { id: "x69Jg-mMTxw", title: "Southland Tales (2007) - U.S. TV Spot", by: "Movie fun", year: "2021", length: "0:31" },
      // The uploader's description: "my first attempt at making a fan trailer"
      { id: "3rRZRJ41I3w", title: "Southland Tales Trailer (fan-made)", by: "superjoe17", year: "2007", length: "1:12" }, // DRAFT: "(fan-made)" is ours
      // Q&A at the James River Film Festival, per the description
      { id: "dngNcOHA-zE", title: "Richard Kelly on \"Southland Tales\"", by: "mediastupor", year: "2008", length: "9:42" },
      // Janeane Garofalo's scene, only in the Cannes cut
      { id: "MVSn_Ys98OY", title: "General Teena MacArthur Learns About The Twin", by: "southlandcannes", year: "2008", length: "1:17" },
      { id: "jzye7gZOlXQ", title: "Sarah Michelle Gellar - Teen Horniness is Not a Crime", by: "paulovictorbrazil", year: "2007", length: "3:12" },
      // A Buffy fan video cut to the same song
      { id: "4UV0il-JpW0", title: "Buffy the vampire slayer - Teen Horniness Is Not a Crime", by: "embecko1", year: "2008", length: "3:15" },
      { id: "TWZ-VyTo5YU", title: "Mark Kermode Reviews Southland Tales", by: "SkagWinesack", year: "2010", length: "2:12" },
    ],
    // DRAFT wording. Facts from Wikipedia: Southland Tales
    honours: [
      "Cannes - In Competition - 2006",
      "Fantastic Fest - Premiere of the final cut - 2007",
      "Arrow Video - Remastered, with the Cannes cut - 2021",
    ],
    linking: [
      { url: "https://en.wikipedia.org/wiki/Southland_Tales", year: "2005" }, // article started Feb 2005
      { url: "https://fantasticfest.blogspot.com/2007/09/marko-southland-tales-bbq-and-uwe-boll.html", year: "2007" },
      { url: "https://www.villagevoice.com/revelation/", year: "2007" }, // J. Hoberman
      { url: "https://www.rogerebert.com/reviews/southland-tales-2007", year: "2007" },
      { url: "https://www.hollywoodreporter.com/movies/movie-features/anatomy-a-cannes-disaster-what-890749/", year: "2016" },
    ],
    // Thread titles exactly as they were on the board, spelling and all: a
    // year of waiting after Cannes, then the verdict. The threads themselves
    // weren't archived, so each links to the board page that lists it.
    boards: {
      label: "Message boards (IMDb, 2007–08)", // DRAFT
      threads: [
        { title: "release date acording to play.com", url: IMDB_BOARD_2007 },
        { title: "Just For Fun (Southland Tales Release?)", url: IMDB_BOARD_2007 },
        { title: "ONE OF THE WORST MOVIES OF 2007?", url: IMDB_BOARD_2008 },
        { title: "Dwayne Johnson's Acting In This Movie", url: IMDB_BOARD_2008 },
        { title: "Did anybody else see Derek from Raod Rules in here", url: IMDB_BOARD_2008 },
      ],
    },
  },

  wax: {
    // "The First Movie On The Internet" is David Blair's own channel: it
    // links to his site, thefirstmovieontheinter.net
    moreFrom: {
      name: "David Blair",
      url: "https://www.youtube.com/@thefirstmovieontheinternet",
      clips: [
        { id: "i6U0DfI67Dc", title: "Trailer, Season 1, English: The Telepathic Motion Picture of THE LOST TRIBES", by: "The First Movie On The Internet", year: "2019", length: "3:42" },
        { id: "WhcctPn1JGs", title: "How \"Waxweb\" works", by: "The First Movie On The Internet", year: "2009", length: "10:50" },
        { id: "P4o8VHiCjAM", title: "Finding the Telepathic Cinema of Manchuria", by: "lastpillar", year: "2022", length: "10:05" },
        { id: "uJsR7RC76Zc", title: "VolumeE Part 0", by: "The First Movie On The Internet", year: "2025", length: "1:16:39" },
      ],
    },
    related: [
      { id: "Jh5IzktxGwQ", title: "Anominy: David Blair On How Wax Became \"The First Movie On the Internet\"", by: "Anominy Questionable Movies", year: "2021", length: "9:23" },
      // Uploaded by the film's music and sound people
      { id: "-zmJVxPbFyo", title: "Wax, OR the Discovery of Television Among the Bees - Excerpt", by: "Harmonic Ranch", year: "2011", length: "3:40" },
      { id: "fQQ8PDGj1Y0", title: "fan trailer - Wax or the Discovery of Television Among the Bees (1991)", by: "cyberboy666", year: "2021", length: "1:42" },
      { id: "kIeW_xiquCc", title: "David Blair - The Telepathic Motion Picture Of The Lost Tribes", by: "ISEA Symposium Archive Videos", year: "2025", length: "1:36" },
      { id: "wivH8-yvr4E", title: "What on Earth is Wax, or the Discovery of Television Among the Bees (1991)", by: "Style is Substance", year: "2022", length: "30:02" },
    ],
    // DRAFT wording
    honours: [
      "First film streamed on the internet - 1993", // Wikipedia; NYT, 24 May 1993
      "#270 - 366 Weird Movies - 2017",
      "Spectacle Theater - 10th Anniversary - 2020", // Screen Slate
    ],
    linking: [
      { url: "https://www.wired.com/1993/02/wax-or-the-discovery-of-television-among-the-bees/", year: "1993" },
      { url: "https://www.nytimes.com/1993/05/24/business/cult-film-is-a-first-on-internet.html", year: "1993" },
      { url: "https://en.wikipedia.org/wiki/Wax_or_the_Discovery_of_Television_Among_the_Bees", year: "2006" },
      { url: "https://366weirdmovies.com/270-wax-or-the-discovery-of-television-among-the-bees-1991/", year: "2017" },
      { url: "https://www.screenslate.com/articles/wax-or-discovery-television-among-bees", year: "2020" },
    ],
  },

  "nebraska-city-special": {
    // His other shorts, newest first
    moreFrom: {
      name: "Nick Varvaro",
      url: "https://www.youtube.com/channel/UCpw4Vb5gOQBvdE4Zh5nfrXw",
      clips: [
        { id: "IQRL2_aTRGU", title: "Fishing with Dad", by: "Nick Varvaro", year: "2023", length: "1:17" },
        { id: "x3NSWlrdaJY", title: "Family Feud", by: "Nick Varvaro", year: "2019", length: "1:30" },
        { id: "CkwvwZs8cas", title: "American Drama", by: "Nick Varvaro", year: "2018", length: "1:42" },
        { id: "6n1hfpDE2WE", title: "Jesus Christ on \"60 Minutes\"", by: "Nick Varvaro", year: "2017", length: "2:32" },
        { id: "GCxZi9eQWBI", title: "The Barbershop Singer", by: "Nick Varvaro", year: "2017", length: "2:39" },
        { id: "_ONsxt_pH4Q", title: "Instant Nostalgia", by: "Nick Varvaro", year: "2017", length: "3:04" },
      ],
    },
    related: [
      { id: "vFHSW-uzpms", title: "Nebraska City bloopers", by: "Nick Varvaro", year: "2026", length: "1:47" },
      { id: "mkRpQU2xVCo", title: "Promises (Nebraska City, Episode 1)", by: "Nick Varvaro", year: "2022", length: "4:46" },
      // DRAFT: the real town, 41 minutes of it. Cut if it's too much.
      { id: "bBKavukTals", title: "Nebraska City, Nebraska! Drive with me!", by: "Decelerated Travel", year: "2021", length: "41:42" },
    ],
    // Nothing verifiable yet, so only the house line shows
    honours: [],
  },
};

export const watchFor = (slug: string): WatchData | undefined => WATCH[slug];
