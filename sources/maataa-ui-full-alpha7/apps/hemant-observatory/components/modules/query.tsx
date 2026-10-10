"use client";

import { useState } from "react";
import { Pending } from "./shared";
import { bodies } from "@/lib/astronomy";


export function StateQueryBuilder() {
  const [target, setTarget] = useState("301");
  const [observer, setObserver] = useState("399");
  const [epoch, setEpoch] = useState("2000-01-01T12:00:00");
  const [submitted, setSubmitted] = useState(false);
  const same = target === observer;
  return (
    <form className="m-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} aria-label="Ephemeris state query">
      <div className="m-row">
        <label>Target<select value={target} onChange={(e) => { setTarget(e.target.value); setSubmitted(false); }}>{bodies.map((b) => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}</select></label>
        <label>Observer (origin)<select value={observer} onChange={(e) => { setObserver(e.target.value); setSubmitted(false); }}>{bodies.map((b) => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}</select></label>
      </div>
      <div className="m-row">
        <label>Epoch (TDB)<input value={epoch} onChange={(e) => { setEpoch(e.target.value); setSubmitted(false); }} /></label>
        <label>Frame<select disabled value="icrf"><option value="icrf">ICRF-aligned</option></select></label>
        <label>Correction<select disabled value="geometric"><option value="geometric">Geometric</option></select></label>
      </div>
      {same && <p className="m-error" role="alert">Target and observer must differ.</p>}
      <button type="submit" className="m-button" disabled={same}>Request state</button>
      {submitted && !same && (
        <div role="status">
          <pre className="m-code">{JSON.stringify({ target: Number(target), observer: Number(observer), epoch_tdb: epoch, frame: "ICRF", correction: "geometric" }, null, 2)}</pre>
          <Pending>No ephemeris provider is installed, so this query returns <code>Pending</code> (provider <code>NoEphemeris</code>). No position or velocity is shown. See ASTRONOMY-DECISION-001.</Pending>
        </div>
      )}
    </form>
  );
}
