/**
 * Password strength policies.
 *
 * Unlike session tokens and rate limiting above, the two repos' password
 * *policies* are a genuine, deliberate difference, not duplication to
 * collapse: `ne-2` (packages/auth/src/validation/password.ts) requires
 * 12-128 chars plus upper/lower/digit/special-character composition.
 * `nevo-event-os-3` (apps/web routes) only enforces a 12-character minimum.
 * Forcing one policy onto the other repo would silently change what
 * passwords its users can set - so both are kept as named exports rather
 * than collapsed into a single default.
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/** Matches ne-2's policy: 12-128 chars, upper+lower+digit+special required. */
export function validatePasswordStrict(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (password.length < 12) errors.push("Password must be at least 12 characters long");
  if (password.length > 128) errors.push("Password must not exceed 128 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain a lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Password must contain a special character");
  return { valid: errors.length === 0, errors };
}

/** Matches nevo-event-os-3's policy: minimum length only (default 12). */
export function validatePasswordMinLength(password: string, minLength = 12): PasswordValidationResult {
  return password.length >= minLength
    ? { valid: true, errors: [] }
    : { valid: false, errors: [`Password must be at least ${minLength} characters long`] };
}
