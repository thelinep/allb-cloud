/**
 * Small pure helpers factored out of nevo-event-os-3's FIDO registration
 * route, where this logic was inlined once per field. Kept storage-agnostic
 * - callers still own writing the result to their own RegisteredDevice-shaped
 * table.
 */
import { createHash } from "node:crypto";

/** One-way fingerprint of a raw User-Agent header - never store the raw string. */
export function hashUserAgent(userAgent: string): string {
  return createHash("sha256").update(userAgent).digest("hex");
}

export function sanitizeDeviceField(value: string | undefined, maxLength = 80): string | undefined {
  return value?.trim().slice(0, maxLength) || undefined;
}

export interface DeviceLabelInput {
  /** SimpleWebAuthn's `credentialDeviceType`: "singleDevice" | "multiDevice". */
  deviceType: string;
  platform?: string;
  label?: string;
}

export function deriveDeviceLabel(input: DeviceLabelInput): string {
  const explicit = input.label?.trim().slice(0, 120);
  if (explicit) return explicit;
  const kind = input.deviceType === "multiDevice" ? "Passkey" : "Security key";
  return input.platform ? `${kind} on ${input.platform}` : kind;
}
