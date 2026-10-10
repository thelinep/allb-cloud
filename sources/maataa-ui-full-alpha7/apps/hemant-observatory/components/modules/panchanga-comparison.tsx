"use client";

import { useMemo, useState, type FormEvent } from "react";
import { comparisonAxes, type ComparisonAxisKey, type PanchangaProfileSelection } from "@/lib/panchanga";
import { Panel, Pending } from "./shared";

type Profile = { id: number; name: string; choices: PanchangaProfileSelection };

const emptySelection = Object.fromEntries(comparisonAxes.map((axis) => [axis.key, ""])) as PanchangaProfileSelection;

function chosenLabel(axisKey: ComparisonAxisKey, id: string) {
  const axis = comparisonAxes.find((item) => item.key === axisKey);
  return axis?.options.find((option) => option.id === id)?.label ?? "—";
}

export function PanchangaComparison() {
  const [selection, setSelection] = useState<PanchangaProfileSelection>(emptySelection);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [nextId, setNextId] = useState(1);
  const ready = comparisonAxes.every((axis) => selection[axis.key] !== "");
  const nextName = useMemo(() => `Track ${profiles.length + 1}`, [profiles.length]);

  function addProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || profiles.length >= 4) return;
    setProfiles((current) => [...current, { id: nextId, name: `Track ${current.length + 1}`, choices: { ...selection } }]);
    setNextId((id) => id + 1);
  }

  return (
    <Panel title="Compare Panchanga rule profiles">
      <p className="m-note">Choose one option in each dimension, then add it as a comparison track. Build up to four tracks side by side. The catalog keeps alternatives visible; adding a track records assumptions only and does not claim to calculate or validate a Panchang.</p>
      <form className="m-form m-compare-form" onSubmit={addProfile}>
        <div className="m-compare-fields">
          {comparisonAxes.map((axis) => (
            <label key={axis.key}>
              {axis.label}
              <select
                value={selection[axis.key]}
                onChange={(event) => setSelection((current) => ({ ...current, [axis.key]: event.target.value }))}
                aria-describedby={`${axis.key}-help`}
              >
                <option value="">Choose an option…</option>
                {axis.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <small id={`${axis.key}-help`}>{axis.help}</small>
            </label>
          ))}
        </div>
        <div className="m-compare-actions">
          <button className="m-button" type="submit" disabled={!ready || profiles.length >= 4}>Add {nextName} to comparison</button>
          <span className="m-note">{profiles.length}/4 tracks · Nothing is saved or sent.</span>
        </div>
      </form>

      {profiles.length > 0 ? (
        <div className="m-table-wrap" aria-live="polite">
          <table className="m-table m-compare-table">
            <caption>Selected rule assumptions. Computed comparison values are not available yet.</caption>
            <thead><tr><th scope="col">Dimension</th>{profiles.map((profile) => <th scope="col" key={profile.id}>{profile.name}<button className="m-remove-track" type="button" onClick={() => setProfiles((current) => current.filter((item) => item.id !== profile.id))} aria-label={`Remove ${profile.name}`}>Remove</button></th>)}</tr></thead>
            <tbody>{comparisonAxes.map((axis) => <tr key={axis.key}><th scope="row">{axis.label}</th>{profiles.map((profile) => <td key={profile.id}>{chosenLabel(axis.key, profile.choices[axis.key])}</td>)}</tr>)}</tbody>
          </table>
          <Pending>This table compares declared assumptions only. Parallel astronomical/Panchanga outputs will remain unavailable until each profile has an implemented method and published reference vectors.</Pending>
        </div>
      ) : <p className="m-empty">No comparison tracks yet. Select the rules you want to evaluate; none is preselected as the authority.</p>}

      <details className="m-option-catalog">
        <summary>Review every candidate and its source notes</summary>
        {comparisonAxes.map((axis) => (
          <section key={axis.key} aria-labelledby={`${axis.key}-catalog`}>
            <h3 id={`${axis.key}-catalog`}>{axis.label}</h3>
            <ul className="m-list">
              {axis.options.map((option) => (
                <li key={option.id}>
                  <strong>{option.label}.</strong> {option.detail}
                  {"source" in option && option.source && <> <a href={option.source} target="_blank" rel="noreferrer">{option.sourceLabel}</a></>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </details>
    </Panel>
  );
}
