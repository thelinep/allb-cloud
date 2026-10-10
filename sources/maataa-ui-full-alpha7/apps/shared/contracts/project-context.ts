/**
 * Project context handed between MAATAA Desktop, MAATAA UI (Brahmini Workbench)
 * and TLPS: only a `prj:` record ID and the version the sender last saw.
 *
 * - Never carries titles, ideas, scripts or any other content.
 * - The receiving app compares the context with its authoritative local record
 *   and refuses writes unless the context, the in-memory base and the stored
 *   record all agree on the same ID and version.
 * - Local prototype only: there is no server-side Auth, DBB or API Studio
 *   behind this. Same-origin browser storage is not a shared database.
 */
import { MAX_VERSIONS } from "./project-record.ts";

export const PROJECT_CONTEXT_PARAMS = { id: "project", version: "version" } as const;
const PROJECT_ID = /^prj:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export interface ProjectContext {
  recordId: string;
  recordVersion: number;
}

export type ContextParse =
  | { ok: true; context: ProjectContext }
  | { ok: false; reason: "missing" | "invalid-id" | "invalid-version" };

export function isRecordId(value: unknown): value is string {
  return typeof value === "string" && PROJECT_ID.test(value);
}

/** Parses `?project=prj:<uuid>&version=<n>`. Missing both → "missing". */
export function parseProjectContext(search: string | URLSearchParams): ContextParse {
  const params = typeof search === "string" ? new URLSearchParams(search.replace(/^[?#]/, "")) : search;
  const id = params.get(PROJECT_CONTEXT_PARAMS.id);
  const version = params.get(PROJECT_CONTEXT_PARAMS.version);
  if (id === null && version === null) return { ok: false, reason: "missing" };
  if (!isRecordId(id)) return { ok: false, reason: "invalid-id" };
  if (version === null || !/^[1-9][0-9]{0,2}$/.test(version) || Number(version) > MAX_VERSIONS) {
    return { ok: false, reason: "invalid-version" };
  }
  return { ok: true, context: { recordId: id, recordVersion: Number(version) } };
}

/** Reads the context from a page's query string, or from the query inside a hash route (`#/brahmini?…`). */
export function projectContextFromLocation(location: { search: string; hash: string }): ContextParse {
  const fromSearch = parseProjectContext(location.search);
  if (fromSearch.ok || fromSearch.reason !== "missing") return fromSearch;
  const hashQuery = location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?") + 1) : "";
  return parseProjectContext(hashQuery);
}

export function projectContextQuery(context: ProjectContext): string {
  if (!isRecordId(context.recordId) || !Number.isInteger(context.recordVersion) || context.recordVersion < 1 || context.recordVersion > MAX_VERSIONS) {
    throw new Error("Invalid project context.");
  }
  const params = new URLSearchParams();
  params.set(PROJECT_CONTEXT_PARAMS.id, context.recordId);
  params.set(PROJECT_CONTEXT_PARAMS.version, String(context.recordVersion));
  return params.toString();
}

export type ContextStatus =
  | { status: "current"; version: number }
  /** The record moved on since the sender looked: show the new version; writes based on the old one are refused. */
  | { status: "newer-available"; contextVersion: number; currentVersion: number }
  /** Context claims a version this record never reached: inconsistent, refuse. */
  | { status: "ahead-of-record"; contextVersion: number; currentVersion: number }
  | { status: "different-record"; contextId: string; recordId: string }
  /** No authoritative local record is readable in this window. */
  | { status: "unavailable"; reason: string };

export function reconcileContext(
  context: ProjectContext,
  record: { projectId: string; currentVersion: number } | null,
  unavailableReason = "No local copy of this project record is readable here.",
): ContextStatus {
  if (!record) return { status: "unavailable", reason: unavailableReason };
  if (record.projectId !== context.recordId) return { status: "different-record", contextId: context.recordId, recordId: record.projectId };
  if (context.recordVersion === record.currentVersion) return { status: "current", version: record.currentVersion };
  if (context.recordVersion < record.currentVersion) {
    return { status: "newer-available", contextVersion: context.recordVersion, currentVersion: record.currentVersion };
  }
  return { status: "ahead-of-record", contextVersion: context.recordVersion, currentVersion: record.currentVersion };
}

export function describeContextStatus(status: ContextStatus): string {
  switch (status.status) {
    case "current": return `Up to date at v${status.version}.`;
    case "newer-available": return `Opened at v${status.contextVersion}, but this record is now at v${status.currentVersion}. Changes based on v${status.contextVersion} are refused; continue with v${status.currentVersion} to work on the current version.`;
    case "ahead-of-record": return `The request names v${status.contextVersion}, but this record only reached v${status.currentVersion}. Nothing will be written.`;
    case "different-record": return `This window holds ${status.recordId}, not ${status.contextId}. Nothing will be written.`;
    case "unavailable": return status.reason;
  }
}

/**
 * Write guard, checked immediately before saving: the version this window
 * edited from must still be the stored version of the same record. Anything
 * else means another window changed the record, and the write is refused so no
 * approved content is overwritten.
 */
export function checkWriteBase(
  base: { projectId: string; currentVersion: number } | null,
  stored: { projectId: string; currentVersion: number } | null,
): { ok: true } | { ok: false; reason: string } {
  if (!base) {
    return stored
      ? { ok: false, reason: `Another window already saved ${stored.projectId} (v${stored.currentVersion}). Nothing was written; reload to continue with it.` }
      : { ok: true };
  }
  if (!stored) return { ok: false, reason: "The saved project record is missing or unreadable. Nothing was written." };
  if (stored.projectId !== base.projectId) return { ok: false, reason: `This browser now holds ${stored.projectId}. Nothing was written.` };
  if (stored.currentVersion !== base.currentVersion) {
    return { ok: false, reason: `This record changed in another window (now v${stored.currentVersion}, you were working from v${base.currentVersion}). Nothing was written; reload the current version.` };
  }
  return { ok: true };
}
