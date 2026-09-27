// Fun lab idea: trailer. One trailer per film, played in place of the main
// still on the film page, after a preview card in the film's colour.
//
// Films with no entry here get no "Watch trailer" button.
// Every ID was checked against YouTube's oEmbed on 27 Sep 2026, and `seconds`
// is YouTube's own length for that upload. Uploaders are noted so Matt can
// decide whether each one is the version he wants.

export type Trailer = {
  id: string; // YouTube video ID
  seconds: number; // length on YouTube, shown before the player has loaded
  advice?: string; // one content-advice line for the preview card
};

// DRAFT: the preview card's heading (shown in capitals)
export const PREVIEW_CARD = "The following preview has been approved for the basement of Endeavour";

// DRAFT: button and player wording
export const TRAILER_COPY = {
  watch: "Watch trailer",
  close: "Close trailer",
  onYouTube: "Watch on YouTube",
  blocked: "YouTube won't play this one here.",
};

export const trailers: Record<string, Trailer> = {
  // Arrow Video, "Southland Tales Original Trailer"
  "southland-tales": {
    id: "Sbovtczv99U",
    seconds: 147,
    advice: "Contains a Mega-Zeppelin, a policeman, his identical twin and the end of the world.", // DRAFT
  },

  // No official trailer found. Candidate: a fan-made trailer by cyberboy666
  // (fQQ8PDGj1Y0, 1:42), cut from a screen-test clip. Left out until Matt decides.
  // wax: { id: "fQQ8PDGj1Y0", seconds: 102, advice: "" },

  // Ryan Trecartin double bill: no trailer found.

  // Re-upload of the original trailer by an unofficial channel ("Movie Clips").
  // The description matches the film's synopsis; worth a look before using.
  "in-the-dark": {
    id: "lbxpHqGMG1k",
    seconds: 76,
    advice: "Contains notes from a stranger and dares that get worse.", // DRAFT
  },

  // Curious Film (AU/NZ distributor). Drag City's own upload (JQYSRXT3CiU) is
  // age-restricted, so YouTube won't let it play embedded.
  "trash-humpers": {
    id: "aIcP9LE4m9c",
    seconds: 67,
    advice: "Contains bins, baby dolls and exactly what the title says.", // DRAFT
  },

  // No official trailer found. Candidate: a fan trailer made for Static
  // Vision's festival (pac1_wEaQ2w, 1:00). Left out until Matt decides.
  // "a-self-induced-hallucination": { id: "pac1_wEaQ2w", seconds: 60, advice: "" },

  // Nebraska City Special: no trailer. The bloopers (vFHSW-uzpms) could stand in.

  // Damon Packard's own channel, "Reflections of Evil Trailer - 2002 (higher
  // quality upload)". He also posted a Blu-ray trailer (bKcSdoHgXds, 1:46).
  "reflections-of-evil": {
    id: "e2w6zsCnZuE",
    seconds: 187,
    advice: "Contains a watch salesman and a young Steven Spielberg, spoofed.", // DRAFT
  },

  // Shudder, "Skinamarink - Official Trailer"
  skinamarink: {
    id: "APQqilSTxz0",
    seconds: 103,
    advice: "Contains cartoons, two buckets and fewer doors as it goes on.", // DRAFT
  },

  // Rotten Tomatoes Classic Trailers, "Crank (2006) Official Trailer # 1"
  crank: {
    id: "NrmiHWJkEWc",
    seconds: 84,
    advice: "Contains a man who must not, under any circumstances, calm down.", // DRAFT
  },

  // Alex Ross Perry's own channel, "THE COLOR WHEEL Preview"
  "the-color-wheel": {
    id: "gOtO8JBtxpE",
    seconds: 115,
    advice: "Contains a brother, a sister and a motel that only lets married couples share a room.", // DRAFT
  },
};

export const trailerFor = (slug: string): Trailer | undefined => trailers[slug];
