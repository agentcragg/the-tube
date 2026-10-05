import { useSyncExternalStore } from "react";

// For client components only: lib/look.ts is also read by the server layout.

const noSubscribe = () => () => {};

/** Whether an example is switched on in this browser (false on the server). */
export function useLook(id: string): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => document.documentElement.classList.contains(`look-${id}`),
    () => false,
  );
}
