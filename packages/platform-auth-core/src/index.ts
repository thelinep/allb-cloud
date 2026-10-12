/**
 * @platform/auth-core
 *
 * Storage-agnostic, framework-agnostic auth primitives shared across the
 * NEVO and Maataa/Vaigyaaniq families: opaque session tokens, a fixed-window
 * rate limiter, email normalization, and password hashing/validation.
 *
 * What this package deliberately does NOT do: issue JWTs (neither real
 * consumer uses them - ne-2 declares `jsonwebtoken` as a dependency but
 * never imports it; sessions are opaque bearer/cookie tokens in both), pick
 * one password algorithm or policy (see password-hashers/ and
 * password-policy.ts for why both real variants are kept), or touch a
 * database/ORM directly (each consumer wires these primitives into its own
 * Postgres-via-pg or Prisma session/user storage).
 *
 * See this package's README for the full extraction writeup, including
 * what was found to be identical duplication (safe to collapse) vs. a real
 * behavioral difference (kept as separate named exports).
 */

export * from "./session.js";
export * from "./email.js";
export * from "./rate-limiter.js";
export * from "./password-policy.js";
export * from "./password-hashers/bcrypt.js";
export * from "./password-hashers/scrypt.js";
