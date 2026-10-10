// Contract for hemant-shell output. Dependency-free so it can run in the
// browser, in Next route handlers and in `node --test` without a bundler.
// Mirrors crates/hemant-core (registry.rs, result.rs, time.rs).

export const TIME_RESULT_SCHEMA = "hemant.time-result/2";
export const METHOD_REGISTRY_SCHEMA = "hemant.method-registry/1";
export const MIN_SUPPORTED_UNIX_NANOS = -62_135_596_800n * 1_000_000_000n;
export const MAX_SUPPORTED_UNIX_NANOS = 253_402_300_800n * 1_000_000_000n - 1n;

export type MethodRecord = {
  id: string;
  version: string;
  kind: string;
  title: string;
  status: "active" | "pending";
  evidence: string;
  verification: "unverified" | "not-applicable";
  inputs: string[];
  source: string;
  time_scale: string;
  frame_or_location: string;
  output_units: string;
  uncertainty: string;
  limitations: string[];
};

export type MethodRegistry = { schema: typeof METHOD_REGISTRY_SCHEMA; methods: MethodRecord[] };

export type TimeResult = {
  schema: typeof TIME_RESULT_SCHEMA;
  registry: typeof METHOD_REGISTRY_SCHEMA;
  reading: {
    method: string;
    kind: "point-snapshot";
    unix_nanos: string;
    time_scale: string;
    time_scale_label: string;
    source: string;
    source_label: string;
    verification: "unverified";
    uncertainty: "unknown";
  };
  civil: { method: string; utc: string };
  epoch: { method: string; unix_nanos: string; utc: string; description: string; precision: string };
  elapsed: {
    method: string;
    convention: string;
    basis: string;
    ahoratra: number;
    muhurta: number;
    kala: number;
    kastha: number;
    nimesha: number;
    residual_nanoseconds: number;
  };
  pending: { method: string; status: string }[];
  methods_used: string[];
};

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const isInt = (v: unknown, min: number, max: number) => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const exactKeys = (o: Record<string, unknown>, keys: string[]) =>
  Object.keys(o).length === keys.length && keys.every((k) => k in o);

const METHOD_KEYS = ["id", "version", "kind", "title", "status", "evidence", "verification", "inputs", "source", "time_scale", "frame_or_location", "output_units", "uncertainty", "limitations"];

export function parseMethodRegistry(raw: unknown): Parsed<MethodRegistry> {
  if (!isObj(raw) || raw.schema !== METHOD_REGISTRY_SCHEMA || !Array.isArray(raw.methods)) return { ok: false, error: "not a hemant.method-registry/1 document" };
  const ids = new Set<string>();
  for (const m of raw.methods) {
    if (!isObj(m) || !exactKeys(m, METHOD_KEYS)) return { ok: false, error: "method record has missing or unknown fields" };
    for (const k of ["id", "version", "kind", "title", "evidence", "source", "time_scale", "frame_or_location", "output_units", "uncertainty"]) {
      if (!isStr(m[k])) return { ok: false, error: `method field ${k} is empty` };
    }
    if (m.status !== "active" && m.status !== "pending") return { ok: false, error: "unknown method status" };
    if (m.verification !== "unverified" && m.verification !== "not-applicable") return { ok: false, error: `method ${String(m.id)} claims verification ${String(m.verification)}` };
    if (!isStrArr(m.inputs) || !m.inputs.length || !isStrArr(m.limitations) || !m.limitations.length) return { ok: false, error: "method inputs/limitations missing" };
    if (m.status === "pending" && m.evidence !== "pending-method") return { ok: false, error: "pending method with non-pending evidence" };
    if (ids.has(m.id as string)) return { ok: false, error: "duplicate method id" };
    ids.add(m.id as string);
  }
  return { ok: true, value: raw as MethodRegistry };
}

export function parseTimeResult(raw: unknown, registry?: MethodRegistry): Parsed<TimeResult> {
  if (!isObj(raw) || raw.schema !== TIME_RESULT_SCHEMA || raw.registry !== METHOD_REGISTRY_SCHEMA) return { ok: false, error: "not a hemant.time-result/2 document" };
  const { reading, civil, epoch, elapsed, pending, methods_used } = raw;
  if (!isObj(reading) || !isObj(civil) || !isObj(epoch) || !isObj(elapsed) || !Array.isArray(pending) || !isStrArr(methods_used)) return { ok: false, error: "missing section" };
  if (reading.kind !== "point-snapshot" || reading.verification !== "unverified" || reading.uncertainty !== "unknown") return { ok: false, error: "reading over-claims or is malformed" };
  for (const k of ["method", "unix_nanos", "time_scale", "time_scale_label", "source", "source_label"]) if (!isStr(reading[k])) return { ok: false, error: `reading.${k} missing` };
  if (!/^-?\d{1,40}$/.test(reading.unix_nanos as string)) return { ok: false, error: "reading.unix_nanos is not an integer string" };
  const nanos = BigInt(reading.unix_nanos as string);
  if (nanos < MIN_SUPPORTED_UNIX_NANOS || nanos > MAX_SUPPORTED_UNIX_NANOS) return { ok: false, error: "reading outside supported range" };
  if (!isStr(civil.method) || !isStr(civil.utc) || !/ UTC$/.test(civil.utc as string)) return { ok: false, error: "civil section malformed" };
  for (const k of ["method", "unix_nanos", "utc", "description", "precision"]) if (!isStr(epoch[k])) return { ok: false, error: `epoch.${k} missing` };
  for (const k of ["method", "convention", "basis"]) if (!isStr(elapsed[k])) return { ok: false, error: `elapsed.${k} missing` };
  if (!isInt(elapsed.ahoratra, -1e9, 1e9) || !isInt(elapsed.muhurta, 0, 29) || !isInt(elapsed.kala, 0, 29) || !isInt(elapsed.kastha, 0, 29) || !isInt(elapsed.nimesha, 0, 14) || !isInt(elapsed.residual_nanoseconds, 0, 213_333_334)) {
    return { ok: false, error: "elapsed units out of range" };
  }
  if (!pending.every((p) => isObj(p) && isStr(p.method) && isStr(p.status) && String(p.status).startsWith("pending"))) return { ok: false, error: "pending section malformed" };
  const sectionMethods = [reading.method, civil.method, epoch.method, elapsed.method] as string[];
  if (sectionMethods.some((m) => !(methods_used as string[]).includes(m))) return { ok: false, error: "section method not listed in methods_used" };
  if (registry) {
    const known = new Map(registry.methods.map((m) => [m.id, m]));
    for (const id of methods_used as string[]) if (known.get(id)?.status !== "active") return { ok: false, error: `method ${id} is not an active registry method` };
    for (const p of pending as { method: string }[]) if (known.get(p.method)?.status !== "pending") return { ok: false, error: `pending method ${p.method} not pending in registry` };
  }
  return { ok: true, value: raw as unknown as TimeResult };
}

/** Validates a caller-supplied Unix-nanosecond string before it reaches the shell. */
export function validateUnixNanosInput(input: string | null): Parsed<string> {
  if (input === null) return { ok: false, error: "unix_nanos is required" };
  const trimmed = input.trim();
  if (!/^-?\d{1,22}$/.test(trimmed)) return { ok: false, error: "unix_nanos must be a signed integer (digits only)" };
  const value = BigInt(trimmed);
  if (value < MIN_SUPPORTED_UNIX_NANOS || value > MAX_SUPPORTED_UNIX_NANOS) return { ok: false, error: "unix_nanos is outside 0001-01-01 to 9999-12-31 UTC" };
  return { ok: true, value: value.toString() };
}

/** Age of a snapshot in whole seconds, from the client's own monotonic clock. */
export function snapshotAgeSeconds(receivedAtMonotonicMs: number, nowMonotonicMs: number): number {
  return Math.max(0, Math.floor((nowMonotonicMs - receivedAtMonotonicMs) / 1000));
}
