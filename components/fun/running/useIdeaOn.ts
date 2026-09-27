import { useSyncExternalStore } from "react";

// Whether a Fun lab idea is switched on (html.x-<id>). Slots are hidden by CSS
// when an idea is off, but anything with side effects, like changing the tab
// title, has to ask.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useIdeaOn(id: string) {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains(`x-${id}`),
    () => false,
  );
}
