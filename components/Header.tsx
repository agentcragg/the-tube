"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isWaiting, usePending } from "@/lib/pending";

const tabs = [
  { href: "/", label: "What's on", match: (p: string) => p === "/" || p.startsWith("/films") },
  { href: "/wall", label: "Suggest a video", match: (p: string) => p.startsWith("/wall") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

export default function Header() {
  // When Vercel regenerates the front page it renders it as "/index", not "/"
  const raw = usePathname();
  const path = raw === "/index" ? "/" : raw;
  // The visitor's own suggestions still waiting for approval, like 2008's "QuickList (2)"
  const waiting = usePending().filter(isWaiting).length;
  return (
    <header className="site-header">
      {/* Placeholder until the real logo is designed */}
      <Link href="/" className="logo">
        THE TUBE
      </Link>
      <nav className="tabs">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={t.match(path) ? "tab tab-on" : "tab"}>
            {t.label}
            {t.href === "/wall" && waiting > 0 && ` (${waiting})`}
          </Link>
        ))}
      </nav>
    </header>
  );
}
