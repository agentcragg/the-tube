"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// 2008's ring of grey dots while the next
// page is on its way. A click on a link to another page here starts it, and
// the new page arriving (its path changes) stops it, so it only ever shows
// for as long as the page really takes. Its CSS waits a moment before
// showing it, so a page that's already been fetched never flashes it.

const GIVE_UP_MS = 20_000; // in case a navigation never finishes

export default function NavSpinner() {
  const path = usePathname();
  const [waiting, setWaiting] = useState<string | null>(null); // the path it was clicked from
  // A new page, however it came (Back included), ends any wait
  const [shown, setShown] = useState(path);
  if (shown !== path) {
    setShown(path);
    setWaiting(null);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const to = new URL(a.href, location.href);
      // Another site, or this page again: a #link, or the same page with
      // other ?options, which is quick and wouldn't change the path to stop it
      if (to.origin !== location.origin || to.pathname === location.pathname) return;
      setWaiting(path);
    };
    // Capture, so it's seen before a link's own handler takes the click over
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [path]);

  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => setWaiting(null), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [waiting]);

  if (waiting !== path) return null;
  return (
    <div className="nav-spinner" role="status">
      <span className="spinner" aria-hidden />
      Loading…
    </div>
  );
}
