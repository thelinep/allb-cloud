/**
 * MAATAA shared project record, schema maataa.project-record/1.0.0.
 *
 * Roadmap step 1: one stable project identity that Desktop, Brahmini and
 * TLPS (later NEVO) all point at, with an explicit current version.
 *
 * Rules:
 * - `projectId` is generated once (`prj:<uuid>`) and never reused or renamed.
 * - The record holds REFERENCES to artifacts (app + local key + sha256),
 *   never their content. Scripts, budgets and media stay in the owning app.
 * - A new version is only adopted through propose → preview digest →
 *   explicit approval, and only if it was based on the current version.
 *   A proposal built on an older version is rejected as a conflict instead
 *   of silently overwriting (this is how stale copies cannot win).
 * - Every model that touched an artifact is recorded with its ROLE
 *   (e.g. Gemma as an LTX text encoder is not a chat model) and whether it
 *   was qualified for that task. A model name alone is not a quality claim.
 * - Times are host time and marked unverified.
 */
import { appendProjectEvent, type ProjectEventEnvelope, type ProjectProduct } from "./project-events.ts";

export const PROJECT_RECORD_SCHEMA = "maataa.project-record/1.0.0" as const;
export const MAX_VERSIONS = 200;
export const MAX_ARTIFACTS_PER_VERSION = 50;

export const ARTIFACT_KINDS = ["idea", "script-draft", "budget", "schedule", "cast-list", "location-list", "video", "image", "audio", "document"] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export const MODEL_ROLES = ["chat", "planner", "code", "text-encoder", "video-generator", "image-generator", "voice", "transcription", "evaluator"] as const;
export type ModelRole = (typeof MODEL_ROLES)[number];

export const ORIGIN_KINDS = ["user-input", "provider-draft", "synthetic-demo", "deterministic-tool", "imported"] as const;
export type OriginKind = (typeof ORIGIN_KINDS)[number];

export interface ModelUse {
  modelId: string;
  version: string | null;
  /** e.g. Ollama/Hugging Face digest; null when the runtime did not report one. */
  digest: string | null;
  role: ModelRole;
  runtime: string;
  /** `unqualified` unless a recorded task evaluation passed for this exact model + role. */
  qualification: "unqualified" | { evaluationId: string; passed: boolean };
}

export interface ArtifactRef {
  artifactId: string;
  kind: ArtifactKind;
  /** Where the content actually lives. The record never copies it. */
  storage: { app: ProjectProduct | "maataa-workstation"; localKey: string };
  sha256: string;
  bytes: number;
  origin: { kind: OriginKind; models: ModelUse[] };
}

/** Result of an INDEPENDENT check (never the generating model judging itself). */
export interface CheckResult {
  checkId: string;
  artifactId: string;
  /** e.g. "deterministic:screenplay-format@1". Model-based evaluators must name model + role. */
  evaluator: string;
  passed: boolean;
  notes: string[];
}

export interface ProjectVersion {
  version: number;
  baseVersion: number | null;
  summary: string;
  artifacts: ArtifactRef[];
  checks: CheckResult[];
  approval: { decidedBy: "local-user"; proposalDigest: string };
  recordedAt: number;
  timeBasis: "host-unix-clock-unverified";
}

export interface ProjectRecord {
  schema: typeof PROJECT_RECORD_SCHEMA;
  projectId: string;
  title: string;
  domain: "film-production" | "event";
  ownerApp: ProjectProduct;
  currentVersion: number;
  versions: ProjectVersion[];
}

export interface VersionProposal {
  projectId: string;
  baseVersion: number;
  summary: string;
  artifacts: ArtifactRef[];
  checks: CheckResult[];
  proposedBy: ProjectProduct;
}

const PROJECT_ID = /^prj:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SHA = /^sha256:[a-f0-9]{64}$/;
const SAFE_ID = /^[a-z0-9][a-z0-9._:-]{1,79}$/;
const LOCAL_KEY = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;
const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,119}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

export function newProjectId(randomUUID: () => string = () => globalThis.crypto.randomUUID()): string {
  const id = `prj:${randomUUID().toLowerCase()}`;
  if (!PROJECT_ID.test(id)) throw new Error("Could not create a valid project ID.");
  return id;
}

export function validateModelUse(raw: unknown): string[] {
  if (!isRecord(raw)) return ["model-not-object"];
  const e: string[] = [];
  if (typeof raw.modelId !== "string" || !MODEL_ID.test(raw.modelId)) e.push("model-id");
  if (raw.version !== null && typeof raw.version !== "string") e.push("model-version");
  if (raw.digest !== null && typeof raw.digest !== "string") e.push("model-digest");
  if (!oneOf(MODEL_ROLES, raw.role)) e.push("model-role");
  if (typeof raw.runtime !== "string" || !SAFE_ID.test(raw.runtime)) e.push("model-runtime");
  const q = raw.qualification;
  if (q !== "unqualified" && !(isRecord(q) && typeof q.evaluationId === "string" && SAFE_ID.test(q.evaluationId) && typeof q.passed === "boolean")) {
    e.push("model-qualification");
  }
  return e;
}

export function validateArtifactRef(raw: unknown): string[] {
  if (!isRecord(raw)) return ["artifact-not-object"];
  const e: string[] = [];
  const allowed = ["artifactId", "kind", "storage", "sha256", "bytes", "origin"];
  if (Object.keys(raw).some((k) => !allowed.includes(k))) e.push("artifact-unknown-field");
  if (typeof raw.artifactId !== "string" || !SAFE_ID.test(raw.artifactId)) e.push("artifact-id");
  if (!oneOf(ARTIFACT_KINDS, raw.kind)) e.push("artifact-kind");
  const s = raw.storage;
  if (!isRecord(s) || !oneOf(["maataa-desktop", "brahmini", "tlps", "tlp-film", "maataa-workstation"] as const, s.app)
    || typeof s.localKey !== "string" || !LOCAL_KEY.test(s.localKey) || s.localKey.includes("://")
    || s.localKey.split("/").includes("..") || Object.keys(s).length !== 2) e.push("artifact-storage");
  if (typeof raw.sha256 !== "string" || !SHA.test(raw.sha256)) e.push("artifact-sha256");
  if (typeof raw.bytes !== "number" || !Number.isSafeInteger(raw.bytes) || raw.bytes < 0) e.push("artifact-bytes");
  const o = raw.origin;
  if (!isRecord(o) || !oneOf(ORIGIN_KINDS, o.kind) || !Array.isArray(o.models)) {
    e.push("artifact-origin");
  } else {
    for (const m of o.models) e.push(...validateModelUse(m));
    if ((o.kind === "provider-draft") && o.models.length === 0) e.push("provider-draft-without-model");
    if ((o.kind === "user-input" || o.kind === "deterministic-tool") && o.models.length > 0) e.push("non-model-origin-lists-models");
  }
  return e;
}

const EVALUATOR = /^(deterministic|model):[a-z0-9][a-z0-9._/-]{1,79}@[0-9a-z.-]{1,20}$/;
export function validateCheck(raw: unknown, artifactIds: string[]): string[] {
  if (!isRecord(raw)) return ["check-not-object"];
  const e: string[] = [];
  if (typeof raw.checkId !== "string" || !SAFE_ID.test(raw.checkId)) e.push("check-id");
  if (typeof raw.artifactId !== "string" || !artifactIds.includes(raw.artifactId)) e.push("check-artifact");
  if (typeof raw.evaluator !== "string" || !EVALUATOR.test(raw.evaluator)) e.push("check-evaluator");
  if (typeof raw.passed !== "boolean") e.push("check-passed");
  if (!Array.isArray(raw.notes) || raw.notes.length > 20 || raw.notes.some((n) => typeof n !== "string" || n.length > 280)) e.push("check-notes");
  return e;
}

export function validateProjectRecord(raw: unknown): string[] {
  if (!isRecord(raw)) return ["record-not-object"];
  const e: string[] = [];
  if (raw.schema !== PROJECT_RECORD_SCHEMA) e.push("schema");
  if (typeof raw.projectId !== "string" || !PROJECT_ID.test(raw.projectId)) e.push("project-id");
  if (typeof raw.title !== "string" || !raw.title.trim() || raw.title.length > 120) e.push("title");
  if (!oneOf(["film-production", "event"] as const, raw.domain)) e.push("domain");
  if (!oneOf(["maataa-desktop", "brahmini", "tlps", "tlp-film"] as const, raw.ownerApp)) e.push("owner-app");
  if (!Array.isArray(raw.versions) || raw.versions.length > MAX_VERSIONS) return [...e, "versions"];
  raw.versions.forEach((v: unknown, i: number) => {
    if (!isRecord(v)) { e.push(`version-${i}`); return; }
    if (v.version !== i + 1) e.push(`version-${i}-number`);
    if (v.baseVersion !== (i === 0 ? null : i)) e.push(`version-${i}-base`);
    if (!isRecord(v.approval) || v.approval.decidedBy !== "local-user" || typeof v.approval.proposalDigest !== "string" || !SHA.test(v.approval.proposalDigest)) e.push(`version-${i}-approval`);
    if (v.timeBasis !== "host-unix-clock-unverified") e.push(`version-${i}-time-basis`);
    if (!Array.isArray(v.artifacts) || v.artifacts.length > MAX_ARTIFACTS_PER_VERSION) e.push(`version-${i}-artifacts`);
    else {
      for (const a of v.artifacts) e.push(...validateArtifactRef(a).map((x) => `version-${i}:${x}`));
      const ids = v.artifacts.map((a: { artifactId?: unknown }) => String(a.artifactId));
      if (!Array.isArray(v.checks)) e.push(`version-${i}-checks`);
      else for (const c of v.checks) e.push(...validateCheck(c, ids).map((x) => `version-${i}:${x}`));
    }
  });
  if (raw.currentVersion !== raw.versions.length) e.push("current-version");
  return e;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  return JSON.stringify(value);
}
export async function digestOf(value: unknown): Promise<string> {
  const bytes = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(value))));
  return `sha256:${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** Empty record (version 0). Becomes version 1 only after an approved proposal. */
export function createProjectRecord(input: { title: string; domain: ProjectRecord["domain"]; ownerApp: ProjectProduct; projectId?: string }): ProjectRecord {
  const record: ProjectRecord = {
    schema: PROJECT_RECORD_SCHEMA,
    projectId: input.projectId ?? newProjectId(),
    title: input.title.replace(/\s+/g, " ").trim().slice(0, 120),
    domain: input.domain,
    ownerApp: input.ownerApp,
    currentVersion: 0,
    versions: [],
  };
  const errors = validateProjectRecord(record);
  if (errors.length) throw new Error(`Invalid project record: ${errors.join(", ")}`);
  return record;
}

export async function previewVersion(record: ProjectRecord, proposal: VersionProposal): Promise<{ proposal: VersionProposal; digest: string; conflict: string | null; errors: string[] }> {
  const errors: string[] = [];
  if (proposal.projectId !== record.projectId) errors.push("project-id-mismatch");
  if (!proposal.summary.trim() || proposal.summary.length > 280) errors.push("summary");
  if (proposal.artifacts.length > MAX_ARTIFACTS_PER_VERSION) errors.push("too-many-artifacts");
  for (const a of proposal.artifacts) errors.push(...validateArtifactRef(a));
  for (const c of proposal.checks) errors.push(...validateCheck(c, proposal.artifacts.map((a) => a.artifactId)));
  const conflict = proposal.baseVersion !== record.currentVersion
    ? `stale-base: proposal built on v${proposal.baseVersion}, current is v${record.currentVersion}`
    : null;
  return { proposal, digest: await digestOf(proposal), conflict, errors };
}

/**
 * Applies an approved proposal. Returns a NEW record (input is not mutated)
 * plus the events to append to the given single-scope log.
 */
export async function approveVersion(
  record: ProjectRecord,
  preview: { proposal: VersionProposal; digest: string },
  approval: { proposalDigest: string; decidedBy: "local-user" },
  log: readonly ProjectEventEnvelope[],
  scope: string,
  now: () => number = Date.now,
): Promise<{ record: ProjectRecord; events: ProjectEventEnvelope[] }> {
  const fresh = await previewVersion(record, preview.proposal);
  if (fresh.digest !== preview.digest) throw new Error("The proposal changed after preview.");
  if (approval.proposalDigest !== preview.digest || approval.decidedBy !== "local-user") throw new Error("Approval does not match this preview.");
  if (fresh.errors.length) throw new Error(`Invalid proposal: ${fresh.errors.join(", ")}`);
  if (fresh.conflict) throw new Error(`Conflict: ${fresh.conflict}. Reload the current version and propose again.`);
  if (record.versions.length >= MAX_VERSIONS) throw new Error("Version history limit reached.");
  const recordedAt = now();
  const version: ProjectVersion = {
    version: record.currentVersion + 1,
    baseVersion: record.currentVersion === 0 ? null : record.currentVersion,
    summary: preview.proposal.summary.trim(),
    artifacts: structuredClone(preview.proposal.artifacts),
    checks: structuredClone(preview.proposal.checks),
    approval: { decidedBy: "local-user", proposalDigest: preview.digest },
    recordedAt,
    timeBasis: "host-unix-clock-unverified",
  };
  const next: ProjectRecord = { ...record, versions: [...record.versions, version], currentVersion: version.version };
  const errors = validateProjectRecord(next);
  if (errors.length) throw new Error(`Invalid project record: ${errors.join(", ")}`);
  const project = { id: record.projectId, product: record.ownerApp };
  const source = { app: preview.proposal.proposedBy, component: "project-record" };
  let events = appendProjectEvent(log, scope, { project, source, actor: { kind: "local-user", id: "local-user" }, action: "proposal-approved", evidence: "local-unverified", payload: { proposalDigest: preview.digest } }, () => recordedAt);
  events = appendProjectEvent(events, scope, { project, source, actor: { kind: "local-user", id: "local-user" }, action: version.version === 1 ? "project-created" : "project-updated", evidence: "local-unverified", payload: { title: record.title, status: `v${version.version}` } }, () => recordedAt);
  return { record: next, events };
}

/** What every app should display: same ID, same current version. */
export function currentView(record: ProjectRecord) {
  const latest = record.versions.at(-1);
  return {
    projectId: record.projectId,
    title: record.title,
    currentVersion: record.currentVersion,
    artifactKinds: latest ? latest.artifacts.map((a) => a.kind) : [],
    modelRoles: latest ? [...new Set(latest.artifacts.flatMap((a) => a.origin.models.map((m) => `${m.modelId}:${m.role}`)))] : [],
  };
}
