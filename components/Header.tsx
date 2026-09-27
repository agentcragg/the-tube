"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", tone: "tone-blue", label: "What's on", match: (p: string) => p === "/" || p.startsWith("/films") },
  { href: "/wall", tone: "tone-purple", label: "Suggest a video", match: (p: string) => p.startsWith("/wall") },
  { href: "/about", tone: "tone-green", label: "About", match: (p: string) => p.startsWith("/about") },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      {/* Placeholder until the real logo is designed */}
      <Link href="/" className="logo">
        THE TUBE
      </Link>
      <nav className="tabs">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={`tab ${t.tone}${t.match(path) ? " tab-on" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
