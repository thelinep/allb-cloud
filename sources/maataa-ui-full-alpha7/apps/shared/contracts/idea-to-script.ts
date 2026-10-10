/**
 * Roadmap step 10, first slice: Idea → Script on the shared project record.
 *
 *   v1  idea (user-input, stored in TLPS)
 *   v2  idea + script draft (provider-draft from a Brahmini model, stored in
 *       Brahmini) + an INDEPENDENT deterministic format check
 *
 * The script text never enters the record: only its storage key, sha256
 * and size. A draft whose format check fails cannot be approved. Passing the
 * format check means "is shaped like a screenplay", not "is good"; quality
 * stays the user's review decision, and the model stays `unqualified` for
 * script writing until a task evaluation exists.
 */
import {
  approveVersion,
  createProjectRecord,
  digestOf,
  previewVersion,
  type ArtifactRef,
  type CheckResult,
  type ModelUse,
  type ProjectRecord,
  type VersionProposal,
} from "./project-record.ts";
import type { ProjectEventEnvelope } from "./project-events.ts";

export const SCRIPT_DRAFT_LABEL = "Provider draft: a first script draft for review. Not a production script.";
export const SCREENPLAY_CHECK = "deterministic:screenplay-format@1";
export const SCRIPT_SCOPE = "tlps:idea-to-script";

/**
 * Fixed Brahmini instruction for a first screenplay draft. Kept here so the
 * prompt is versioned with the contract and its digest can be recorded.
 */
export const SCRIPT_PROMPT_VERSION = "tlps-idea-to-script-prompt@1";
export const SCRIPT_SYSTEM_PROMPT = [
  "You are Brahmini, drafting a FIRST screenplay draft for a film producer to review.",
  "Write only the screenplay. Use standard screenplay format:",
  "- Scene headings on their own line starting with INT. or EXT. (for example: INT. LIGHTHOUSE - NIGHT).",
  "- Short action lines.",
  "- Character names in CAPITALS on their own line, followed by their dialogue on the next line.",
  "Write 2 to 4 short scenes. Do not add commentary, notes, placeholders, markdown or explanations.",
  "Do not claim the script is final, approved or production-ready.",
].join("\n");

export function scriptDraftMessages(title: string, idea: string) {
  const cleanTitle = title.replace(/\s+/g, " ").trim().slice(0, 120);
  const cleanIdea = idea.replace(/\s+/g, " ").trim().slice(0, 2000);
  if (!cleanTitle || cleanIdea.length < 3) throw new Error("A title and an idea are required.");
  return [{ role: "user" as const, content: `Title: ${cleanTitle}\nIdea: ${cleanIdea}\n\nWrite the first screenplay draft.` }];
}

async function sha256Text(text: string) {
  const bytes = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return `sha256:${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
const byteLength = (text: string) => new TextEncoder().encode(text).length;
export { sha256Text };

/** Deterministic, model-free screenplay shape check. */
export function checkScreenplayFormat(text: string): { passed: boolean; notes: string[] } {
  const notes: string[] = [];
  if (!text.trim()) return { passed: false, notes: ["empty"] };
  if (text.length > 200_000) notes.push("too-long");
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const headings = lines.filter((l) => /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s+\S.*/.test(l));
  if (headings.length === 0) notes.push("no-scene-heading");
  const cues = lines.filter((l, i) => /^[A-Z][A-Z0-9 .'()-]{1,39}$/.test(l) && !/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|FADE|CUT TO)/.test(l) && (lines[i + 1] ?? "") !== "");
  if (cues.length === 0) notes.push("no-character-cue");
  if (/\[(insert|todo|tbd)[^\]]*\]|lorem ipsum|as an ai\b/i.test(text)) notes.push("placeholder-or-assistant-text");
  return { passed: notes.length === 0, notes: notes.length ? notes : [`scenes:${headings.length}`, `cues:${cues.length}`] };
}

export const normalizeIdea = (idea: string) => idea.replace(/\s+/g, " ").trim();

export async function ideaArtifact(idea: string): Promise<ArtifactRef> {
  const text = normalizeIdea(idea);
  if (text.length < 3 || text.length > 2000) throw new Error("Idea must be 3–2000 characters.");
  return {
    artifactId: "idea",
    kind: "idea",
    storage: { app: "tlps", localKey: "tlps.planning.workspace.v1/project.idea" },
    sha256: await sha256Text(text),
    bytes: byteLength(text),
    origin: { kind: "user-input", models: [] },
  };
}

export async function startFromIdea(title: string, idea: string, projectId?: string) {
  const record = createProjectRecord({ title, domain: "film-production", ownerApp: "tlps", projectId });
  const proposal: VersionProposal = {
    projectId: record.projectId,
    baseVersion: 0,
    summary: "Idea captured from the user",
    artifacts: [await ideaArtifact(idea)],
    checks: [],
    proposedBy: "tlps",
  };
  return { record, preview: await previewVersion(record, proposal) };
}

export async function proposeScriptDraft(
  record: ProjectRecord,
  draft: { text: string; storageKey: string; model: ModelUse; storageApp?: "brahmini" | "tlps" },
) {
  const latest = record.versions.at(-1);
  if (!latest || !latest.artifacts.some((a) => a.kind === "idea")) throw new Error("Capture and approve an idea first.");
  if (!["chat", "planner"].includes(draft.model.role)) throw new Error("A script draft must come from a chat or planner model role.");
  const script: ArtifactRef = {
    artifactId: "script-draft",
    kind: "script-draft",
    storage: { app: draft.storageApp ?? "brahmini", localKey: draft.storageKey },
    sha256: await sha256Text(draft.text),
    bytes: byteLength(draft.text),
    origin: { kind: "provider-draft", models: [draft.model] },
  };
  const format = checkScreenplayFormat(draft.text);
  const check: CheckResult = { checkId: "screenplay-format", artifactId: script.artifactId, evaluator: SCREENPLAY_CHECK, passed: format.passed, notes: format.notes };
  const proposal: VersionProposal = {
    projectId: record.projectId,
    baseVersion: record.currentVersion,
    summary: `Script draft for review (${draft.model.modelId}, ${draft.model.qualification === "unqualified" ? "model unqualified for scripts" : "qualified"})`,
    artifacts: [...latest.artifacts.filter((a) => a.kind !== "script-draft"), script],
    checks: [check],
    proposedBy: "brahmini",
  };
  return { preview: await previewVersion(record, proposal), label: SCRIPT_DRAFT_LABEL, format };
}

/**
 * Approval gate. The host passes the script text it loaded from storage; the
 * gate verifies its sha256 against the proposal and RE-RUNS the deterministic
 * check, so a proposal that merely claims `passed: true` cannot get through.
 */
export async function approveScriptStep(
  record: ProjectRecord,
  preview: { proposal: VersionProposal; digest: string },
  approval: { proposalDigest: string; decidedBy: "local-user" },
  scriptTexts: Readonly<Record<string, string>>,
  log: readonly ProjectEventEnvelope[],
  now: () => number = Date.now,
): Promise<{ record: ProjectRecord; events: ProjectEventEnvelope[] }> {
  for (const artifact of preview.proposal.artifacts.filter((a) => a.kind === "script-draft")) {
    const text = scriptTexts[artifact.artifactId];
    if (typeof text !== "string" || await sha256Text(text) !== artifact.sha256) {
      throw new Error("The stored script does not match the reviewed draft.");
    }
    const recorded = preview.proposal.checks.find((c) => c.artifactId === artifact.artifactId && c.evaluator === SCREENPLAY_CHECK);
    const rerun = checkScreenplayFormat(text);
    if (!recorded || recorded.passed !== rerun.passed) throw new Error("The recorded format check does not match an independent re-run.");
    if (!rerun.passed) throw new Error(`The script draft did not pass the independent format check (${rerun.notes.join(", ")}); it cannot be approved.`);
    if (!artifact.origin.models.some((m) => m.role === "chat" || m.role === "planner")) throw new Error("Script draft has no generating model recorded.");
  }
  if (await digestOf(preview.proposal) !== preview.digest) throw new Error("The proposal changed after preview.");
  return approveVersion(record, preview, approval, log, SCRIPT_SCOPE, now);
}
