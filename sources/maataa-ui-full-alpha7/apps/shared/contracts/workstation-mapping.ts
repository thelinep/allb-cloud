/**
 * Maps Maataa Workstation (Brahmini repo, nova-console) records into the
 * shared project record WITHOUT copying content.
 *
 * Grounded in a read-only inspection of /Users/vesahe/Documents/Repos/brahmini
 * at a875589f (2026-10-09):
 * - `lib/video-ltx.js`: LTX-2 runs on MLX; `GEMMA = 'mlx-community/gemma-3-12b-it-4bit'`
 *   is the pipeline's TEXT ENCODER (not a chat model).
 * - `store_generationJobs` rows: `{ id, type, status, settings{engine, model, …}, mediaIds, error, … }`.
 *   In nova-console/data/nova.db: 11 `video-ltx` jobs `done`, 2 `failed`
 *   ("NOVA restarted during generation"), model `dgrauet/ltx-2.3-mlx-q4`, engine `ltx-2-mlx`.
 * - `store_models`: Ollama rows carry a 64-hex `digest` and
 *   `codePlanningQualification { qualified: [], blocked: [...] }` — none qualified.
 * - `m_llama`, `m_mistral`, `m_qwen`, `m_phi`, `m_remote` and evaluations
 *   `eval018`, `eval024`, `eval025` are hard-coded demo seeds in
 *   `public/index.html`; they are NOT evaluation evidence and are refused here.
 */
import type { ArtifactRef, ModelRole, ModelUse } from "./project-record.ts";

export const LTX_TEXT_ENCODER_ID = "mlx-community/gemma-3-12b-it-4bit";
export const LTX_ENGINE = "ltx-2-mlx";
export const SEED_FIXTURE_MODEL_IDS = ["m_llama", "m_mistral", "m_qwen", "m_phi", "m_remote"] as const;
export const SEED_FIXTURE_EVALUATION_IDS = ["eval018", "eval024", "eval025"] as const;

const HEX64 = /^[a-f0-9]{64}$/;
const SHA = /^sha256:[a-f0-9]{64}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function isSeedFixture(id: unknown): boolean {
  return typeof id === "string"
    && ((SEED_FIXTURE_MODEL_IDS as readonly string[]).includes(id) || (SEED_FIXTURE_EVALUATION_IDS as readonly string[]).includes(id));
}

/** Converts a Workstation `store_models` row into a ModelUse for one declared role. */
export function modelUseFromWorkstationModel(row: unknown, role: ModelRole): ModelUse {
  if (!isRecord(row) || typeof row.id !== "string") throw new Error("not-a-model-record");
  if (isSeedFixture(row.id)) throw new Error("seed-fixture-not-evidence");
  if (row.runtime !== "ollama" || typeof row.digest !== "string" || !HEX64.test(row.digest)) {
    throw new Error("model-without-verifiable-digest");
  }
  const q = isRecord(row.codePlanningQualification) ? row.codePlanningQualification : null;
  const qualifiedForCode = role === "code" && q !== null && q.digest === row.digest
    && Array.isArray(q.qualified) && q.qualified.length > 0;
  return {
    modelId: row.id,
    version: null,
    digest: `sha256:${row.digest}`,
    role,
    runtime: "ollama",
    // Workstation only records code-planning qualification. Every other role is unqualified.
    qualification: qualifiedForCode ? { evaluationId: `ws-code-planning-${row.digest.slice(0, 12)}`, passed: true } : "unqualified",
  };
}

/**
 * Converts one SUCCESSFUL `video-ltx` generation job into an ArtifactRef.
 * The caller must supply the sha256/bytes of the produced media file; the
 * record never embeds the video. Failed or incomplete jobs are refused.
 */
export function artifactFromLtxJob(job: unknown, media: { sha256: string; bytes: number }): ArtifactRef {
  if (!isRecord(job) || typeof job.id !== "string") throw new Error("not-a-job");
  if (job.type !== "video-ltx") throw new Error("not-an-ltx-job");
  if (job.status !== "done") throw new Error("job-not-successful");
  if (!Array.isArray(job.mediaIds) || job.mediaIds.length !== 1) throw new Error("job-without-single-output");
  const settings = isRecord(job.settings) ? job.settings : {};
  if (settings.engine !== LTX_ENGINE || typeof settings.model !== "string") throw new Error("unexpected-ltx-engine");
  if (!SHA.test(media.sha256) || !Number.isSafeInteger(media.bytes) || media.bytes <= 0) throw new Error("media-digest-required");
  const safe = job.id.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 70);
  return {
    artifactId: `ltx-${safe}`,
    kind: "video",
    storage: { app: "maataa-workstation", localKey: `generationJobs/${job.id}` },
    sha256: media.sha256,
    bytes: media.bytes,
    origin: {
      kind: "provider-draft",
      models: [
        { modelId: settings.model, version: null, digest: null, role: "video-generator", runtime: LTX_ENGINE, qualification: "unqualified" },
        { modelId: LTX_TEXT_ENCODER_ID, version: null, digest: null, role: "text-encoder", runtime: LTX_ENGINE, qualification: "unqualified" },
      ],
    },
  };
}
