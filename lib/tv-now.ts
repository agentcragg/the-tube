// The video Basement TV is playing, for the footer drawing's screen (the
// tvscreen idea in lib/look.ts). Set by components/Tv.tsx while /tv is open,
// null everywhere else.

let playing: string | null = null;
const listeners = new Set<() => void>();

export const tvNow = {
  get: () => playing,
  set(id: string | null) {
    if (id === playing) return;
    playing = id;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
