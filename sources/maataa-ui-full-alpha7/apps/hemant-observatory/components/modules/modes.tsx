"use client";

import { useState } from "react";
import { useMethodRegistry } from "@/components/use-observatory-data";
import { ErrorNote, Panel } from "./shared";

const modes = {
  scientific: (m: { title: string; time_scale: string; uncertainty: string; evidence: string }) => `${m.title}: time scale ${m.time_scale}; uncertainty ${m.uncertainty}; evidence ${m.evidence}.`,
  learning: (m: { title: string; evidence: string }) => `${m.title} — this result is “${m.evidence}”. That tells you where it comes from, not how accurate it is.`,
  tradition: (m: { title: string; source: string }) => `${m.title} — named convention or source: ${m.source}.`,
} as const;

export default function ModesModule() {
  const [mode, setMode] = useState<keyof typeof modes>("scientific");
  const registry = useMethodRegistry();
  return (
    <Panel eyebrow="SAME EVIDENCE, DIFFERENT EXPLANATION" title="Observatory modes">
      <div role="group" aria-label="Presentation mode" className="m-segmented">
        {(Object.keys(modes) as (keyof typeof modes)[]).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}
      </div>
      {registry.state === "error" && <ErrorNote error={registry.error} />}
      {registry.state === "ready" && (
        <ul className="m-list" aria-live="polite">
          {registry.value.methods.map((m) => <li key={m.id}><code>{m.id}</code> · <span className={`state-pill ${m.status === "active" ? "prototype" : "planned"}`}>{m.status}</span><br />{modes[mode](m)}</li>)}
        </ul>
      )}
      <p className="m-note">Status, evidence and values are identical in every mode.</p>
    </Panel>
  );
}
