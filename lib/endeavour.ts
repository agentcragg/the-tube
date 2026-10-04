// Endeavour, drawn: when the footer strip changes (components/endeavour).

// When the strip changes, in minutes after midnight, London time.
// DRAFT: the queue and screening times are guesses until each night has a
// running order (doors, feature start, end).
export const STRIP_TIMES = {
  egg: 3 * 60, // 03:00 to 04:00: the projector runs for an empty room
  eggEnd: 4 * 60,
  morning: 6 * 60, // deliveries
  day: 11 * 60, // quiet bar
  evening: 17 * 60, // bar lit; on a screening day the basement lights go on and the chairs come out
  queue: 19 * 60, // screening days: a queue on the stairs
  screening: 20 * 60, // screening days: lights down, screen on
  after: 22 * 60 + 45, // screening days: chairs stacked
};
