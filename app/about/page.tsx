import Link from "next/link";

export const metadata = { title: "About · The Tube" };

export default function About() {
  return (
    <div className="about">
      <h1 className="section-title">About</h1>
      <p>
        The Tube is a weekly microcinema in the basement of Endeavour, a bar in
        Deptford. It shows internet film: features that feel like YouTube did
        around 2008, screened alongside YouTube videos and other things found
        online.
      </p>
      <p>
        Every Tuesday. About 30 seats. Tickets are £10, which covers what it
        costs to run. Every screening comes with programme notes.
      </p>
      <p>
        The website is part of the project. If you know a video that should be
        shown, <Link href="/wall">suggest it</Link>.
      </p>
    </div>
  );
}
