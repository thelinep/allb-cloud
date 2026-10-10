"use client";

import { useState } from "react";
import { Facts, Panel, Pending } from "./shared";
import { StateQueryBuilder } from "./query";

export default function ObservatoryModule() {
  const [frame, setFrame] = useState("Ecliptic (illustrative)");
  return (
    <div className="m-grid">
      <Panel eyebrow="ILLUSTRATIVE GEOMETRY" title="Reference diagram">
        <label className="m-inline">Frame label<select value={frame} onChange={(e) => setFrame(e.target.value)}><option>Ecliptic (illustrative)</option><option>Equatorial (illustrative)</option></select></label>
        <svg className="m-sky" viewBox="0 0 320 220" role="img" aria-labelledby="sky-title sky-desc">
          <title id="sky-title">Illustrative Sun, Earth and Moon diagram</title>
          <desc id="sky-desc">Not to scale and not computed. Positions are fixed drawing coordinates, not ephemeris results.</desc>
          <ellipse cx="160" cy="110" rx="120" ry="70" className="orbit-path" />
          <line x1="20" y1="110" x2="300" y2="110" className="axis-path" />
          <circle cx="160" cy="110" r="14" className="sun-dot" /><text x="160" y="140" textAnchor="middle">Sun</text>
          <circle cx="262" cy="74" r="7" className="earth-dot" /><text x="262" y="62" textAnchor="middle">Earth</text>
          <circle cx="278" cy="84" r="3" className="moon-dot" /><text x="294" y="96" textAnchor="middle">Moon</text>
          <text x="10" y="210" className="caption">{frame} · not computed</text>
        </svg>
        <Facts label="Text equivalent of the diagram" rows={[["Sun", "drawn at centre · position not computed"], ["Earth", "drawn on the ellipse · position not computed"], ["Moon", "drawn near Earth · position not computed"], ["Frame", `${frame} · label only`]]} />
        <Pending>Real positions need an ephemeris provider (ASTRONOMY-DECISION-001).</Pending>
      </Panel>
      <Panel eyebrow="WHAT A PROVIDER MUST ANSWER" title="State query">
        <StateQueryBuilder />
      </Panel>
    </div>
  );
}
