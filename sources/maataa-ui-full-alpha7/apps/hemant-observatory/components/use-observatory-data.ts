"use client";

import { useCallback, useEffect, useState } from "react";
import { parseMethodRegistry, parseTimeResult, type MethodRegistry, type TimeResult } from "@/lib/contract";

export type Load<T> =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "ready"; value: T; receivedAt: number };

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body ? String((body as { error: unknown }).error) : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export function useMethodRegistry(): Load<MethodRegistry> {
  const [load, setLoad] = useState<Load<MethodRegistry>>({ state: "loading" });
  useEffect(() => {
    let cancelled = false;
    getJson("/api/methods")
      .then((raw) => {
        const parsed = parseMethodRegistry(raw);
        if (cancelled) return;
        setLoad(parsed.ok ? { state: "ready", value: parsed.value, receivedAt: performance.now() } : { state: "error", error: parsed.error });
      })
      .catch((error: Error) => !cancelled && setLoad({ state: "error", error: error.message }));
    return () => {
      cancelled = true;
    };
  }, []);
  return load;
}

/** Fetches one host snapshot (or a conversion) and validates it client-side too. */
export function useTimeResult(): [Load<TimeResult>, (unixNanos?: string) => void] {
  const [load, setLoad] = useState<Load<TimeResult>>({ state: "loading" });
  const request = useCallback((unixNanos?: string) => {
    setLoad({ state: "loading" });
    const url = unixNanos === undefined ? "/api/time" : `/api/convert?unix_nanos=${encodeURIComponent(unixNanos)}`;
    getJson(url)
      .then((raw) => {
        const parsed = parseTimeResult(raw);
        setLoad(parsed.ok ? { state: "ready", value: parsed.value, receivedAt: performance.now() } : { state: "error", error: parsed.error });
      })
      .catch((error: Error) => setLoad({ state: "error", error: error.message }));
  }, []);
  return [load, request];
}

/** Re-renders every second while mounted (for snapshot age / advancing display). */
export function useTick(ms = 1000): number {
  const [now, setNow] = useState(() => (typeof performance === "undefined" ? 0 : performance.now()));
  useEffect(() => {
    const id = window.setInterval(() => setNow(performance.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export function formatIst(unixNanos: string, advanceMs = 0): string {
  const ms = Number(BigInt(unixNanos) / 1_000_000n) + advanceMs;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "outside browser date range";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium", hour12: false }).format(date);
}
