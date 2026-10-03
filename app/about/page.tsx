import { Crop } from "@/components/endeavour";
import ProfileStats from "@/components/ProfileStats";
import { films, formatDate, VENUE } from "@/lib/films";

export const metadata = { title: "About · The Tube" };

export default function About() {
  return (
    // The building look makes this a 2008 channel page, profile on the left;
    // without it the wrapper and its boxes do nothing
    <div className="about-channel">
      <section className="box x-building">
        <div className="box-head">
          <h2>The Tube</h2>
        </div>
        <div className="box-body">
          <div className="avatar-frame" style={{ width: 240 }}>
            <Crop crop="building" />
          </div>
          <dl className="profile">
            <dt>Location</dt>
            <dd>
              {VENUE.oneLine}{" "}
              <a href={VENUE.map} target="_blank" rel="noreferrer">
                Map »
              </a>
            </dd>
            <dt>Nights</dt>
            <dd>Tuesdays</dd>
            <dt>First night</dt>
            <dd>{formatDate(films[0].date)}</dd>
            <dt>Seats</dt>
            <dd>30</dd>
            <dt>Tickets</dt>
            <dd>£10</dd>
            <ProfileStats />
          </dl>
        </div>
      </section>

      <div className="about">
        <h1 className="section-title">About</h1>
        <p>About text to come.</p>

        <section className="box x-building">
          <div className="box-head">
            <h2>Photos</h2>
          </div>
          <div className="box-body photos">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ph">
                Photo to come.
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
