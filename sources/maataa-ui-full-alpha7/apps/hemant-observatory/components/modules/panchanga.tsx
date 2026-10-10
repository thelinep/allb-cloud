import { panchangaDecisions, panchangaFields } from "@/lib/panchanga";
import { Panel, Pending } from "./shared";
import { LiveAngleCalculation } from "./live-angle-calculation";
import { PanchangaComparison } from "./panchanga-comparison";

export default function PanchangaModule() {
  return (
    <div className="m-grid">
      <LiveAngleCalculation />
      <PanchangaComparison />
      <Panel eyebrow="FIELD COVERAGE" title="What this method computes">
        <p className="m-note">Tithi, paksha and karana are now calculated for one explicit JPL apparent-longitude instant. The remaining fields stay pending until location and tradition rules are selected.</p>
        <div className="m-table-wrap">
          <table className="m-table">
            <caption className="sr-only">Panchanga fields, their measured quantity, inputs and convention dependence</caption>
            <thead><tr><th scope="col">Field</th><th scope="col">Measures</th><th scope="col">Inputs</th><th scope="col">Convention-dependent</th><th scope="col">Value</th></tr></thead>
            <tbody>
              {panchangaFields.map((f) => (
                <tr key={f.key}>
                  <th scope="row"><span lang="sa">{f.devanagari}</span> · {f.name}</th>
                  <td>{f.measures}</td>
                  <td>{f.inputs.join(", ")}</td>
                  <td>{f.conventionDependent}</td>
                  <td><span className={`state-pill ${["tithi", "paksha", "karana"].includes(f.key) ? "cap-partial" : "planned"}`}>{["tithi", "paksha", "karana"].includes(f.key) ? "instant only" : "pending"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel eyebrow="DECISIONS REQUIRED" title="Before any value is shown">
        <ol className="m-list">
          {panchangaDecisions.map((d) => <li key={d.key}><strong>{d.key}</strong> — {d.question} <span className="state-pill planned">{d.status}</span></li>)}
        </ol>
        <Pending>Full Panchanga still needs sunrise-based day assignment, a named tradition and edition, ayanamsha, location, month rules, and published comparison cases. Instant calculations are not used as substitutes for those choices.</Pending>
      </Panel>
    </div>
  );
}
