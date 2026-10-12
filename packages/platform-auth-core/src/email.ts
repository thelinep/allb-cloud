/**
 * Both consuming repos normalize email addresses identically before any
 * lookup or storage: trim, lowercase. Shared here to avoid a third copy
 * appearing the next time a repo needs it.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
