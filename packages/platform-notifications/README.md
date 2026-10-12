# @platform/notifications

Delivery-channel abstraction for transactional messages (email today, WhatsApp today,
SMS/in-app as fallback-only stubs), extracted 2026-09-13 from `nevo-event-os-3`'s
`@nevo/integrations` package — step 5 of the "organize" project's centralized-platform
architecture plan.

## What moved here

- `DeliveryChannel`, `DeliveryResult`, `InvitationDeliveryProvider` — the channel-agnostic
  `send()` contract every provider implements.
- `LocalDeliveryProvider` — the always-succeeds, never-actually-sends stub used for local
  preview and as the fallback for unconfigured channels.
- `CompositeDeliveryProvider` — routes each channel to its configured provider, falling
  back to a local stub for channels with no real provider wired up.
- `NodemailerDeliveryProvider` / `nodemailerEnvironmentIsConfigured` (import from
  `@platform/notifications/nodemailer`) — SMTP delivery via Nodemailer, including the
  Mailpit-local-preview safety rule (unauthenticated SMTP only accepted on an explicit
  dev flag + loopback host).
- `WhatsAppBusinessDeliveryProvider` (import from
  `@platform/notifications/whatsapp/business-api`) — WhatsApp Cloud/Business API sender
  (free-form text + approved-template messages).

These are exact ports, function-for-function, of `nevo-event-os-3`'s real implementation.
Kept as separate subpath exports (not one barrel) so a consumer that only needs email
doesn't pull in a WhatsApp-shaped dependency, and vice versa — matching the original
package's own export layout.

## Why the env var names are NEVO-specific, on purpose

The Nodemailer transport reads `NEVO_SMTP_HOST` / `NEVO_SMTP_PORT` / `NEVO_SMTP_USER` /
`NEVO_SMTP_PASSWORD` / `NEVO_EMAIL_FROM` / `NEVO_SMTP_ALLOW_INSECURE_LOCAL` directly, and
the WhatsApp transport reads `NEVO_WHATSAPP_PHONE_NUMBER_ID` / `NEVO_WHATSAPP_API_TOKEN` /
`NEVO_WHATSAPP_API_VERSION`. This package has exactly one real consumer today
(`nevo-event-os-3`) — `ne-2` and every other repo on the drive have no notification/email
code at all (checked before extracting; nothing to diff against or generalize a second
real shape from). Inventing a generic `PLATFORM_SMTP_*`-style convention with no second
consumer to validate it against would be speculative genericity, not a real
abstraction — so, following the same call made for `@platform/mfa`'s `NEVO_FIDO_ENABLED`,
the exact original env var names were kept. If and when a second real consumer needs this
package, that's the point to introduce a real environment-variable-prefix parameter
(or an explicit config object) instead of a hardcoded `NEVO_*` read — not before.

## What deliberately stayed in nevo-event-os-3, and why

`@nevo/integrations`'s `src/index.ts` also defined `PaymentProvider`, `SignatureProvider`,
`RealtimeProvider`, `GateSyncProvider` (plus their `Local*Provider` stub implementations)
and an `IntegrationRegistry` type that bundles all of these — payments, e-signature,
realtime pub/sub, gate sync, *and* delivery — into one composition root
(`createIntegrationRegistry`). None of the non-delivery pieces moved here:

- Payments (`PaymentProvider`, `LocalPaymentProvider`, and the real
  `DirectUpiPaymentProvider` in `upi/direct-integration.ts`) has its own planned package,
  `@platform/payments` (a later step in the architecture plan) — not bundled into
  notifications just because they shared a file.
- `SignatureProvider`, `RealtimeProvider`, `GateSyncProvider` aren't in the architecture
  plan at all. They're genuinely NEVO-specific concerns (e-signature requests, pub/sub,
  physical-gate check-in sync) that happen to share a composition root with delivery in
  that one app — not notification concerns, and not duplicated anywhere else on the
  drive. Centralizing them here would be scope creep, not consolidation.
- `IntegrationRegistry` / `createLocalIntegrationRegistry` / `createIntegrationRegistry`
  themselves are `nevo-event-os-3`'s own app-specific wiring (which of the above five
  unrelated concerns it needs, and how it composes them) — this is composition-root code,
  not a shared primitive, so it stays local. It now imports `InvitationDeliveryProvider`
  and `LocalDeliveryProvider` from this package instead of defining them itself.

## Consumers

- `nevo-event-os-3`: `apps/web/lib/integrations.ts` (the composition root),
  `apps/web/app/api/auth/password-reset/request/route.ts` (the one real call site),
  and two vitest suites (`local-mailpit-contract.test.ts`,
  `provider-composition.test.ts`) that exercise this behavior directly.
- `ne-2`: no consumer — it has no notification/email code today.
