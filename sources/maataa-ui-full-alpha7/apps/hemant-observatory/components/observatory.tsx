"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { capabilityLabel, sections } from "@/lib/sections";
import { parseTimeResult, snapshotAgeSeconds } from "@/lib/contract";

const nav = [
  ["⌂", "Overview", "/"],
  ["◷", "Time systems", "/clock"],
  ["◎", "Panchanga", "/panchanga"],
  ["⌖", "Sky & orbits", "/observatory"],
  ["☼", "Sankranti", "/sankranti"],
  ["◫", "Events", "/timeline"],
  ["⌘", "Methods & sources", "/research"],
  ["⌕", "Learn", "/learn"],
  ["✧", "ALLB concepts", "/allb"],
];

export default function Observatory() {
  const [time, setTime] = useState("Awaiting Rust clock");
  const [clockStatus, setClockStatus] = useState("Rust source unavailable");
  const [hemantElapsed, setHemantElapsed] = useState("Waiting for Rust snapshot");
  const [snapshotUtc, setSnapshotUtc] = useState("no snapshot");
  const [methodSummary, setMethodSummary] = useState("method registry unavailable");
  const [frame, setFrame] = useState("Ecliptic · illustrative");
  const [location, setLocation] = useState("Observer not selected");
  const [activeTab, setActiveTab] = useState("Overview");
  const [receivedAt, setReceivedAt] = useState(0);
  const [ageNow, setAgeNow] = useState(0);

  useEffect(() => {
    let timer = 0;
    let baseUnixMs = 0;
    let baseMonotonicMs = 0;
    let cancelled = false;
    const update = () => {
      if (!baseUnixMs) return;
      setAgeNow(performance.now());
      const timestamp = new Date(baseUnixMs + (performance.now() - baseMonotonicMs));
      setTime(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(timestamp));
    };
    fetch("/api/time", { cache: "no-store" })
      .then(async (response) => {
        const raw: unknown = await response.json();
        if (!response.ok) throw new Error("Rust time source unavailable");
        const parsed = parseTimeResult(raw);
        if (!parsed.ok) throw new Error(parsed.error);
        return parsed.value;
      })
      .then((payload) => {
        if (cancelled) return;
        baseUnixMs = Number(BigInt(payload.reading.unix_nanos) / 1_000_000n);
        baseMonotonicMs = performance.now();
        setReceivedAt(baseMonotonicMs);
        setClockStatus(`${payload.reading.source_label} · ${payload.reading.verification}`);
        setMethodSummary(`${payload.reading.method} · uncertainty ${payload.reading.uncertainty}`);
        setSnapshotUtc(payload.civil.utc.replace(/\.\d{9} UTC$/, " UTC"));
        const elapsed = payload.elapsed;
        setHemantElapsed(`${elapsed.ahoratra.toLocaleString("en-IN")} ahoratra · ${elapsed.muhurta} muhurta · ${elapsed.kala} kala · ${elapsed.kastha} kastha · ${elapsed.nimesha} nimesha`);
        update();
        timer = window.setInterval(update, 1000);
      })
      .catch(() => setClockStatus("Rust source unavailable · build the shell"));
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="observatory-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Hemant Samwat Observatory overview">
          <span className="brand-mark" aria-hidden="true">☼</span>
          <span><strong>Hemant Samwat Observatory</strong><small>ASTRONOMY · TIME · PANCHANGA · TRADITION</small></span>
        </Link>
        <div className="top-status"><span className="time-readout"><b>IST</b><strong>{time}</strong><small>{clockStatus}{receivedAt ? ` · snapshot ${snapshotAgeSeconds(receivedAt, ageNow)} s old` : ""}</small></span>
          <span className="status-chip simulation"><i />SIMULATION · NO LIVE FEED</span>
          <span className="top-meta">{location}</span><span className="top-meta">{frame}</span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Observatory navigation">
          <nav>{nav.map(([icon, label, href]) => <Link key={href} href={href} className={href === "/" ? "nav-link active" : "nav-link"}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav>
          <div className="sidebar-bottom"><span className="instrument-seal" aria-hidden="true">◎</span><p>MEASURE · COMPARE · TRACE</p><small>Prototype workspace</small></div>
        </aside>

        <section className="dashboard" aria-label="Observatory dashboard">
          <div className="dashboard-heading">
            <div><p className="eyebrow">OBSERVATORY / OVERVIEW</p><h1>A sky made inspectable.</h1></div>
            <label className="select-label">Observer location<select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Observer location"><option>Observer not selected</option><option>Varanasi · illustrative</option><option>Delhi · illustrative</option><option>Custom coordinates · pending</option></select></label>
          </div>

          <div className="dashboard-grid">
            <section className="instrument-panel sky-panel">
              <div className="panel-heading"><div><p className="eyebrow">CELESTIAL VIEW</p><h2>Reference geometry</h2></div><span className="state-pill sample">Illustrative</span></div>
              <div className="sky-view" role="img" aria-label="Illustrative Sun, Earth and Moon diagram. Not an ephemeris result.">
                <div className="star-field" />
                <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
                <div className="axis axis-x" /><div className="axis axis-y" />
                <span className="celestial-label label-n">N</span><span className="celestial-label label-s">S</span><span className="celestial-label label-e">E</span><span className="celestial-label label-w">W</span>
                <div className="sun-object"><span>☼</span><b>Sun</b></div><div className="earth-object"><span>◉</span><b>Earth</b></div><div className="moon-object"><span>●</span><b>Moon</b></div>
                <div className="frame-control"><label htmlFor="frame">Coordinate frame</label><select id="frame" value={frame} onChange={(event) => setFrame(event.target.value)}><option>Ecliptic · illustrative</option><option>Equatorial · illustrative</option><option>Local horizon · pending observer</option></select></div>
                <span className="view-caption">Geometry is illustrative · positions are not computed</span>
              </div>
              <div className="legend-row"><span><i className="legend-dot gold" />Reference axis</span><span><i className="legend-dot blue" />Sample body</span><span><i className="legend-line" />Illustrative orbit</span></div>
            </section>

            <section className="instrument-panel readings-panel">
              <div className="panel-heading"><div><p className="eyebrow">MEASUREMENTS</p><h2>Source before value</h2></div><span className="info-mark" title="No live instrument or ephemeris is connected">i</span></div>
              <div className="reading-group"><h3>Time systems <span>mixed source</span></h3>
                <div className="reading"><span>Indian Standard Time</span><strong>{time}</strong><em>host · unverified</em></div>
                <div className="reading"><span>Sidereal time</span><strong>—</strong><em>method pending</em></div>
                <div className="reading"><span>Hemant elapsed units</span><strong>{hemantElapsed}</strong><em>Rust snapshot at {snapshotUtc} · selected convention</em></div>
              </div>
              <div className="reading-group"><h3>Selected body <span>none</span></h3>
                <div className="reading"><span>Position · selected frame</span><strong>—</strong><em>source not connected</em></div>
                <div className="reading"><span>Velocity</span><strong>—</strong><em>source not connected</em></div>
                <div className="reading"><span>Uncertainty</span><strong>—</strong><em>not estimated</em></div>
              </div>
              <Link href="/research" className="text-link">Inspect methods and evidence →</Link>
            </section>

            <section className="instrument-panel time-panel">
              <div className="panel-heading"><div><p className="eyebrow">TIME RULER</p><h2>Keep clocks distinct</h2></div><div className="tab-list" role="tablist" aria-label="Time ruler mode">{["Overview", "Scales", "Events"].map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "tab active" : "tab"} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div>
              <div className="ruler-list">{[
                ["UTC", `${snapshotUtc} · Rust civil representation of the snapshot`, "no trusted time source · leap seconds not counted"],
                ["IST", `${time} · advanced from Rust clock snapshot via monotonic elapsed`, methodSummary],
                ["Sidereal", "No calculation available", "method pending"],
                ["Hemant reference", "14 Jan 1979 · Kashi method selected", "epoch reference · minute precision"],
              ].map(([name, value, state]) => <div className="ruler-row" key={name}><b>{name}</b><span>{value}</span><small>{state}</small></div>)}</div>
              <div className="epoch-note"><span aria-hidden="true">✦</span><p>The Hemant units above are from a Rust snapshot at page load. The epoch is a chosen calendar reference, not a clock source; it does not establish astronomical time synchronization.</p></div>
            </section>

            <section className="instrument-panel panchanga-panel">
              <div className="panel-heading"><div><p className="eyebrow">PANCHAṄGA · TRADITIONAL CALENDAR</p><h2>Method required</h2></div><Link href="/panchanga" className="text-link">Open calendar →</Link></div>
              <div className="panchanga-grid">{["Tithi", "Paksha", "Nakshatra", "Yoga", "Karana", "Vara", "Maasa", "Ritu", "Ayana"].map((item) => <div key={item} className="panchanga-cell"><span>{item}</span><b>Not computed</b><small>tradition & ruleset needed</small></div>)}</div>
            </section>

            <section className="instrument-panel evidence-panel">
              <div className="panel-heading"><div><p className="eyebrow">METHODS & EVIDENCE</p><h2>Separate foundations, comparable questions</h2></div><Link href="/research" className="text-link">Method registry →</Link></div>
              <div className="evidence-columns">
                <article><span className="evidence-icon" aria-hidden="true">⌖</span><h3>Empirical astronomy</h3><p>Observations · ephemerides · coordinate transforms · time scales</p><small>Method status: pending selection · no astronomy method is active</small></article>
                <article><span className="evidence-icon" aria-hidden="true">ॐ</span><h3>Vedic / Vedantic traditions</h3><p>Named textual lineage · calendar convention · interpretive method</p><small>Method status: pending tradition and ruleset selection</small></article>
              </div>
              <div className="comparison-note"><b>Comparison does not assume equivalence.</b><span>Testable claims can be compared on defined quantities; cultural, metaphysical, and empirical claims retain their own evidence standards.</span></div>
            </section>

            <section className="instrument-panel timeline-panel">
              <div className="panel-heading"><div><p className="eyebrow">EVENT TIMELINE</p><h2>Historical · computed · planned</h2></div><span className="state-pill sample">No live feed</span></div>
              <div className="timeline-track"><div className="timeline-line" />{[["Historical", "Recorded source"], ["Computed", "Method pending"], ["Planned", "Catalogue only"]].map(([type, detail], index) => <div className={`timeline-item ti-${index}`} key={type}><i /><b>{type}</b><small>{detail}</small></div>)}</div>
            </section>

            <section className="module-index"><div><p className="eyebrow">RUNTIME MODULES</p><h2>Designed to grow by evidence</h2></div><div className="module-links">{sections.map((section) => <Link key={section.slug} href={`/${section.slug}`}><span>{section.title}</span><small>{capabilityLabel[section.capability]}</small></Link>)}</div></section>
          </div>
          <footer className="footer-note"><span>HEMANT SAMWAT OBSERVATORY · LOCAL PROTOTYPE</span><span>Results are tagged by source and method. No flight or observatory hardware is connected.</span></footer>
        </section>
      </div>
    </main>
  );
}
