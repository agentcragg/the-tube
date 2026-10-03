import { useSyncExternalStore } from "react";

// For client components only: lib/look.ts is also read by the server layout.

const noSubscribe = () => () => {};

/** Whether an example or idea is switched on in this browser (false on the server). */
export function useLook(id: string): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const c = document.documentElement.classList;
      return c.contains(`look-${id}`) || c.contains(`idea-${id}`);
    },
    () => false,
  );
}
