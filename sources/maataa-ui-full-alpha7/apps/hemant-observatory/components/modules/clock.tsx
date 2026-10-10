"use client";

import { useEffect, useState } from "react";
import { snapshotAgeSeconds, validateUnixNanosInput, type TimeResult } from "@/lib/contract";
import { formatIst, useTick, useTimeResult } from "@/components/use-observatory-data";
import { ErrorNote, Facts, Panel } from "./shared";

function ResultFacts({ result, label }: { result: TimeResult; label: string }) {
  const e = result.elapsed;
  return (
    <Facts
      label={label}
      rows={[
        ["UTC (civil representation)", <><span data-testid="utc">{result.civil.utc}</span><small>{result.civil.method}</small></>],
        ["Source", <>{result.reading.source_label}<small>{result.reading.method}</small></>],
        ["Verification · uncertainty", `${result.reading.verification} · ${result.reading.uncertainty}`],
        ["Time scale", result.reading.time_scale_label],
        ["Hemant elapsed", <>{`${e.ahoratra.toLocaleString("en-IN")} ahoratra · ${e.muhurta} muhurta · ${e.kala} kala · ${e.kastha} kastha · ${e.nimesha} nimesha`}<small>{e.method} · {e.basis} · residual {e.residual_nanoseconds.toLocaleString("en-IN")} ns</small></>],
        ["Epoch", <>{result.epoch.description}<small>{result.epoch.method} · {result.epoch.precision} precision</small></>],
        ["Pending", result.pending.map((p) => `${p.method} (${p.status})`).join(" · ")],
      ]}
    />
  );
}

export default function ClockModule() {
  const [live, refresh] = useTimeResult();
  const [converted, convert] = useTimeResult();
  const [input, setInput] = useState("285148740000000000");
  const [dateInput, setDateInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [asked, setAsked] = useState(false);
  const now = useTick();

  useEffect(() => refresh(), [refresh]);

  const submit = () => {
    const checked = validateUnixNanosInput(input);
    if (!checked.ok) return setInputError(checked.error);
    setInputError("");
    setAsked(true);
    convert(checked.value);
  };
  const fromDate = (value: string) => {
    setDateInput(value);
    const ms = Date.parse(`${value}Z`);
    if (!Number.isNaN(ms)) setInput((BigInt(ms) * 1_000_000n).toString());
  };

  return (
    <div className="m-grid">
      <Panel eyebrow="HOST SNAPSHOT" title="Rust time shell reading">
        {live.state === "loading" && <p role="status">Reading the host clock through hemant-shell…</p>}
        {live.state === "error" && <ErrorNote error={live.error} />}
        {live.state === "ready" && (
          <>
            <p className="m-big" aria-live="off">
              IST {formatIst(live.value.reading.unix_nanos, now - live.receivedAt)}
            </p>
            <p className="m-note" data-testid="snapshot-age">
              Snapshot read {snapshotAgeSeconds(live.receivedAt, now)} s ago; the display advances with this browser's monotonic clock. Source: {live.value.reading.source_label} · {live.value.reading.verification} · uncertainty {live.value.reading.uncertainty}.
            </p>
            <ResultFacts result={live.value} label="Host snapshot details" />
          </>
        )}
        <button type="button" className="m-button" onClick={() => refresh()}>Take a new snapshot</button>
      </Panel>

      <Panel eyebrow="CONVERTER" title="Convert a supplied instant">
        <p className="m-note">Input is Unix nanoseconds (UTC, leap seconds not counted), within 0001-01-01 to 9999-12-31. The browser helper converts a UTC date-time to nanoseconds at millisecond precision; the Rust result is the record.</p>
        <form className="m-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <label>UTC date-time helper (optional)
            <input type="datetime-local" step="1" value={dateInput} onChange={(event) => fromDate(event.target.value)} />
          </label>
          <label>Unix nanoseconds
            <input inputMode="numeric" value={input} onChange={(event) => setInput(event.target.value)} aria-invalid={Boolean(inputError)} aria-describedby={inputError ? "convert-error" : undefined} />
          </label>
          {inputError && <p id="convert-error" className="m-error" role="alert">{inputError}</p>}
          <button type="submit" className="m-button">Convert with Rust</button>
        </form>
        {asked && converted.state === "loading" && <p role="status">Converting…</p>}
        {asked && converted.state === "error" && <ErrorNote error={converted.error} />}
        {asked && converted.state === "ready" && <ResultFacts result={converted.value} label="Converted instant details" />}
      </Panel>
    </div>
  );
}
