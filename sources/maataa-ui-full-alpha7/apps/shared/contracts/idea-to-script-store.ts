/**
 * Browser-local persistence for the TLPS Idea → Script project.
 *
 * Holds the shared project record, its single-scope event log, and the
 * CONTENT the record references (idea and script text), keyed by sha256.
 * Content stays inside TLPS's own storage; the record carries hashes only.
 * Reads fail closed: a store whose record is invalid, whose events are out of
 * order, or whose content no longer matches its hash is rejected as a whole.
 */
import { validateProjectRecord, type ProjectRecord } from "./project-record.ts";
import { checkOrdering, validateProjectEvent, type ProjectEventEnvelope } from "./project-events.ts";
import { sha256Text } from "./idea-to-script.ts";

export const IDEA_TO_SCRIPT_STORE_KEY = "tlps.idea-to-script.v1";
export const IDEA_TO_SCRIPT_STORE_SCHEMA = "tlps.idea-to-script-store/1" as const;
const MAX_CONTENT_BYTES = 400_000;

export interface IdeaToScriptStore {
  schema: typeof IDEA_TO_SCRIPT_STORE_SCHEMA;
  record: ProjectRecord;
  events: ProjectEventEnvelope[];
  /** sha256 → text for artifacts whose storage app is "tlps". */
  contents: Record<string, string>;
}

export async function parseIdeaToScriptStore(raw: string | null): Promise<{ store: IdeaToScriptStore | null; error: string | null }> {
  if (!raw) return { store: null, error: null };
  if (raw.length > MAX_CONTENT_BYTES * 2) return { store: null, error: "Saved Idea → Script data is too large." };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return { store: null, error: "Saved Idea → Script data is unreadable." }; }
  if (typeof parsed !== "object" || parsed === null) return { store: null, error: "Saved Idea → Script data is unreadable." };
  const candidate = parsed as Partial<IdeaToScriptStore>;
  if (candidate.schema !== IDEA_TO_SCRIPT_STORE_SCHEMA) return { store: null, error: "Saved Idea → Script data uses an unknown format." };
  const recordErrors = validateProjectRecord(candidate.record);
  if (recordErrors.length) return { store: null, error: `Saved project record is invalid (${recordErrors[0]}).` };
  if (!Array.isArray(candidate.events) || candidate.events.some((event) => !validateProjectEvent(event).ok) || checkOrdering(candidate.events).length) {
    return { store: null, error: "Saved project history is invalid or out of order." };
  }
  if (typeof candidate.contents !== "object" || candidate.contents === null || Array.isArray(candidate.contents)) {
    return { store: null, error: "Saved project content is missing." };
  }
  for (const [hash, text] of Object.entries(candidate.contents)) {
    if (typeof text !== "string" || await sha256Text(text) !== hash) return { store: null, error: "Saved project content does not match its recorded hash." };
  }
  const record = candidate.record as ProjectRecord;
  for (const artifact of record.versions.flatMap((version) => version.artifacts)) {
    if (artifact.storage.app === "tlps" && !(artifact.sha256 in candidate.contents)) {
      return { store: null, error: `Content for ${artifact.kind} is missing from this browser.` };
    }
  }
  return { store: candidate as IdeaToScriptStore, error: null };
}

export function serializeIdeaToScriptStore(store: IdeaToScriptStore): string {
  const raw = JSON.stringify(store);
  if (raw.length > MAX_CONTENT_BYTES * 2) throw new Error("This project is too large for browser-local storage.");
  return raw;
}
