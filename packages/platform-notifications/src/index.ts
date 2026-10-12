/**
 * @platform/notifications — delivery-channel abstraction only.
 *
 * Scope, deliberately narrow: a channel-agnostic `send()` interface, a local no-op
 * fallback, a composite router, and two real transports (SMTP via Nodemailer, WhatsApp
 * Cloud/Business API — import from "@platform/notifications/nodemailer" and
 * "@platform/notifications/whatsapp/business-api" respectively, kept out of this barrel
 * so consumers who only need one transport don't pull in the other's dependency).
 *
 * NOT in scope, and deliberately not extracted: payment providers, e-signature
 * providers, realtime pub/sub, and gate-sync — nevo-event-os-3's `@nevo/integrations`
 * bundled all of these together in one "integration registry", but they're unrelated
 * concerns that happen to share a composition root in that app. Payments has its own
 * planned package (@platform/payments); the rest are genuinely NEVO-specific and stay
 * local. See platform-notifications/README.md and the "organize" project's
 * architecture doc for the full extraction writeup.
 *
 * No real second consumer exists yet (ne-2 has no notification/email code at all) —
 * this package is an exact port of nevo-event-os-3's implementation, not a
 * speculatively-generalized one. See README for what that means for the env var names
 * baked into the nodemailer/whatsapp transports.
 */
export type { DeliveryChannel, DeliveryResult, InvitationDeliveryProvider } from "./types.js";
export { LocalDeliveryProvider, CompositeDeliveryProvider } from "./local.js";
