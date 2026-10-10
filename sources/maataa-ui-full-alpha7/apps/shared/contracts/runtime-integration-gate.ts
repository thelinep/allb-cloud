/**
 * Desktop ↔ runtime integration gate. Fails closed: the gate passes only
 * when a real handshake is `connected`, identity and contract version
 * match, the runtime itself REPORTED its capabilities, and every required
 * capability is available. Today ALLB's HTTP surface reports health only,
 * so this gate is expected to fail until a capability source exists —
 * that failure is the truthful state, not a bug to paper over.
 */
import {
  ALLB_EXPECTED_SERVICE,
  isCompatibleContractVersion,
  type RuntimeHandshakeResult,
} from "./runtime-handshake.ts";

export interface IntegrationExpectation {
  service: string;
  requiredCapabilities: string[];
  /** e.g. "de82c3691ae3…" — recorded for evidence; the runtime cannot attest it yet. */
  expectedSourceCommit?: string;
}

export interface GateVerdict {
  pass: boolean;
  failures: string[];
  /** Things the gate could not check because the runtime does not expose them. */
  unverifiable: string[];
}

export const DEFAULT_EXPECTATION: IntegrationExpectation = {
  service: ALLB_EXPECTED_SERVICE,
  requiredCapabilities: ["brahmi:tokenize"],
};

export function evaluateIntegrationGate(
  result: RuntimeHandshakeResult,
  expectation: IntegrationExpectation = DEFAULT_EXPECTATION,
): GateVerdict {
  const failures: string[] = [];
  const unverifiable: string[] = ["runtime-source-commit-attestation", "k7", "hemant-samwat-clock"];
  if (result.state !== "connected") failures.push(`state:${result.state}`);
  if (result.runtime.service !== expectation.service) failures.push("identity-mismatch");
  if (!isCompatibleContractVersion(result.runtime.contractVersion)) failures.push("contract-version-mismatch");
  if (result.health !== "ok") failures.push("health-not-ok");
  if (!result.capabilitiesReported) failures.push("capabilities-not-reported-by-runtime");
  for (const id of expectation.requiredCapabilities) {
    if (!result.capabilities.some((capability) => capability.id === id && capability.available)) {
      failures.push(`missing-capability:${id}`);
    }
  }
  return { pass: failures.length === 0, failures: [...new Set(failures)], unverifiable };
}
