"use client";

import { useEffect, useRef } from "react";

// The Message boards panel. The Well used look opens it on arrival, so the old
// thread titles show; CSS can't open a <details>, and the rest of the panels
// are server-rendered, so this is the one client piece.

export default function Boards({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (document.documentElement.classList.contains("look-used")) ref.current!.open = true;
  }, []);
  return (
    <details ref={ref} className="wp">
      {children}
    </details>
  );
}
