import Link from "next/link";
import Header from "@/components/Header";
import { RssIcon } from "@/components/Icons";

// Everything except the embeddable widget gets the header and footer
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer className="site-footer">
        <nav>
          <Link href="/">What&apos;s on</Link>
          <Link href="/wall">Suggest a video</Link>
          <Link href="/about">About</Link>
          <a href="/rss.xml" className="rss-link">
            <RssIcon /> RSS
          </a>
        </nav>
      </footer>
    </>
  );
}
