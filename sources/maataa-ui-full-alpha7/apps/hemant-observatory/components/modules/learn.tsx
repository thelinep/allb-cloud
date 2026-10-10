import Link from "next/link";
import { Panel } from "./shared";

const scales = [
  ["Unix time", "Counts 86 400-second days from 1970-01-01 UTC. It skips leap seconds, so it cannot show 23:59:60.", "This app's internal scale"],
  ["UTC", "Civil time kept within 0.9 s of Earth rotation by inserting leap seconds (since 1972).", "Displayed as a representation of Unix time"],
  ["TAI", "Atomic seconds; UTC differs from TAI by the accumulated leap seconds.", "Not computed here"],
  ["TT", "Terrestrial Time = TAI + 32.184 s (NAIF Time Required Reading).", "Not computed here"],
  ["TDB", "Barycentric time used to evaluate solar-system ephemerides; differs from TT by a periodic term of about 1.66 ms (NAIF).", "Needed for the planned ephemeris"],
  ["Sidereal time", "Earth's rotation angle relative to the stars; needs UT1 and Earth-orientation data.", "Not computed here"],
] as const;

const positions = [
  ["Geometric", "Where a body is at an instant, ignoring light travel."],
  ["Astrometric", "Corrected for light-time; no stellar aberration."],
  ["Apparent", "Also corrected for light deflection and aberration (and refraction for Earth sites)."],
] as const;

export default function LearnModule() {
  return (
    <div className="m-grid">
      <Panel eyebrow="TIME SCALES" title="Why the observatory keeps clocks apart">
        <div className="m-cards">{scales.map(([name, text, here]) => <article className="m-card" key={name}><h3>{name}</h3><p>{text}</p><small>{here}</small></article>)}</div>
        <p className="m-note">Try it: the <Link href="/clock">converter</Link> shows how a Unix-nanosecond value becomes UTC and Hemant units.</p>
      </Panel>
      <Panel eyebrow="POSITIONS" title="Three kinds of “where”">
        <div className="m-cards">{positions.map(([name, text]) => <article className="m-card" key={name}><h3>{name}</h3><p>{text}</p></article>)}</div>
        <p className="m-note">Definitions follow the JPL Horizons manual. Sources are listed in ASTRONOMY-DECISION-001.</p>
      </Panel>
    </div>
  );
}
