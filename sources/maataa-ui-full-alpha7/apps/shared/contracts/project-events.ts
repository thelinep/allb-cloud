/**
 * MAATAA project event envelope, schema maataa.project-event/1.0.0.
 *
 * One envelope for MAATAA Desktop, Brahmini, TLPS and TLP Film activity.
 * Design rules (see docs/product/PHASES-1-5-INTEGRATION-STATUS.md):
 * - Ordering is ONLY defined inside one `orderingScope` (a single local
 *   writer). Events from different scopes are never compared or merged into
 *   one claimed order; there is no cross-process clock yet.
 * - Time is host time and is labelled unverified. Hemant Samwat or any
 *   other "verified" basis is rejected until a real runtime call and its
 *   drift/reboot/cross-process semantics are implemented and tested.
 * - Payload is project METADATA only (title, type, status, short labels,
 *   proposal digest). Scripts, budgets, crew, locations and personal data
 *   are rejected so the envelope cannot become a silent copy channel.
 */

export const PROJECT_EVENT_SCHEMA = "maataa.project-event/1.0.0" as const;
export const PROJECT_EVENT_RETENTION_LIMIT = 500;

export const PROJECT_PRODUCTS = ["maataa-desktop", "brahmini", "tlps", "tlp-film"] as const;
export type ProjectProduct = (typeof PROJECT_PRODUCTS)[number];

export const PROJECT_ACTIONS = [
  "project-created",
  "project-updated",
  "project-removed",
  "proposal-created",
  "proposal-approved",
  "proposal-rejected",
  "record-created",
  "legacy-activity",
] as const;
export type ProjectAction = (typeof PROJECT_ACTIONS)[number];

export const TIME_BASES = ["host-unix-clock-unverified", "legacy-iso-unverified"] as const;
export type TimeBasis = (typeof TIME_BASES)[number];

export const ACTOR_KINDS = ["local-user", "local-app", "brahmini-proposal", "unrecorded"] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

export const EVIDENCE_KINDS = ["local-unverified", "synthetic-demo", "provider-draft", "migrated-legacy"] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export interface ProjectEventPayload {
  title?: string;
  projectType?: string;
  status?: string;
  legacyLabel?: string;
  proposalDigest?: string;
}

export interface ProjectEventEnvelope {
  schema: typeof PROJECT_EVENT_SCHEMA;
  eventId: string;
  orderingScope: string;
  sequence: number;
  project: { id: string; product: ProjectProduct };
  source: { app: ProjectProduct; component: string };
  actor: { kind: ActorKind; id: string };
  action: ProjectAction;
  time: { recordedAt: number | null; basis: TimeBasis };
  provenance: { evidence: EvidenceKind; migratedFrom?: "tauri-workspace-index-v2" | "tlps-activity-v1" };
  payload: ProjectEventPayload;
}

export type ValidationResult =
  | { ok: true; event: ProjectEventEnvelope }
  | { ok: false; errors: string[] };

const SCOPE = /^[a-z][a-z0-9-]{1,40}(?::[a-z0-9-]{1,40}){0,2}$/;
const PROJECT_ID = /^[a-z][a-z0-9-]{1,30}:[a-z0-9-]{1,64}$/;
const SHORT_ID = /^[a-z][a-z0-9-]{1,63}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const TOP_KEYS = ["schema", "eventId", "orderingScope", "sequence", "project", "source", "actor", "action", "time", "provenance", "payload"];
const PAYLOAD_LIMITS: Record<keyof ProjectEventPayload, number> = {
  title: 120,
  projectType: 80,
  status: 40,
  legacyLabel: 120,
  proposalDigest: 71,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const onlyKeys = (value: Record<string, unknown>, allowed: string[]) =>
  Object.keys(value).every((key) => allowed.includes(key));
const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

export const eventIdFor = (scope: string, sequence: number) => `${scope}#${sequence}`;

export function validateProjectEvent(raw: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["not-an-object"] };
  if (!onlyKeys(raw, TOP_KEYS)) errors.push("unknown-top-level-field");
  if (raw.schema !== PROJECT_EVENT_SCHEMA) errors.push("unsupported-schema");
  if (typeof raw.orderingScope !== "string" || !SCOPE.test(raw.orderingScope)) errors.push("invalid-ordering-scope");
  if (typeof raw.sequence !== "number" || !Number.isSafeInteger(raw.sequence) || raw.sequence < 1) errors.push("invalid-sequence");
  if (typeof raw.orderingScope === "string" && typeof raw.sequence === "number"
    && raw.eventId !== eventIdFor(raw.orderingScope, raw.sequence)) errors.push("event-id-mismatch");

  const project = raw.project;
  if (!isRecord(project) || !onlyKeys(project, ["id", "product"])
    || typeof project.id !== "string" || !PROJECT_ID.test(project.id) || !includes(PROJECT_PRODUCTS, project.product)) {
    errors.push("invalid-project");
  }
  const source = raw.source;
  if (!isRecord(source) || !onlyKeys(source, ["app", "component"]) || !includes(PROJECT_PRODUCTS, source.app)
    || typeof source.component !== "string" || !SHORT_ID.test(source.component)) {
    errors.push("invalid-source");
  }
  const actor = raw.actor;
  if (!isRecord(actor) || !onlyKeys(actor, ["kind", "id"]) || !includes(ACTOR_KINDS, actor.kind)
    || typeof actor.id !== "string" || !SHORT_ID.test(actor.id)) {
    errors.push("invalid-actor");
  }
  if (!includes(PROJECT_ACTIONS, raw.action)) errors.push("invalid-action");

  const time = raw.time;
  if (!isRecord(time) || !onlyKeys(time, ["recordedAt", "basis"])) {
    errors.push("invalid-time");
  } else {
    if (!includes(TIME_BASES, time.basis)) errors.push("unverified-or-unknown-time-basis");
    if (time.recordedAt !== null && (typeof time.recordedAt !== "number" || !Number.isSafeInteger(time.recordedAt) || time.recordedAt < 0)) {
      errors.push("invalid-recorded-at");
    }
  }
  const provenance = raw.provenance;
  if (!isRecord(provenance) || !onlyKeys(provenance, ["evidence", "migratedFrom"]) || !includes(EVIDENCE_KINDS, provenance.evidence)
    || (provenance.migratedFrom !== undefined && !includes(["tauri-workspace-index-v2", "tlps-activity-v1"] as const, provenance.migratedFrom))) {
    errors.push("invalid-provenance");
  }
  const payload = raw.payload;
  if (!isRecord(payload)) {
    errors.push("invalid-payload");
  } else {
    for (const [key, value] of Object.entries(payload)) {
      if (!(key in PAYLOAD_LIMITS)) {
        errors.push(`payload-field-not-allowed:${key}`);
        continue;
      }
      if (typeof value !== "string" || value.length > PAYLOAD_LIMITS[key as keyof ProjectEventPayload]) errors.push(`payload-field-invalid:${key}`);
    }
    if (typeof payload.proposalDigest === "string" && !DIGEST.test(payload.proposalDigest)) errors.push("payload-field-invalid:proposalDigest");
  }
  return errors.length ? { ok: false, errors } : { ok: true, event: raw as unknown as ProjectEventEnvelope };
}

/** Rejects any log that is not strictly increasing per scope. Returns errors. */
export function checkOrdering(events: readonly ProjectEventEnvelope[]): string[] {
  const last = new Map<string, number>();
  const errors: string[] = [];
  for (const event of events) {
    const previous = last.get(event.orderingScope);
    if (previous !== undefined && event.sequence <= previous) {
      errors.push(`out-of-order:${event.orderingScope}#${event.sequence}`);
    }
    last.set(event.orderingScope, Math.max(previous ?? 0, event.sequence));
  }
  return errors;
}

/**
 * Orders two events only when they share a scope. Returns null otherwise:
 * callers must not invent a global order from host timestamps.
 */
export function compareWithinScope(a: ProjectEventEnvelope, b: ProjectEventEnvelope): number | null {
  if (a.orderingScope !== b.orderingScope) return null;
  return a.sequence - b.sequence;
}

export interface AppendInput {
  project: ProjectEventEnvelope["project"];
  source: ProjectEventEnvelope["source"];
  actor: ProjectEventEnvelope["actor"];
  action: ProjectAction;
  evidence: EvidenceKind;
  payload?: ProjectEventPayload;
}

/** Appends to a single-scope log, assigning the next sequence and enforcing retention. */
export function appendProjectEvent(
  log: readonly ProjectEventEnvelope[],
  scope: string,
  input: AppendInput,
  now: () => number = Date.now,
  limit: number = PROJECT_EVENT_RETENTION_LIMIT,
): ProjectEventEnvelope[] {
  if (log.some((event) => event.orderingScope !== scope)) throw new Error("A log may only hold one ordering scope.");
  const sequence = (log.at(-1)?.sequence ?? 0) + 1;
  const candidate: ProjectEventEnvelope = {
    schema: PROJECT_EVENT_SCHEMA,
    eventId: eventIdFor(scope, sequence),
    orderingScope: scope,
    sequence,
    project: input.project,
    source: input.source,
    actor: input.actor,
    action: input.action,
    time: { recordedAt: now(), basis: "host-unix-clock-unverified" },
    provenance: { evidence: input.evidence },
    payload: input.payload ?? {},
  };
  const checked = validateProjectEvent(candidate);
  if (!checked.ok) throw new Error(`Invalid project event: ${checked.errors.join(", ")}`);
  const next = [...log, checked.event];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

// ---------------------------------------------------------------------------
// Compatible migration of existing local records
// ---------------------------------------------------------------------------

export const TAURI_REGISTRY_SCOPE = "maataa-desktop:workspace-index";
const V2_ACTION_MAP: Record<string, ProjectAction> = {
  "project-created": "project-created",
  "project-updated": "project-updated",
  "project-removed": "project-removed",
};

export interface MigrationReport {
  events: ProjectEventEnvelope[];
  rejected: { index: number; reason: string }[];
}

/**
 * Reads the Tauri `workspace-index.json` (v1, v2 or v3, as written by
 * apps/maataa-desktop-tauri/src-tauri/src/main.rs) and maps its activity
 * into envelopes without modifying the source. v1 had no events. Actors were
 * not recorded in v2, so they migrate as `unrecorded` instead of being guessed.
 */
export function migrateTauriWorkspaceIndex(raw: unknown): MigrationReport {
  if (!isRecord(raw) || (raw.version !== 1 && raw.version !== 2 && raw.version !== 3) || !Array.isArray(raw.projects)) {
    throw new Error("Unsupported workspace index format.");
  }
  const report: MigrationReport = { events: [], rejected: [] };
  const sourceEvents = raw.version === 1 || !Array.isArray(raw.events) ? [] : raw.events;
  if (sourceEvents.length > PROJECT_EVENT_RETENTION_LIMIT) throw new Error("Workspace index exceeds the retention limit.");
  sourceEvents.forEach((item: unknown, index: number) => {
    if (!isRecord(item) || !onlyKeys(item, ["sequence", "projectId", "product", "action", "source", "recordedAtUnixMs", "timeBasis", "recordVersion"])) {
      report.rejected.push({ index, reason: "malformed-v2-event" });
      return;
    }
    if (item.source !== "maataa-desktop-local" || item.timeBasis !== "host-unix-clock-unverified") {
      report.rejected.push({ index, reason: "unexpected-v2-source-or-time-basis" });
      return;
    }
    const action = typeof item.action === "string" ? V2_ACTION_MAP[item.action] : undefined;
    const sequence = item.sequence;
    if (item.recordVersion !== undefined && (typeof item.recordVersion !== "number" || !Number.isSafeInteger(item.recordVersion) || item.recordVersion < 1)) {
      report.rejected.push({ index, reason: "invalid-v3-record-version" });
      return;
    }
    if (!action || typeof sequence !== "number") {
      report.rejected.push({ index, reason: "unknown-v2-action" });
      return;
    }
    const candidate = {
      schema: PROJECT_EVENT_SCHEMA,
      eventId: eventIdFor(TAURI_REGISTRY_SCOPE, sequence),
      orderingScope: TAURI_REGISTRY_SCOPE,
      sequence,
      project: { id: item.projectId, product: item.product },
      source: { app: "maataa-desktop", component: "tauri-workspace-registry" },
      actor: { kind: "unrecorded", id: "unrecorded" },
      action,
      time: { recordedAt: item.recordedAtUnixMs, basis: "host-unix-clock-unverified" },
      provenance: { evidence: "migrated-legacy", migratedFrom: "tauri-workspace-index-v2" },
      payload: typeof item.recordVersion === "number" ? { status: `v${item.recordVersion}` } : {},
    };
    const checked = validateProjectEvent(candidate);
    if (!checked.ok) {
      report.rejected.push({ index, reason: checked.errors[0] });
      return;
    }
    report.events.push(checked.event);
  });
  const ordering = checkOrdering(report.events);
  if (ordering.length) throw new Error(`Workspace index activity is out of order: ${ordering.join(", ")}`);
  return report;
}

/**
 * Maps TLPS browser-local `activity` ({ action, at }) to envelopes. The free
 * text label is truncated to 120 chars; ISO time is kept as unverified.
 */
export function migrateTlpsActivity(activity: unknown, scope = "tlps:browser-draft"): MigrationReport {
  const report: MigrationReport = { events: [], rejected: [] };
  if (!Array.isArray(activity)) return report;
  let sequence = 0;
  activity.slice(-PROJECT_EVENT_RETENTION_LIMIT).forEach((item: unknown, index: number) => {
    if (!isRecord(item) || typeof item.action !== "string" || typeof item.at !== "string") {
      report.rejected.push({ index, reason: "malformed-tlps-activity" });
      return;
    }
    const parsed = Date.parse(item.at);
    sequence += 1;
    report.events.push({
      schema: PROJECT_EVENT_SCHEMA,
      eventId: eventIdFor(scope, sequence),
      orderingScope: scope,
      sequence,
      project: { id: "tlps:workspace", product: "tlps" },
      source: { app: "tlps", component: "browser-draft" },
      actor: { kind: "unrecorded", id: "unrecorded" },
      action: "legacy-activity",
      time: { recordedAt: Number.isNaN(parsed) ? null : parsed, basis: "legacy-iso-unverified" },
      provenance: { evidence: "migrated-legacy", migratedFrom: "tlps-activity-v1" },
      payload: { legacyLabel: item.action.slice(0, 120) },
    });
  });
  return report;
}
