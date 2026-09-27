import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tube",
  description: "A weekly microcinema for internet film. Every Tuesday at Endeavour, Deptford.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <nav>
            <Link href="/">What&apos;s on</Link>
            <Link href="/wall">Suggest a video</Link>
            <Link href="/about">About</Link>
            <a href="#">Mailing list</a>
            <a href="#">Instagram</a>
            <a href="#">Contact</a>
          </nav>
          <p>© 2027 The Tube · Basement of Endeavour, Deptford, London</p>
        </footer>
      </body>
    </html>
  );
}
