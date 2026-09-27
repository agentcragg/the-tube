// Endeavour, drawn (Fun lab idea 5): timings and copy for the footer strip
// and the Find us map (components/fun/endeavour). The drawings themselves are
// a grey stand-in until a commissioned illustration replaces them.

// When the strip changes, in minutes after midnight, London time.
// DRAFT: the queue and screening times are guesses until each night has a
// running order (doors, feature start, end).
export const STRIP_TIMES = {
  egg: 3 * 60 + 14, // 03:14, for one minute: the projector runs for an empty room
  morning: 6 * 60, // deliveries
  day: 11 * 60, // quiet bar
  evening: 17 * 60, // bar lit; on a screening day the basement lights go on and the chairs come out
  queue: 19 * 60, // screening days: a queue on the stairs
  screening: 20 * 60, // screening days: lights down, screen on
  after: 22 * 60 + 45, // screening days: chairs stacked
};

// The small note in the corner of the stand-in, so the states can be told
// apart while comparing ideas. Goes when the real drawing arrives.
// DRAFT
export const STAND_IN = "Stand-in sketch";
export const STATE_NOTES = {
  morning: "morning, deliveries",
  day: "afternoon",
  evening: "evening",
  setup: "chairs out downstairs",
  queue: "queue on the stairs",
  screening: "screening",
  after: "chairs stacked",
  night: "night",
  egg: "3:14am",
} as const;

// Find us box. DRAFT: the caption line comes from the idea's spec.
export const MAP_CAPTION = "Endeavour · just upstairs from this cinema";

// DRAFT. Routes and walking times are worked out from OpenStreetMap
// (Deptford Bridge DLR is about 150 m east of the door; Deptford station
// about 550 m on foot). Matt to confirm the stairs, and walk it.
export const DIRECTIONS = [
  "From Deptford Bridge DLR: west along Deptford Broadway, over the river. Endeavour is on the left, two minutes on.",
  "From Deptford station: down the High Street, across the Broadway, then left.",
  "The cinema is downstairs, through the bar.",
];
