import { Facts, Panel } from "./shared";
import { StateQueryBuilder } from "./query";
import { bodies } from "@/lib/astronomy";

export default function PlanetaryModule() {
  return (
    <div className="m-grid">
      <Panel eyebrow="FIRST INCREMENT SCOPE" title="Bodies, frame and corrections">
        <Facts label="Supported body codes" rows={bodies.map((b) => [b.name, `NAIF ID ${b.code}`])} />
        <Facts label="Frame and corrections" rows={[["Frame", "ICRF-aligned (as used by JPL DE440)"], ["Correction", "Geometric only; astrometric and apparent are later method versions"], ["Time argument", "TDB seconds past J2000; UTC inputs need a pinned leap-second table"], ["Dataset", "Proposed: NAIF de440s.bsp (1849-12-26 to 2150-01-22), not installed"]]} />
      </Panel>
      <Panel eyebrow="QUERY" title="Request a state vector">
        <StateQueryBuilder />
      </Panel>
    </div>
  );
}
