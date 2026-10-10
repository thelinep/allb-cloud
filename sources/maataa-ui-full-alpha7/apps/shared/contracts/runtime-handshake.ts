/**
 * MAATAA Desktop → runtime handshake contract, draft v0.1.0.
 *
 * Grounding (read-only inspection of ALLB.xyz at de82c3691ae3, 2026-10-09):
 * - `services/edge_worker/src/index.ts` answers `GET /health` with
 *   `{ status: "OK", service: "maataa-sovereign-worker", environment, contractVersion }`.
 * - `crates/siddham-contracts` declares SCHEMA_VERSION "1.1.0" and accepts
 *   major 1, minor 0..=1; unknown majors and unknown fields are rejected.
 * - `RuntimeCapability` is `{ id, available, mode, detail }` with mode
 *   `SoftwareNative | SoftwareWasm | SiddhamNpu`.
 *
 * Deliberately NOT part of this contract: K7 (no implementation found),
 * Hemant Samwat time (a bounded no_std primitive, not a host clock service),
 * and the maataa-os embedded kernel (no host-side handshake exists).
 * A result is `connected` only after a real transport returned a health
 * document that validates here. Nothing in this module fabricates a runtime.
 */

export const RUNTIME_HANDSHAKE_VERSION = "0.1.0" as const;
export const ALLB_EXPECTED_SERVICE = "maataa-sovereign-worker" as const;
export const ALLB_CONTRACT_COMPATIBILITY = {
  supportedMajor: 1,
  minimumMinor: 0,
  maximumMinor: 1,
} as const;
export const HOST_TIME_BASIS = "host-unix-clock-unverified" as const;
export const NOT_CLAIMED = ["k7", "hemant-samwat-clock", "maataa-os-kernel"] as const;

export type ExecutionMode = "SoftwareNative" | "SoftwareWasm" | "SiddhamNpu";
export interface RuntimeCapability {
  id: string;
  available: boolean;
  mode: ExecutionMode;
  detail: string;
}

export type RuntimeConnectionState = "connected" | "unavailable" | "incompatible";

export interface RuntimeHandshakeRequest {
  handshakeVersion: typeof RUNTIME_HANDSHAKE_VERSION;
  requestId: string;
  client: { id: "maataa-desktop"; version: string };
  requestedCapabilities: string[];
}

export interface RuntimeProbeResponse {
  /** Parsed JSON body of the runtime's health response. */
  health: unknown;
  /** Parsed capability list, only when the transport has a real source for it. */
  capabilities?: unknown;
  /** e.g. "http-loopback". Test doubles must identify themselves honestly. */
  transport: string;
  endpoint: string;
}

export interface RuntimeTransport {
  readonly kind: string;
  probe(request: RuntimeHandshakeRequest, signal: AbortSignal): Promise<RuntimeProbeResponse>;
}

export interface RuntimeHandshakeResult {
  handshakeVersion: typeof RUNTIME_HANDSHAKE_VERSION;
  requestId: string;
  state: RuntimeConnectionState;
  runtime: { service: string | null; contractVersion: string | null; environment: string | null };
  health: "ok" | "not-ok" | "unknown";
  capabilities: RuntimeCapability[];
  capabilitiesReported: boolean;
  /** Requested capabilities not proven available by the runtime itself. */
  missingCapabilities: string[];
  reasons: string[];
  evidence: {
    transport: string | null;
    endpoint: string | null;
    /** ALLB's /health does not echo request IDs; correlation is local only. */
    runtimeEchoedRequestId: false;
    checkedAtHostUnixMs: number;
    timeBasis: typeof HOST_TIME_BASIS;
    notClaimed: readonly string[];
  };
}

const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;
const CAPABILITY_ID = /^[a-z0-9][a-z0-9:-]{2,63}$/;
const MODES: readonly ExecutionMode[] = ["SoftwareNative", "SoftwareWasm", "SiddhamNpu"];
const HEALTH_KEYS = new Set(["status", "service", "environment", "contractVersion"]);
const CAPABILITY_KEYS = ["id", "available", "mode", "detail"];

export function isCompatibleContractVersion(version: unknown): boolean {
  if (typeof version !== "string") return false;
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return major === ALLB_CONTRACT_COMPATIBILITY.supportedMajor
    && minor >= ALLB_CONTRACT_COMPATIBILITY.minimumMinor
    && minor <= ALLB_CONTRACT_COMPATIBILITY.maximumMinor;
}

/** Strict parse; returns null for anything that is not a well-formed list. */
export function parseRuntimeCapabilities(raw: unknown): RuntimeCapability[] | null {
  if (!Array.isArray(raw) || raw.length > 64) return null;
  const parsed: RuntimeCapability[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length !== CAPABILITY_KEYS.length || !CAPABILITY_KEYS.every((key) => keys.includes(key))) return null;
    if (typeof record.id !== "string" || !CAPABILITY_ID.test(record.id)) return null;
    if (typeof record.available !== "boolean") return null;
    if (!MODES.includes(record.mode as ExecutionMode)) return null;
    if (typeof record.detail !== "string" || record.detail.length > 240) return null;
    parsed.push({ id: record.id, available: record.available, mode: record.mode as ExecutionMode, detail: record.detail });
  }
  return parsed;
}

export interface HandshakeOptions {
  clientVersion: string;
  requestedCapabilities?: string[];
  timeoutMs?: number;
  createRequestId?: () => string;
  now?: () => number;
}

function baseResult(requestId: string, checkedAt: number): RuntimeHandshakeResult {
  return {
    handshakeVersion: RUNTIME_HANDSHAKE_VERSION,
    requestId,
    state: "unavailable",
    runtime: { service: null, contractVersion: null, environment: null },
    health: "unknown",
    capabilities: [],
    capabilitiesReported: false,
    missingCapabilities: [],
    reasons: [],
    evidence: {
      transport: null,
      endpoint: null,
      runtimeEchoedRequestId: false,
      checkedAtHostUnixMs: checkedAt,
      timeBasis: HOST_TIME_BASIS,
      notClaimed: NOT_CLAIMED,
    },
  };
}

/**
 * Performs one handshake. Never throws: every failure is reported as
 * `unavailable` (could not reach / timed out / no transport) or
 * `incompatible` (reached something that is not the expected runtime).
 */
export async function performRuntimeHandshake(
  transport: RuntimeTransport | null,
  options: HandshakeOptions,
): Promise<RuntimeHandshakeResult> {
  const now = options.now ?? Date.now;
  const requestId = (options.createRequestId ?? (() => globalThis.crypto.randomUUID()))();
  const requested = [...new Set(options.requestedCapabilities ?? [])];
  const result = baseResult(requestId, now());
  result.missingCapabilities = requested;

  if (!REQUEST_ID.test(requestId)) {
    result.reasons.push("invalid-request-id");
    return result;
  }
  if (requested.some((id) => !CAPABILITY_ID.test(id))) {
    result.reasons.push("invalid-requested-capability");
    return result;
  }
  if (!transport) {
    result.reasons.push("no-runtime-transport-configured");
    return result;
  }
  result.evidence.transport = transport.kind;

  const controller = new AbortController();
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 3000, 50), 15_000);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let response: RuntimeProbeResponse;
  try {
    response = await Promise.race([
      transport.probe(
        {
          handshakeVersion: RUNTIME_HANDSHAKE_VERSION,
          requestId,
          client: { id: "maataa-desktop", version: options.clientVersion },
          requestedCapabilities: requested,
        },
        controller.signal,
      ),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("timeout"));
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    result.reasons.push(error instanceof Error && error.message === "timeout" ? "runtime-timeout" : "runtime-unreachable");
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }

  result.evidence.transport = response.transport;
  result.evidence.endpoint = response.endpoint;
  const health = response.health;
  if (typeof health !== "object" || health === null || Array.isArray(health)) {
    result.state = "incompatible";
    result.reasons.push("malformed-health");
    return result;
  }
  const record = health as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter((key) => !HEALTH_KEYS.has(key));
  if (unknownKeys.length > 0) {
    result.state = "incompatible";
    result.reasons.push("unknown-health-fields");
    return result;
  }
  result.runtime.service = typeof record.service === "string" ? record.service : null;
  result.runtime.contractVersion = typeof record.contractVersion === "string" ? record.contractVersion : null;
  result.runtime.environment = typeof record.environment === "string" ? record.environment : null;
  result.health = record.status === "OK" ? "ok" : "not-ok";

  if (result.runtime.service !== ALLB_EXPECTED_SERVICE) {
    result.state = "incompatible";
    result.reasons.push("unexpected-runtime-identity");
    return result;
  }
  if (!isCompatibleContractVersion(record.contractVersion)) {
    result.state = "incompatible";
    result.reasons.push("unsupported-contract-version");
    return result;
  }
  if (result.health !== "ok") {
    result.state = "unavailable";
    result.reasons.push("runtime-not-healthy");
    return result;
  }

  if (response.capabilities !== undefined) {
    const capabilities = parseRuntimeCapabilities(response.capabilities);
    if (!capabilities) {
      result.state = "incompatible";
      result.reasons.push("malformed-capabilities");
      return result;
    }
    result.capabilities = capabilities;
    result.capabilitiesReported = true;
  } else {
    result.reasons.push("capabilities-not-reported");
  }
  result.missingCapabilities = requested.filter(
    (id) => !result.capabilities.some((capability) => capability.id === id && capability.available),
  );
  result.state = "connected";
  return result;
}

/** Only loopback hosts: Desktop must not probe arbitrary network services. */
export function isLoopbackRuntimeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:"
      && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
      && url.username === ""
      && url.password === ""
      && (url.pathname === "/" || url.pathname === "");
  } catch {
    return false;
  }
}

type FetchLike = (input: string, init: { method: string; headers: Record<string, string>; signal: AbortSignal }) =>
  Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/**
 * HTTP transport for an ALLB edge worker running locally (e.g. `wrangler dev`).
 * Reads `/health`, then `/capabilities` (ALLB edge worker, added 2026-10-09:
 * `{ contractVersion, capabilities }`). A 404 from an older worker leaves
 * capabilities unreported; a report whose contract version differs from the
 * health document, or any other shape, is passed on as malformed so the
 * handshake fails closed as `incompatible`.
 */
export function createLoopbackHealthTransport(baseUrl: string, fetchImpl: FetchLike): RuntimeTransport {
  if (!isLoopbackRuntimeUrl(baseUrl)) throw new Error("Runtime URL must be an http loopback origin without a path.");
  const endpoint = new URL("/health", baseUrl).toString();
  const capabilitiesEndpoint = new URL("/capabilities", baseUrl).toString();
  return {
    kind: "http-loopback",
    async probe(request, signal) {
      const headers = { accept: "application/json", "x-maataa-request-id": request.requestId };
      const response = await fetchImpl(endpoint, { method: "GET", headers, signal });
      if (!response.ok) throw new Error(`http-${response.status}`);
      const health = await response.json();
      const capabilityResponse = await fetchImpl(capabilitiesEndpoint, { method: "GET", headers, signal });
      if (capabilityResponse.status === 404) return { health, transport: "http-loopback", endpoint };
      let capabilities: unknown = MALFORMED;
      if (capabilityResponse.ok) {
        const body = await capabilityResponse.json().catch(() => null);
        const healthVersion = typeof health === "object" && health !== null ? (health as Record<string, unknown>).contractVersion : undefined;
        if (typeof body === "object" && body !== null && !Array.isArray(body)
          && Object.keys(body).length === 2
          && (body as Record<string, unknown>).contractVersion === healthVersion) {
          capabilities = (body as Record<string, unknown>).capabilities;
        }
      }
      return { health, capabilities, transport: "http-loopback", endpoint };
    },
  };
}

/** Sentinel that never parses as a capability list. */
const MALFORMED = Object.freeze({ malformed: true });
