"use client";

import { useEffect } from "react";
import { snapshotAgeSeconds } from "@/lib/contract";
import { formatIst, useTick, useTimeResult } from "@/components/use-observatory-data";
import { Panel, Pending } from "./shared";

export function ClockWidget() {
  const [snapshot, refresh] = useTimeResult();
  const now = useTick();
  useEffect(() => refresh(), [refresh]);
  return (
    <figure className="m-widget" aria-label="Hemant clock widget preview">
      {snapshot.state === "ready" ? (
        <>
          <strong>{formatIst(snapshot.value.reading.unix_nanos, now - snapshot.receivedAt)}</strong>
          <figcaption>IST · {snapshot.value.reading.source_label} · {snapshot.value.reading.verification} · snapshot {snapshotAgeSeconds(snapshot.receivedAt, now)} s old</figcaption>
        </>
      ) : (
        <figcaption>{snapshot.state === "loading" ? "Reading…" : `Unavailable: ${snapshot.error}`}</figcaption>
      )}
    </figure>
  );
}

export default function WidgetsModule() {
  return (
    <Panel eyebrow="PREVIEW" title="Clock widget">
      <ClockWidget />
      <p className="m-note">The widget always shows source, verification state and snapshot age next to the time.</p>
      <Pending>No embeddable package or script is published.</Pending>
    </Panel>
  );
}
