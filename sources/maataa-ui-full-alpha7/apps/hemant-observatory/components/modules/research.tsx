"use client";

import { useState } from "react";
import { useMethodRegistry } from "@/components/use-observatory-data";
import type { MethodRecord } from "@/lib/contract";
import { ErrorNote, Panel } from "./shared";

export function MethodCard({ method }: { method: MethodRecord }) {
  return (
    <article className="m-method" aria-label={`Method ${method.id}`}>
      <header>
        <code>{method.id}</code>
        <span className={`state-pill ${method.status === "active" ? "prototype" : "planned"}`}>{method.status}</span>
      </header>
      <h3>{method.title}</h3>
      <dl>
        <div><dt>Evidence</dt><dd>{method.evidence}</dd></div>
        <div><dt>Verification</dt><dd>{method.verification}</dd></div>
        <div><dt>Version</dt><dd>{method.version}</dd></div>
        <div><dt>Inputs</dt><dd>{method.inputs.join("; ")}</dd></div>
        <div><dt>Source</dt><dd>{method.source}</dd></div>
        <div><dt>Time scale</dt><dd>{method.time_scale}</dd></div>
        <div><dt>Frame / location</dt><dd>{method.frame_or_location}</dd></div>
        <div><dt>Output units</dt><dd>{method.output_units}</dd></div>
        <div><dt>Uncertainty</dt><dd>{method.uncertainty}</dd></div>
      </dl>
      <ul>{method.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
    </article>
  );
}

export default function ResearchModule() {
  const registry = useMethodRegistry();
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  return (
    <Panel eyebrow="LIVE FROM hemant-shell --methods-json" title="Method registry">
      <p className="m-note">This list is served by the Rust core, not written into the page. “Unverified” is a state, not a quality score.</p>
      <div role="group" aria-label="Filter methods" className="m-segmented">
        {(["all", "active", "pending"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>
        ))}
      </div>
      {registry.state === "loading" && <p role="status">Loading the registry…</p>}
      {registry.state === "error" && <ErrorNote error={registry.error} />}
      {registry.state === "ready" && (
        <>
          <p className="m-note">Schema <code>{registry.value.schema}</code> · {registry.value.methods.length} methods</p>
          <div className="m-methods">
            {registry.value.methods.filter((m) => filter === "all" || m.status === filter).map((m) => <MethodCard key={m.id} method={m} />)}
          </div>
        </>
      )}
      <p className="m-note">Design records: <code>ASTRONOMY-DECISION-001.md</code>, <code>PANCHANGA-DECISION.md</code> in the app folder.</p>
    </Panel>
  );
}
