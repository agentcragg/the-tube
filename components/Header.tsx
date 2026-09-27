"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "What's on", match: (p: string) => p === "/" || p.startsWith("/films") },
  { href: "/wall", label: "Suggest a video", match: (p: string) => p.startsWith("/wall") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="logo-row">
        {/* Placeholder until the real logo is designed */}
        <Link href="/" className="logo">
          THE TUBE
        </Link>
        <span className="beta" title="Everything was in beta in 2007">
          BETA
        </span>
      </div>
      <nav className="tabs">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={t.match(path) ? "tab tab-on" : "tab"}>
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
