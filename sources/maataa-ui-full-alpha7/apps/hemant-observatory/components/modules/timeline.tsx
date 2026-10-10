"use client";

import { useState } from "react";
import { Panel, Pending } from "./shared";

type Item = { date: string; title: string; kind: "definitional" | "sourced-reference" | "user-selected"; source: string };

const items: Item[] = [
  { date: "1849-12-26", title: "Start of NAIF de440s.bsp coverage (proposed dataset)", kind: "sourced-reference", source: "NAIF aa_summaries.txt" },
  { date: "1970-01-01 00:00 UTC", title: "Unix epoch (zero of this app's time count)", kind: "definitional", source: "Unix time definition" },
  { date: "1972-01-01", title: "UTC leap-second system begins (first entry of SPICE's leap-second table)", kind: "sourced-reference", source: "NAIF Time Required Reading" },
  { date: "1979-01-14 07:59 UTC", title: "Hemant reference epoch (Kashi Makar Sankranti, 13:29 IST)", kind: "user-selected", source: "User selection; not recomputed" },
  { date: "2000-01-01 12:00 TDB", title: "J2000 epoch (ephemeris time argument origin)", kind: "definitional", source: "SPICE/JPL convention" },
  { date: "2150-01-22", title: "End of NAIF de440s.bsp coverage", kind: "sourced-reference", source: "NAIF aa_summaries.txt" },
];

const kinds = ["all", "definitional", "sourced-reference", "user-selected"] as const;

export default function TimelineModule() {
  const [kind, setKind] = useState<(typeof kinds)[number]>("all");
  const shown = items.filter((i) => kind === "all" || i.kind === kind);
  return (
    <Panel eyebrow="DATED ITEMS" title="Reference timeline">
      <div role="group" aria-label="Filter by evidence class" className="m-segmented">
        {kinds.map((k) => <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <ol className="m-timeline">
        {shown.map((i) => <li key={i.date}><time>{i.date}</time><div><strong>{i.title}</strong><small>{i.kind} · {i.source}</small></div></li>)}
      </ol>
      <Pending>Computed events (eclipses, Sankrantis, conjunctions) and simulations need an implemented ephemeris method. None are shown.</Pending>
    </Panel>
  );
}
