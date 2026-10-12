import { createHash } from "node:crypto";

export interface EvidenceRecord {
  eventId: string;
  actor: string;
  action: string;
  payload: unknown;
  previousHash?: string | null;
}

/** NEVO v1 bytes: fixed envelope order, original JSON.stringify payload semantics. */
export function hashEvidence(input: EvidenceRecord): string {
  const canonical = JSON.stringify({
    eventId: input.eventId,
    actor: input.actor,
    action: input.action,
    payload: input.payload,
    previousHash: input.previousHash ?? null
  });
  return createHash("sha256").update(canonical).digest("hex");
}

/** Caller must read the tail/max and persist the result inside the same locked transaction. */
export function prepareEvidenceAppend<T extends Omit<EvidenceRecord, "previousHash">>(
  input: T,
  previousHash: string | null | undefined,
  maxSequence: number | null | undefined,
): T & { sequence: number; previousHash: string | null | undefined; hash: string } {
  return {
    ...input,
    sequence: (maxSequence ?? 0) + 1,
    previousHash,
    hash: hashEvidence({ ...input, previousHash }),
  };
}

/**
 * Port of NEVO's v1 export verification. Supply the full chain in sequence order.
 * Verifies hash linkage using the preceding row's hash, not stored previousHash metadata.
 * Sequence values, document/retention metadata and external chain completeness are not authenticated.
 */
export function verifyEvidenceChain(records: readonly (EvidenceRecord & { hash: string })[]): boolean[] {
  let previousHash: string | null = null;
  return records.map(record => {
    const valid = record.hash === hashEvidence({ ...record, previousHash });
    previousHash = record.hash;
    return valid;
  });
}
