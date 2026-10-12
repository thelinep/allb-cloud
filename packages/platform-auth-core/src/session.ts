/**
 * Opaque bearer/cookie session tokens.
 *
 * Both `ne-2` (packages/auth/src/sessions/token.ts) and `nevo-event-os-3`
 * (apps/web/lib/nevo-auth.ts) had independently arrived at the exact same
 * design: a random 32-byte base64url token handed to the client, with only
 * its SHA-256 hash persisted server-side. That's a genuine, lossless
 * consolidation (unlike password hashing below) - there was no API
 * difference to reconcile, just two copies of identical logic.
 */
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export interface SessionPair {
  token: string;
  expiresAt: Date;
}
