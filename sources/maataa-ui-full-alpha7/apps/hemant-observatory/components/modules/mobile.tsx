"use client";

import { useEffect } from "react";
import { formatIst, useTick, useTimeResult } from "@/components/use-observatory-data";
import { ErrorNote, Facts, Panel } from "./shared";

export default function MobileModule() {
  const [snapshot, refresh] = useTimeResult();
  const now = useTick();
  useEffect(() => refresh(), [refresh]);
  let difference = "—";
  if (snapshot.state === "ready") {
    const snapshotMs = Number(BigInt(snapshot.value.reading.unix_nanos) / 1_000_000n) + (now - snapshot.receivedAt);
    const deviceMs = Date.now();
    difference = `${((deviceMs - snapshotMs) / 1000).toFixed(3)} s (this device minus Rust host snapshot)`;
  }
  return (
    <Panel eyebrow="FIELD VIEW" title="Two clocks, side by side">
      {snapshot.state === "error" && <ErrorNote error={snapshot.error} />}
      {snapshot.state === "loading" && <p role="status">Reading…</p>}
      {snapshot.state === "ready" && (
        <Facts label="Clock comparison" rows={[
          ["Rust host snapshot (advanced)", `IST ${formatIst(snapshot.value.reading.unix_nanos, now - snapshot.receivedAt)}`],
          ["This device's clock", `IST ${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date())}`],
          ["Difference", difference],
          ["What this means", "Both clocks are unverified. Agreement does not verify either; disagreement shows at least one is off or the reading is stale."],
        ]} />
      )}
      <button type="button" className="m-button" onClick={() => refresh()}>Take a new snapshot</button>
    </Panel>
  );
}
