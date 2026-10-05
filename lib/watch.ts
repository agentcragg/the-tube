// Watch-page rabbit hole, keyed by film slug. On a film page the Rabbit hole
// box follows the programme notes as shelves of clips, 2008 channel-page
// style, and the sidebar gets a Start here card, Statistics & Data (honours
// and sites linking to the film) and, where a film really had one, its old
// IMDb message board. Films with no entry keep the plain box of links.
//
// Curation rules:
// - 2 to 4 sections a film, 2 to 4 clips a section, 16 at most. The strongest
//   clip goes first, because it becomes Start here. The last section is the
//   strangest.
// - Where clips come from, best first: the maker's own channel; period
//   uploads (2006–10) under their original titles; festival intros and Q&As;
//   interviews; essays; fan work; official trailers last, one at most.
// - No full-feature uploads. No re-upload aggregators.
// - Every ID is checked before it goes in, with YouTube's oEmbed and the
//   watch page: oEmbed OK, playabilityStatus OK, playableInEmbed true. A clip
//   that fails the embed check gets embed: false.
// - `by` is the uploading channel, `year` the upload year and `length` comes
//   from lengthSeconds on the watch page. Notes are DRAFT, one plain line
//   each, and never use the "With X, Y" construction.
//
// Picked by hand; every clip was checked again on 28 Sep 2026. Honours and
// linking years were checked against Wikipedia or the page itself. Matt cuts.

import type { WatchData } from "./rabbit-hole";

export * from "./rabbit-hole";

// Southland Tales' IMDb board as the Wayback Machine has it, Apr 2007 and Mar 2008
const IMDB_BOARD_2007 = "https://web.archive.org/web/20070427192609/http://imdb.com:80/title/tt0405336/board";
const IMDB_BOARD_2008 = "https://web.archive.org/web/20080307041933/http://www.imdb.com/title/tt0405336/board";

// DRAFT: every note below
export const WATCH: Record<string, WatchData> = {
  // The night shows the theatrical cut, so the Cannes-cut clips are new to the room
  "southland-tales": {
    clips: [
      { id: "jzye7gZOlXQ", title: "Sarah Michelle Gellar - Teen Horniness is Not a Crime", by: "paulovictorbrazil", year: "2007", length: "3:12" },
      { id: "Sbovtczv99U", title: "Southland Tales Original Trailer (Richard Kelly, 2006)", by: "Arrow Video", year: "2020", length: "2:27" },
      { id: "HHWujCeo0Fc", title: "Cannes 2006: l'accueil incroyable (et polémique) de Southland Tales avec The Rock", by: "Le Grand Journal - CANAL+", year: "2026", length: "6:14" },
      { id: "7DhIvovg2pg", title: "Southland Tales Red Carpet at AFI Fest 2007", by: "AFIFEST", year: "2007", length: "2:15" },
      { id: "Cs4W1kYYAZU", title: "Southland Tales - This is the Way the World Ends (animated short)", by: "Ignacio Armstrong.", year: "2020", length: "9:12" },
      { id: "gCrSLMF_Gjw", title: "Southland Tales - USIDent TV / Surveilling the Southland", by: "Ignacio Armstrong.", year: "2020", length: "33:47" },
      { id: "ss4AF91KOFw", title: "Kiss Me Deadly Trailer (1955)", by: "CRITERION", year: "2011", length: "2:31" },
    ],
    links: [
      { label: "southlandtales.com, the official site (Flash, plays in the Wayback Machine)", url: "http://web.archive.org/web/20061201233722/http://www.southlandtales.com:80/", year: "2007", shot: "/archive/southland-tales/southlandtales.jpg", archived: "2006-12-01" },
      { label: "usident.org, the film's in-world surveillance agency", url: "http://web.archive.org/web/20070602094317/http://www.usident.org:80/", year: "2007", shot: "/archive/southland-tales/usident.jpg", archived: "2007-06-02" },
      { label: "krysta-now.com, Krysta Now's own site", url: "http://web.archive.org/web/20070610051655/http://www.krysta-now.com:80/", year: "2007", shot: "/archive/southland-tales/krysta-now.jpg", archived: "2007-06-10" },
      { label: "treer-products.com, makers of Fluid Karma", url: "http://web.archive.org/web/20060619204520/http://www.treer-products.com:80/", year: "2006", shot: "/archive/southland-tales/treer.jpg", archived: "2006-06-19" },
      { label: "Salon: Everything you were afraid to ask about Southland Tales (Thomas Rogers)", url: "https://www.salon.com/2007/12/19/southland_tales_analysis/", year: "2007" },
      { label: "Vice: Unraveling the inside story of Southland Tales", url: "https://www.vice.com/en/article/southland-tales-richard-kelly/", year: "2013" },
      { label: "AV Club: an oral history of Southland Tales (William Hughes)", url: "https://www.avclub.com/glitter-doom-and-elephants-fucking-an-oral-history-o-1846123331", year: "2021" },
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
      label: "Message boards",
      threads: [
        { title: "release date acording to play.com", url: IMDB_BOARD_2007 },
        { title: "Just For Fun (Southland Tales Release?)", url: IMDB_BOARD_2007 },
        { title: "ONE OF THE WORST MOVIES OF 2007?", url: IMDB_BOARD_2008 },
        { title: "Dwayne Johnson's Acting In This Movie", url: IMDB_BOARD_2008 },
        { title: "Did anybody else see Derek from Raod Rules in here", url: IMDB_BOARD_2008 },
      ],
    },
  },

  // "The First Movie On The Internet" is David Blair's own channel: it links
  // to his site, thefirstmovieontheinter.net. There's no trailer on YouTube.
  wax: {
    clips: [
      { id: "-zmJVxPbFyo", title: "Wax, or the Discovery of Television Among the Bees - Excerpt", by: "Harmonic Ranch", year: "2011", length: "3:40" },
      { id: "WhcctPn1JGs", title: "How \"Waxweb\" works", by: "The First Movie On The Internet", year: "2009", length: "10:50" },
      { id: "Jh5IzktxGwQ", title: "Anominy: David Blair on how Wax became \"The First Movie on the Internet\"", by: "Anominy Questionable Movies", year: "2021", length: "9:23" },
      { id: "ye0Zp9J6Z30", title: "Guest Performer: William S. Burroughs - Saturday Night Live", by: "Saturday Night Live", year: "2013", length: "6:04" },
      { id: "elgRTdDcPRA", title: "Sky at Night - The Man who Discovered a Planet (March 1980)", by: "UKAstronomy", year: "2015", length: "23:12" },
      { id: "HZn0HW9OHD4", title: "History of the Internet - Severe Tire Damage, the Internet's First Live Band", by: "LivingRaccoon", year: "2021", length: "7:00" },
      { id: "lcQNX1tE114", title: "\"Danting\" by David Blair (Danske Piger Viser Alt, 1996)", by: "CrubisTobise", year: "2020", length: "3:36" },
      { id: "i6U0DfI67Dc", title: "Trailer, Season 1: The Telepathic Motion Picture of THE LOST TRIBES", by: "The First Movie On The Internet", year: "2019", length: "3:42" },
    ],
    // The NYT, Wired and Screen Slate pieces are under Sites linking
    links: [
      { label: "Waxweb at the University of Virginia: 'The first online movie ... since 1/94'", url: "http://web.archive.org/web/19990208211003/http://jefferson.village.virginia.edu:80/wax/", year: "1999", shot: "/archive/wax/waxweb.jpg", archived: "1999-02-08" },
      { label: "waxweb.org, still up", url: "https://waxweb.org/" },
      { label: "The First Movie On The Internet, Blair's current site", url: "https://thefirstmovieontheinter.net/" },
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

  // WianTreetin is Trecartin's own channel; he put his early tapes up in July 2006
  "ryan-trecartin-double-bill": {
    clips: [
      { id: "ZR4sHDR-1XE", title: "I-Be Area (Pasta and Wendy M-PEGgy)", by: "WianTreetin", year: "2008", length: "6:46" },
      { id: "ojuhf3ocd04", title: "Wayne's World (2003)", by: "WianTreetin", year: "2006", length: "8:05" },
      { id: "hw9B14vFoeM", title: "Yo! A Romantic Comedy (2002), part one", by: "WianTreetin", year: "2006", length: "6:19" },
      { id: "BdmItKVe2rU", title: "Ryan Trecartin Interview: The Safe Space of Movies", by: "Louisiana Channel", year: "2018", length: "29:20" },
      { id: "tuMlHe893Fk", title: "Interview: Lizzie Fitch and Ryan Trecartin", by: "Astrup Fearnley Museet", year: "2018", length: "28:40" },
      { id: "Ohmq35nm_Uo", title: "Dennis Cooper and Ryan Trecartin: Artists on Writers | Writers on Artists", by: "Artforum", year: "2022", length: "49:25" },
      { id: "e9FM-FkDeWs", title: "Death Grips - @DeathGripz", by: "bravetherainbow", year: "2012", length: "4:24" },
      { id: "HzOhXrpWZ4U", title: "Ep. 138 - Damiana at Ryan Trecartin's \"Any Ever\" Show at MOCA", by: "dailyfreakshow", year: "2010", length: "10:19" },
      { id: "aOsDaClWrlg", title: "Ryan Trecartin - partial lost Pew interview", by: "pizzapriestess", year: "2011", length: "1:39" },
    ],
    links: [
      { label: "UbuWeb's Trecartin page, as it was", url: "http://web.archive.org/web/20080306124733/http://www.ubu.com:80/film/trecartin.html", year: "2008", shot: "/archive/ryan-trecartin-double-bill/ubuweb.jpg", archived: "2008-03-06" },
      { label: "Artforum, First Take: Dennis Cooper on Ryan Trecartin", url: "https://www.artforum.com/print/200601/ryan-trecartin-10046", year: "2006" },
      { label: "The New Yorker: Experimental People (Calvin Tomkins)", url: "https://www.newyorker.com/magazine/2014/03/24/experimental-people", year: "2014" },
      { label: "ICA Artists' Film Club: Ryan Trecartin (London)", url: "https://archive.ica.art/whats-on/artists-film-club-ryan-trecartin/index.html", year: "2014" },
      { label: "Zabludowicz Collection: Priority Innfield, with Center Jenny (London)", url: "https://www.zabludowiczcollection.com/exhibitions/view/lizzie-fitch-ryan-trecartin", year: "2014" },
      { label: "Electronic Arts Intermix: Center Jenny, with full credits (Aubrey Plaza and Telfar Clemens are in it)", url: "https://www.eai.org/titles/center-jenny", year: "2013" },
      { label: "Trecartin on Vimeo", url: "https://vimeo.com/trecartin" },
    ],
  },

  // YouTube has almost nothing on the film itself, so this leans on Laymon's
  // book. The trailer's channel looks like a re-upload of Spectacle's (under
  // Elsewhere), so it goes last, not in Start here.
  "in-the-dark": {
    clips: [
      { id: "lbxpHqGMG1k", title: "In the Dark (2000) trailer", by: "Movie Clips", year: "2025", length: "1:16" },
      { id: "ZTB07NH9VW4", title: "Dark Dreamers: Richard Laymon", by: "Stanley Wiater", year: "2021", length: "12:09" },
      { id: "QsJSSzWT5jU", title: "The Strange International Fame of Richard Laymon", by: "CriminOlly", year: "2024", length: "7:13" },
      { id: "VRA9W4lT0tM", title: "Richard Laymon Novel Reviews #12: In the Dark (1994)", by: "Horror Novel Reviews", year: "2020", length: "12:43" },
      { id: "yZJs2j_k83I", title: "13 Beloved trailer", by: "SahaMongkolMedia", year: "2011", length: "2:11" },
      { id: "8THJwXX6LVY", title: "Harry Nilsson - Daddy's Song", by: "HarryNilssonVEVO", year: "2019", length: "2:43" },
    ],
    links: [
      { label: "Gemineye, the Holmes brothers' production site (Wayback Machine)", url: "https://web.archive.org/web/20000829035444/http://www.gemineye.demon.nl/", year: "2000", shot: "/archive/in-the-dark/gemineye.jpg", archived: "2000-08-29" },
      { label: "Richard Laymon Kills fan site: the film, with Laymon's verdict", url: "https://rlk.stevegerlach.com/rlitdmov.htm", year: "c.2001" },
      { label: "Live at the Death Factory, episode 10: the podcast that dug it up", url: "https://liveatthedeathfactory.libsyn.com/10-you-cant-kill-me-cause-im-already-inside-you", year: "2021" },
      { label: "Screen Slate on its New York premiere at Spectacle", url: "https://www.screenslate.com/articles/dark", year: "2023" },
      { label: "Spectacle's trailer (Vimeo)", url: "https://vimeo.com/865659202", year: "2023" },
      { label: "Certified Forgotten: a grim, shot-on-video masterpiece", url: "https://certifiedforgotten.com/in-the-dark", year: "2025" },
    ],
  },

  // Drag City's own trailer is age-restricted and won't play here, so it's Rotterdam's
  "trash-humpers": {
    clips: [
      { id: "1ebeFvwYYIc", title: "Harmony Korine 'Trash Humpers' Award Video - CPH:DOX 2009", by: "CPHDOXfestival", year: "2009", length: "3:16" },
      { id: "c2UzA17yaLw", title: "Trash Humpers trailer", by: "International Film Festival Rotterdam – IFFR", year: "2013", length: "0:47" },
      { id: "RwVHYuo--Qg", title: "Trash Humpers Invade Nashville Scene", by: "Nashville Scene", year: "2010", length: "0:37" },
      { id: "Y4aRQMpPM6k", title: "Harmony Korine Trash Humpers Radio Interview", by: "Drag City", year: "2010", length: "8:38" },
      { id: "amdciMvDUqE", title: "Harmony Korine on Trash Humpers: the 2 Minute 48 Second Interview", by: "strangervideo", year: "2010", length: "2:52" },
      { id: "-HcMzd37bfo", title: "Harmony Korine Introduces Trash Humpers, Nashville Opening Night at the Belcourt", by: "Nashville Scene", year: "2010", length: "4:30" },
      { id: "CJn6zeBpuCk", title: "Gauging Public Opinion on Harmony Korine's Trash Humpers", by: "ultraculture", year: "2010", length: "4:48" },
      { id: "c2E3UqcZZqU", title: "Harmony Korine Wants to Make \"Titanic 2\"", by: "Letterman", year: "2025", length: "7:01" },
      { id: "eMVNjMF1Suo", title: "Umshini Wam", by: "osalvationcine", year: "2011", length: "15:01" },
    ],
    links: [
      { label: "trashhumpers.com, the official site (Wayback Machine)", url: "http://web.archive.org/web/20110208050516/http://www.trashhumpers.com:80/", year: "2010", shot: "/archive/trash-humpers/trashhumpers.jpg", archived: "2011-02-08" },
      { label: "Variety's review from Toronto, Rob Nelson", url: "https://variety.com/2009/film/reviews/trash-humpers-1200476127/", year: "2009" },
      { label: "The Believer: interview with Harmony Korine", url: "https://www.thebeliever.net/an-interview-with-harmony-korine/", year: "2010" },
      { label: "Nashville Scene cover story (the shoot in the clip above)", url: "https://www.nashvillescene.com/news/harmony-korines-assaultive-new-film-i-trash-humpers-i-takes-a-bleak-joyride-through-music/article_baeef050-fe92-5a48-8646-5936ce15b895.html", year: "2010" },
    ],
  },

  "a-self-induced-hallucination": {
    clips: [
      { id: "pac1_wEaQ2w", title: "A Self-Induced Hallucination - Fan Trailer", by: "Static Vision", year: "2020", length: "1:00" },
      { id: "NZZL9GYI3Cs", title: "Original Slender Man Posts from Victor Surge (With Bonus Material and Interviews)", by: "Cocytus Media", year: "2026", length: "1:27:04" },
      { id: "Wmhfn3mgWUI", title: "Marble Hornets: Introduction", by: "Marble Hornets", year: "2009", length: "1:59" },
      { id: "JS7GZhNb7eM", title: "EverymanHYBRID #1 - Introduction", by: "EverymanHYBRID", year: "2010", length: "1:32" },
      { id: "OZMBG4Pn3Sg", title: "SLENDER - Part 1 Reaction Facecam", by: "PewDiePie", year: "2012", length: "10:08" },
      { id: "D_sACgfX50g", title: "Marble Hornets: Explained - Season One", by: "Night Mind", year: "2015", length: "56:03" },
      { id: "6p1eVLEbOIw", title: "Beware the Slenderman (HBO Documentary Films)", by: "HBODocs", year: "2016", length: "1:28" },
      { id: "ySy8mcceTno", title: "Slender Man - Official Trailer", by: "Sony Pictures Entertainment", year: "2018", length: "2:39" },
    ],
    links: [
      { label: "Something Awful, 'Create Paranormal Images', where Slender Man was posted (Wayback Machine)", url: "http://web.archive.org/web/20100213174651/http://forums.somethingawful.com:80/showthread.php?threadid=3150591", year: "2009", shot: "/archive/a-self-induced-hallucination/somethingawful.jpg", archived: "2010-02-13" },
      { label: "Filmmaker Magazine: Schoenbrun on why she spent months making it", url: "https://filmmakermagazine.com/105519-jane-schoenbrun-slenderman/", year: "2018" },
      { label: "Lost Media Wiki: how it vanished from Vimeo and was found again", url: "https://lostmediawiki.com/A_Self-Induced_Hallucination_(found_Jane_Schoenbrun_documentary_on_%22Slender-man%22_creepypasta;_2018)", year: "2023" },
      { label: "Paste: Watching Watchers Watch, on Schoenbrun's early films", url: "https://www.pastemagazine.com/movies/jane-schoenbrun/jane-schoenbrun-a-self-induced-hallucination-the-school-is-watching-remix-culture", year: "2024" },
    ],
  },

  // Episode 1 is also in the night's programme; the series has no trailer
  "nebraska-city-special": {
    clips: [
      { id: "vFHSW-uzpms", title: "Nebraska City bloopers", by: "Nick Varvaro", year: "2026", length: "1:47" },
      { id: "6n1hfpDE2WE", title: "Jesus Christ on \"60 Minutes\"", by: "Nick Varvaro", year: "2017", length: "2:32" },
      { id: "cNSItMDLj-8", title: "The Rose Bushes of Manchester", by: "Nick Varvaro", year: "2017", length: "2:21" },
      { id: "IQRL2_aTRGU", title: "Fishing with Dad", by: "Nick Varvaro", year: "2023", length: "1:17" },
      { id: "RqlQYBcsq54", title: "\"No Soup for You!\" (The Soup Nazi)", by: "Seinfeld", year: "2021", length: "5:09" },
    ],
    links: [
      { label: "Dollar Bill, Nick Varvaro's album on Bandcamp", url: "https://nickvarvaro.bandcamp.com/album/dollar-bill", year: "2022" },
      { label: "Nick Varvaro on TikTok (Nebraska City clips and cast credits)", url: "https://www.tiktok.com/@nick.varvaro", year: "2023" },
      { label: "\"Written and directed by me\": the cast list, on TikTok", url: "https://www.tiktok.com/@nick.varvaro/video/7244399702496529706", year: "2023" },
    ],
    // Nothing verifiable yet, so only the house line shows
    honours: [],
  },

  // "Damon Packard" (@SpaceDisco82) is Packard's own channel
  "reflections-of-evil": {
    clips: [
      { id: "ZrYgtbWUs2U", title: "Reflections of Evil trailer (2002)", by: "Damon Packard", year: "2007", length: "3:30" },
      { id: "-XwEHV7RJyg", title: "The Making of Reflections of Evil (2001)", by: "Damon Packard", year: "2014", length: "21:14" },
      { id: "QIkJHNknFZY", title: "Expanded Universal Tram Sequence", by: "Damon Packard", year: "2022", length: "8:32" },
      { id: "yUayVczdUm0", title: "Damon Packard interview (Pod 366, Episode 36)", by: "366weirdmovies", year: "2023", length: "37:06" },
      { id: "HcXZMTRJC6w", title: "Great Packard Lincoln Breakdown (2003)", by: "Damon Packard", year: "2012", length: "1:26" },
      { id: "2vUk_qxkIuY", title: "Untitled Star Wars Mockumentary trailer", by: "Damon Packard", year: "2007", length: "5:02" },
      { id: "mc3xO4JFl20", title: "Something Evil trailer (1972 Spielberg TV movie)", by: "Damon Packard", year: "2008", length: "1:19" },
      { id: "aaB7mw71MgU", title: "The Schizophrenic Cinema of Damon Packard", by: "deep fried literature", year: "2025", length: "42:21" },
      { id: "wVqi7gwPB-g", title: "Reflections - Super Nintendo Game", by: "Damon Packard", year: "2025", length: "4:19" },
    ],
    links: [
      { label: "\"Others Have Seen the Evil\": celebrity replies on the official site (Rollins, Roger Moore, John Landis, Buddy Hackett)", url: "https://web.archive.org/web/20020814222819/http://www.reflectionsofevil.com:80/pageCR.htm", year: "2002", shot: "/archive/reflections-of-evil/others-have-seen.jpg", archived: "2002-08-14" },
      { label: "reflectionsofevil.com, the official site", url: "https://web.archive.org/web/20020809195025/http://www.reflectionsofevil.com:80/", year: "2002", shot: "/archive/reflections-of-evil/reflectionsofevil.jpg", archived: "2002-08-09" },
      { label: "Mondo Bizarro Filmmaker Damon Packard (Hollywood Investigator)", url: "http://www.hollywoodinvestigator.com/2008/damon.htm", year: "2008" },
      { label: "366 Weird Movies, #288", url: "https://366weirdmovies.com/288-reflections-of-evil-2002/", year: "2017" },
      { label: "Metrograph Staff Picks: Reflections of Evil", url: "https://metrograph.com/staff-picks-reflections-of-evil/", year: "2022" },
    ],
  },

  // Bitesized Nightmares is Kyle Edward Ball's own channel
  skinamarink: {
    clips: [
      { id: "HVQzEzW4faA", title: "Heck", by: "Bitesized Nightmares", year: "2020", length: "28:49" },
      { id: "RGesb5A1rAI", title: "Nightmare 1 (contains strobing)", by: "Bitesized Nightmares", year: "2017", length: "4:10" },
      { id: "562XdGk_ano", title: "Mark Jenkin in conversation with Kyle Edward Ball", by: "Letterboxd", year: "2023", length: "40:32" },
      { id: "ju8u7sy_Ji8", title: "Kyle Edward Ball interviewed by Patton Oswalt (+ Q&A)", by: "Torini Basoren", year: "2023", length: "34:43" },
      { id: "Ep8x0OFZCXw", title: "In the Land of Motionless Childhood: Skinamarink & 'The Poetics of Space'", by: "video blonde", year: "2026", length: "57:22" },
      { id: "yiFHeHUbe1I", title: "The Elephant Show - Skinnamarink", by: "The Elephant Show", year: "2018", length: "0:53" },
      { id: "baZPWZ2jAG8", title: "Ub Iwerks: The Pincushion Man (Balloon Land, 1935)", by: "TheUndercatCompany", year: "2008", length: "6:43" },
      { id: "k6JuJHmVsh4", title: "Black Christmas (1974) - Official Trailer", by: "ScreamFactoryTV", year: "2016", length: "4:22" },
    ],
    links: [
      { label: "How the internet found Skinamarink before release (Variety)", url: "https://variety.com/2022/film/news/skinamarink-horror-movie-internet-1235449013/", year: "2022" },
      { label: "\"Significant portions of the movie were literally just lit by the television\" (Filmmaker Magazine)", url: "https://filmmakermagazine.com/118226-interview-director-kyle-edward-ball-skinamarink/", year: "2023" },
      { label: "Kyle Edward Ball on YouTube's avant-garde (The Film Stage)", url: "https://thefilmstage.com/skinamarink-director-kyle-edward-ball-on-finding-terror-in-the-experimental-and-youtubes-avant-garde-revolution/", year: "2023" },
      { label: "The cartoon connection to Skinamarink (SlashFilm)", url: "https://www.slashfilm.com/1171711/the-cartoon-connection-to-skinamarink/", year: "2023" },
      { label: "Next: The Land of Nod, for A24 (Variety)", url: "https://variety.com/2024/film/news/skinamarink-kyle-edward-ball-a24-horror-movie-the-land-of-nod-1236192427/", year: "2024" },
    ],
  },

  // Lakeshore's 2006 GTA version of the trailer won't embed, so a 2008 fan's stands in
  crank: {
    clips: [
      { id: "uEXsOqdzYhE", title: "Crank Trailer", by: "lgfilms", year: "2006", length: "1:56" },
      { id: "7CpNbPEvP84", title: "Neveldine and Taylor Discuss the Helicopter Scene in Crank", by: "LakeshoreEnt", year: "2007", length: "1:02", smallFrames: true },
      { id: "6sZQfwIUKwY", title: "Jason Statham and Efren Ramirez at Comic-Con for Crank", by: "LakeshoreEnt", year: "2006", length: "1:30" },
      { id: "TDh0PZCO2CU", title: "Jason Statham Crank Interview", by: "John Campea", year: "2006", length: "2:29" },
      { id: "_XWtIhUQzQY", title: "Crank High Voltage Directors: First Films", by: "Indy Mogul", year: "2009", length: "4:47" },
      { id: "Vol8qCCwUuE", title: "D.O.A. (1950) - Reporting a Murder", by: "Paul Thompson", year: "2017", length: "0:53" },
      { id: "5UFM3ojea3M", title: "The Gonzo Brilliance of Crank", by: "In/Frame/Out", year: "2019", length: "11:30" },
      { id: "GhBkljkeoRs", title: "HOT ACTION STAR!!!", by: "LisaNova", year: "2009", length: "3:44" },
      { id: "rYL2TLv9VTs", title: "GTA Crank", by: "Jeremy Hannaford", year: "2008", length: "1:51" },
      { id: "cfeRxhx4MSQ", title: "Lloyd Kaufman Gets Cranked on the Set of Crank: High Voltage", by: "Troma Entertainment", year: "2018", length: "11:04" },
    ],
    links: [
      { label: "crankfilm.com, the official site (Wayback Machine, June 2007 capture)", url: "http://web.archive.org/web/20070629221547/http://www.crankfilm.com/", year: "2006", shot: "/archive/crank/crankfilm.jpg", archived: "2007-06-29" },
      { label: "Lionsgate production notes, PDF (archived): the helicopter fight and the A/B camera method", url: "https://web.archive.org/web/20080407132553/http://media.movieweb.com/galleries/3700/notes.pdf", year: "2006" },
      { label: "JoBlo at the Comic-Con Lionsgate panel: shot in HD, no wires, no CGI (archived)", url: "https://web.archive.org/web/20120729055535/http://www.joblo.com/?id=12183", year: "2006" },
      { label: "Game Informer: Neveldine/Taylor want Rockstar to make a Crank game", url: "https://gameinformer.com/b/features/archive/2010/01/18/directors-of-quot-gamer-quot-talk-games-hopes-for-crank-game-by-rockstar.aspx", year: "2010" },
      { label: "Den of Geek: Crank, ten years on", url: "https://www.denofgeek.com/movies/crank-revisiting-a-jason-statham-classic-10-years-on/", year: "2016" },
      { label: "Deadspin: Ed Zitron on Gamer, the pair's next film, a decade ahead of its time", url: "https://deadspin.com/gamer-was-a-batshit-great-bad-movie-that-was-a-decade-a-1833034814", year: "2019" },
      { label: "Collider: Crank took a classic noir (D.O.A.) and dipped it in rocket fuel", url: "https://collider.com/jason-statham-crank-movie/", year: "2024" },
    ],
  },

  // AlexRossPerry is Perry's own channel
  "the-color-wheel": {
    clips: [
      { id: "gOtO8JBtxpE", title: "The Color Wheel Preview", by: "AlexRossPerry", year: "2011", length: "1:55" },
      { id: "bG1QcIGCwFA", title: "Alex Ross Perry and Carlen Altman Take a Trip", by: "BAMorg", year: "2011", length: "2:34" },
      { id: "Kx26gay_w2c", title: "Alex Ross Perry Signs a Pineapple", by: "Filmfreaksreview", year: "2013", length: "0:27" },
      { id: "CAFdEX2XU8U", title: "The Color Wheel: Interview with Alex Ross Perry", by: "Rapporto Confidenziale", year: "2013", length: "18:29" },
      { id: "ZJqIOt7UHI0", title: "Impolex Preview", by: "Don Stahl", year: "2009", length: "1:58" },
      { id: "kcvgiGFTcPE", title: "Listen Up Philip Q&A: Influence of Philip Roth (NYFF52)", by: "Film at Lincoln Center", year: "2014", length: "1:46" },
    ],
    links: [
      { label: "MUBI Notebook: Ignatiy Vishnevetsky, 'The Lower Depths', the first review of it anywhere", url: "https://mubi.com/en/notebook/posts/the-lower-depths-alex-ross-perry-and-the-color-wheel", year: "2011" },
      { label: "Indiewire: Perry says Kim's Video was better than NYU", url: "https://www.indiewire.com/news/general-news/futures-the-color-wheel-director-alex-ross-perry-says-kims-video-was-better-than-nyu-53698/", year: "2011" },
      { label: "Hammer to Nail: Michael Tully talks to Perry (Sundance and SXSW rejections, Kim's Video)", url: "https://www.hammertonail.com/interviews/a-conversation-with-alex-ross-perry-the-color-wheel/", year: "2012" },
      { label: "New York Times: Dennis Lim, 'Literary Influences, Personal Pathologies' (Roth, Pynchon, Jerry Lewis)", url: "https://www.nytimes.com/2012/05/13/movies/the-color-wheel-and-impolex-films-by-alex-ross-perry.html", year: "2012" },
      { label: "Village Voice: Nick Pinkerton compares it to Hawks's Twentieth Century (archived)", url: "https://web.archive.org/web/20120521002324/http://www.villagevoice.com/2012-05-16/film/family-ties-that-break-and-bind-in-elena-and-the-color-wheel/", year: "2012" },
      { label: "LA Weekly: an interview with Alex Ross Perry (archived)", url: "https://web.archive.org/web/20120610011039/http://www.laweekly.com/2012-06-07/film-tv/color-wheel-Alex-Ross-Perry-interview/", year: "2012" },
      { label: "Factory 25, the distributor, which later put it out on VHS in an edition of 50", url: "https://www.factorytwentyfive.com/the-color-wheel" },
    ],
  },
};

export const watchFor = (slug: string): WatchData | undefined => WATCH[slug];
