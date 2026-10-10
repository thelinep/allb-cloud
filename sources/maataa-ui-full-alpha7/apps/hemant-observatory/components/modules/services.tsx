import { Panel } from "./shared";

const services = [
  ["hemant-shell CLI", "Runs locally", "Rust; prints text, hemant.time-result/2 or the method registry"],
  ["Local API (/api/time, /api/convert, /api/methods)", "Runs locally", "Next.js route handlers on 127.0.0.1:4210"],
  ["Observatory web app", "Runs locally", "This interface"],
  ["Ephemeris service", "Planned", "Blocked on ASTRONOMY-DECISION-001"],
  ["Panchanga service", "Planned", "Blocked on tradition and location decisions"],
  ["samwat.allb.xyz", "Not deployed", "Canonical MAATAA hostname direction; DNS, origin, TLS and external verification remain open"],
] as const;

export default function ServicesModule() {
  return (
    <Panel eyebrow="INVENTORY" title="What runs, and what does not">
      <div className="m-table-wrap">
        <table className="m-table">
          <caption className="sr-only">Service inventory</caption>
          <thead><tr><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Notes</th></tr></thead>
          <tbody>{services.map(([name, status, notes]) => <tr key={name}><th scope="row">{name}</th><td><span className={`state-pill ${status === "Runs locally" ? "prototype" : "planned"}`}>{status}</span></td><td>{notes}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="m-note">No telescope, sensor, spacecraft or external data feed is connected.</p>
    </Panel>
  );
}
