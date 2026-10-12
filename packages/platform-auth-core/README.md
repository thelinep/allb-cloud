# @platform/auth-core

Shared, storage-agnostic auth primitives extracted 2026-09-13 from the two real,
working auth implementations on the drive: `ne-2/apps/api` (Fastify + raw
Postgres, bearer tokens) and `nevo-event-os-3/apps/web` (Next.js + Prisma,
cookie sessions).

## What moved here, and why

Reading both implementations in full (not just their schemas) found two
different situations, handled differently - the same lesson as the earlier
`@platform/ui-forms` extraction: check for real duplication vs. real
difference before merging anything.

**Identical logic, safe to collapse (no behavior change for either repo):**

- `session.ts` - `createSessionToken()`/`hashSessionToken()`. Both repos
  independently arrived at the exact same design: a random 32-byte
  base64url token handed to the client, only its SHA-256 hash stored
  server-side.
- `email.ts` - `normalizeEmail()`. Both repos trim + lowercase identically.
- `rate-limiter.ts` - `FixedWindowRateLimiter`. Both repos independently
  implemented the same fixed-window `Map<string, {count, resetAt}>`
  counter. nevo-event-os-3's extra size-bound safeguard was kept since it's
  a strict improvement.

**Real differences, deliberately kept as separate named exports (forcing
one onto the other repo would change what passwords/behavior its users
see, or break existing stored data):**

- `password-hashers/bcrypt.ts` vs `password-hashers/scrypt.ts` - ne-2
  stores bcrypt hashes (cost 12), nevo-event-os-3 stores scrypt hashes in
  its own `salt:hex` format. Neither algorithm can verify the other's
  stored hashes, so both are real, separate adapters here - not a single
  default.
- `password-policy.ts` - `validatePasswordStrict` (ne-2's
  upper/lower/digit/special/12-128-char policy) vs
  `validatePasswordMinLength` (nevo-event-os-3's 12-char-minimum-only
  policy). Different products, different actual policies today.

## What deliberately stayed local, and why

- JWT signing/verification - neither repo actually uses `jsonwebtoken`
  despite ne-2 declaring it as a dependency (dead weight, not wired to
  anything); both use opaque bearer/cookie tokens. Nothing to extract.
- Database/session-storage wiring - `ne-2`'s raw-`pg` session table queries
  and `nevo-event-os-3`'s Prisma `session`/`auditLog` transaction logic stay
  in their own repos. This package only supplies the token/hash primitives
  they call into their own storage.
- Tenant/organization RBAC (`ne-2`'s `authorization/{roles,permissions}.ts`,
  tenant-scoped) - a materially different shape from
  `nevo-event-os-3`'s single-organization-per-user role model; not
  attempted here.
- `ne-2/packages/auth`'s `policies/permissions.ts` (agent capability scopes
  like `shell.execute`, `filesystem.write`) - unrelated to user
  authentication; it's an AI-agent capability list, not an auth primitive.
  Left alone.

## Consumers

- `ne-2/packages/auth` (`@nevo/auth`) re-exports the overlapping pieces
  from here instead of maintaining its own copies of `session.ts`
  (identical) - see that package's own README/index for what it kept
  local (its agent-permission policies).
- `ne-2/apps/api` uses this package's `bcryptHashPassword`/
  `bcryptVerifyPassword` and `FixedWindowRateLimiter` in place of its
  previous inline `bcrypt.hash(...)`/`AuthRateLimiter` class.
- `nevo-event-os-3/apps/web/lib/nevo-auth.ts` uses this package's
  `createSessionToken`/`hashSessionToken`/`scryptHashPassword`/
  `scryptVerifyPassword`/`normalizeEmail` in place of its previous inline
  versions; `lib/rate-limit.ts` wraps `FixedWindowRateLimiter` instead of
  its own bucket map.
