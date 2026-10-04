"use client";

import { useEffect } from "react";
import { useLook } from "@/lib/use-look";

// Idea "tune" (app/idea-tune.css): the site's pictures behave like little
// TVs. One that's still on its way shows snow while it's on screen (and keeps
// it if it never comes: no signal); the first time each picture is on screen
// it switches on, a bright line opening out into the picture. Pictures already
// showing when the page comes to life are left alone, so nothing flickers on
// arrival. Runs after hydration and only adds classes, so React never sees a
// difference.

// Blurred copies behind upright TikToks: their picture switching on is enough
const SKIP = ".tile-blur, .tt-blur";
// A film's later stills, only seen by scrubbing: snow while loading, no switching on
const QUIET = ".scrub-frame:not(:first-child) img";

export default function Tune() {
  const on = useLook("tune");

  useEffect(() => {
    const main = document.querySelector("main");
    if (!on || !main) return;
    const taken = new WeakSet<Element>();
    // Neighbours' snow out of step with each other, as it would be on separate sets
    const phase = new WeakMap<Element, string>();
    let count = 0;
    const snow = (img: Element) => phase.get(img) ?? "snow-0";
    const ready = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;
    const showing = (img: HTMLImageElement) => {
      const r = img.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    };
    const switchOn = (img: HTMLImageElement) => {
      io.unobserve(img);
      img.classList.remove("tuning", snow(img));
      if (img.matches(QUIET)) return;
      img.classList.add("tune-on");
      img.addEventListener("animationend", () => img.classList.remove("tune-on"), { once: true });
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const img = e.target as HTMLImageElement;
        if (!e.isIntersecting) img.classList.remove("tuning", snow(img));
        else if (ready(img)) switchOn(img);
        else img.classList.add("tuning", snow(img));
      }
    });
    const take = (img: HTMLImageElement, atStart: boolean) => {
      if (taken.has(img) || img.matches(SKIP)) return;
      taken.add(img);
      phase.set(img, `snow-${count++ % 4}`);
      if (atStart && ready(img) && showing(img)) return;
      if (!ready(img)) {
        // Arriving while on screen: switch on now; off screen, when it's scrolled to
        img.addEventListener("load", () => img.classList.contains("tuning") && switchOn(img), { once: true });
      }
      io.observe(img);
    };

    main.querySelectorAll("img").forEach((img) => take(img, true));
    // New pages and the wall's tiles as they're made, and let go of the ones that go
    const each = (nodes: NodeList, fn: (img: HTMLImageElement) => void) =>
      nodes.forEach((n) => {
        if (n instanceof HTMLImageElement) fn(n);
        else if (n instanceof Element) n.querySelectorAll("img").forEach(fn);
      });
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        each(r.addedNodes, (img) => take(img, false));
        each(r.removedNodes, (img) => io.unobserve(img));
      }
    });
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [on]);

  return null;
}
