"use client";

import { useState } from "react";
import { Panel, Pending } from "./shared";

const checks = [
  ["name", "A name and a one-sentence definition"],
  ["numerator", "Numerator quantity with units"],
  ["denominator", "Denominator quantity with units"],
  ["prediction", "A falsifiable prediction (what value, for what system, within what tolerance)"],
  ["data", "An independent data source to test against"],
] as const;

export default function RatiosModule() {
  const [draft, setDraft] = useState<Record<(typeof checks)[number][0], string>>({ name: "", numerator: "", denominator: "", prediction: "", data: "" });
  const complete = checks.filter(([k]) => draft[k].trim().length >= 3).length;
  return (
    <div className="m-grid">
      <Panel eyebrow="DRAFT · NOT SAVED" title="Define a ratio before claiming it">
        <form className="m-form" onSubmit={(e) => e.preventDefault()}>
          {checks.map(([key, label]) => (
            <label key={key}>{label}<input value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /></label>
          ))}
        </form>
        <p className="m-note" role="status">Checklist: {complete} of {checks.length} parts drafted. A complete draft is still only a <em>candidate</em>; acceptance needs a reproducible test run against the stated data.</p>
      </Panel>
      <Panel eyebrow="ACCEPTED DEFINITIONS" title="Registry">
        <p className="m-big">0</p>
        <Pending>No ratio (including any Dixit-Saankhya ratio) has a recorded definition and passing test, so none is shown or applied. Drafts stay in this page and are not stored or sent anywhere.</Pending>
      </Panel>
    </div>
  );
}
