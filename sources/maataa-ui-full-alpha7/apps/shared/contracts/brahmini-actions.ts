/**
 * Brahmini planning vs execution boundary.
 *
 * `planTlpsIntakeAction` only builds a reviewable proposal (pure; no I/O).
 * `createApprovedActionExecutor` runs an action ONLY when:
 *   1. the action id is on a fixed allowlist,
 *   2. the user's approval carries the proposal's exact digest,
 *   3. that approval has not been used before (no replay),
 *   4. the host-supplied `commit` callback accepts the result.
 *
 * The allowlist has exactly one entry, backed by the preview/digest-bound
 * TLPS intake API in ./tlps-intake-flow.ts. There is no generic "run",
 * shell, file, browser, click or typing action: no existing safe API in
 * this checkout supports them, and OS-level input requires Accessibility
 * permission plus an authoritative service that does not exist.
 */
import type { TlpsDraft } from "../../tlps/src/types.ts";
import type { ProjectEventEnvelope } from "./project-events.ts";
import {
  decideIntakeProposal,
  previewIntakeRecord,
  type IntakePreview,
  type IntakeProposal,
} from "./tlps-intake-flow.ts";

export const ALLOWLISTED_ACTIONS = ["tlps.intake.create-record"] as const;
export type AllowlistedAction = (typeof ALLOWLISTED_ACTIONS)[number];

export interface ActionProposal {
  proposalVersion: 1;
  actionId: string;
  summary: string;
  digest: string;
  preview: IntakePreview;
  /** Planning never executes. */
  executes: false;
}

export interface ActionApproval {
  actionId: string;
  digest: string;
  decidedBy: "local-user";
}

export interface ActionCommit {
  (result: { record: TlpsDraft; events: ProjectEventEnvelope[] }): Promise<void>;
}

export async function planTlpsIntakeAction(
  proposal: IntakeProposal,
  baseDraft: TlpsDraft,
  existingDraft: TlpsDraft | null,
): Promise<ActionProposal> {
  const preview = await previewIntakeRecord(proposal, baseDraft, existingDraft);
  return {
    proposalVersion: 1,
    actionId: "tlps.intake.create-record",
    summary: `Create TLPS project "${proposal.title}" (${proposal.productionType}). ${proposal.label}`,
    digest: preview.proposalDigest,
    preview,
    executes: false,
  };
}

export function isAllowlistedAction(actionId: unknown): actionId is AllowlistedAction {
  return typeof actionId === "string" && (ALLOWLISTED_ACTIONS as readonly string[]).includes(actionId);
}

export function createApprovedActionExecutor(commit: ActionCommit, now: () => number = Date.now) {
  const usedDigests = new Set<string>();
  const inFlight = new Set<string>();
  return async function execute(
    proposal: ActionProposal,
    approval: ActionApproval | null,
    log: readonly ProjectEventEnvelope[],
  ): Promise<{ record: TlpsDraft; events: ProjectEventEnvelope[] }> {
    if (!isAllowlistedAction(proposal.actionId)) throw new Error("action-not-allowlisted");
    if (!approval || approval.decidedBy !== "local-user") throw new Error("approval-required");
    if (approval.actionId !== proposal.actionId || approval.digest !== proposal.digest) throw new Error("approval-mismatch");
    if (usedDigests.has(approval.digest) || inFlight.has(approval.digest)) throw new Error("approval-already-used");
    inFlight.add(approval.digest);
    try {
      const outcome = await decideIntakeProposal(
        proposal.preview,
        { decision: "approve", proposalDigest: approval.digest, decidedBy: "local-user" },
        log,
        now,
      );
      if (!outcome.record) throw new Error("no-record-produced");
      const result = { record: outcome.record, events: outcome.events };
      // Consumed only once the host confirms the write; a failed commit can be retried.
      await commit(result);
      usedDigests.add(approval.digest);
      return result;
    } finally {
      inFlight.delete(approval.digest);
    }
  };
}
