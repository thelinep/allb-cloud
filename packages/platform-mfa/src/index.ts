/**
 * @platform/mfa
 *
 * WebAuthn/passkey registration and verification, seeded 2026-09-13 from
 * nevo-event-os-3's real, working implementation (merged from the
 * previously-unmerged `codex/auth0-mfa` branch - see this drive's
 * "organize" project architecture doc for that history). ne-2 has no MFA
 * feature today, so this package has exactly one real consumer so far;
 * scope was kept intentionally close to what that consumer actually needs
 * rather than speculatively generalizing further.
 *
 * What stays in the consuming app, not this package: the actual
 * WebAuthnCredential/RegisteredDevice/User/AuditLog persistence and
 * session issuance after a successful verification - those are
 * organization/audit-log-shaped and specific to nevo-event-os-3's schema
 * today. This package supplies the config derivation, challenge
 * store (generalized over a delegate interface, not a concrete Prisma
 * import), and the @simplewebauthn/server option-building/verification
 * wrappers.
 */

export * from "./constants.js";
export * from "./config.js";
export * from "./device.js";
export * from "./challenge-store.js";
export * from "./registration.js";
