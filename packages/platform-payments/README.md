# @platform/payments

Payment infrastructure extracted from NEVO on 2026-09-13 without provider behavior
refactoring. No runtime dependencies. Build before installing with a `file:` dependency.

Exports: `PaymentProvider`, `LocalPaymentProvider`, intent/refund/webhook input and
result types, `PaymentState` (PENDING/SUCCEEDED/FAILED/REFUNDED), the existing Prisma
P2002 idempotency-conflict classifier, and `PaymentProviderError` (the existing Error
contract, not a new wrapper). Subpaths: `/upi/direct-integration` and `/razorpay`.
The Razorpay order and webhook payload types are exported from its subpath, along with
`RazorpayPaymentProvider` (implements `PaymentProvider`, added Phase C-F-RZP) and
`createRazorpayRefund`.

NEVO retains event authorization, tickets/bookings/orders, amounts and currency
conversion policy, discounts, settlement transitions, database transactions,
durable receipt claims/retries, refund eligibility and webhook consequences.
No in-memory deduplication is substituted for database idempotency. Caller-provided
idempotency keys are forwarded unchanged. No new refund idempotency claim is made.

The providers return PENDING on intent/refund creation. PaymentState is a vocabulary,
not a provider-status translator or a settlement state machine. Provider exceptions
retain their exact Error instances/messages and fetch/JSON failure behavior. No
speculative typed error codes or order-to-booking mapping were added.

Direct UPI is an assumed generic bank contract, not a verified bank integration.
Razorpay now has a `PaymentProvider`-conforming adapter (`RazorpayPaymentProvider`,
Phase C-F-RZP) and a refund function, but NEVO's public legacy Razorpay payment
endpoints (`apps/web/app/api/payments/*`) remain permanently disabled by design --
Razorpay is wired only through NEVO's existing Customer Pay Now -> PaymentIntent ->
PaymentProvider -> webhook -> settlement architecture, never a second lifecycle. This
extraction enables no provider by itself; activation still requires NEVO_PAYMENT_PROVIDER
and real credentials to be configured, and a real bank/Razorpay account to have been
verified. Tests use mocked fetch only, except this package's own `node --test` suite,
which is real and unmocked at the JS level (see `npm test`).

Compatibility quirks: the local verifier can throw for a 64-character non-hex signature;
UPI uses Buffer hex decoding (including its suffix behavior). Razorpay's webhook and
payment signature comparisons were hardened to constant-time (`crypto.timingSafeEqual`)
in Phase C-F-RZP -- this changes no accept/reject outcome for any input (see
`tests/payments.test.mjs`), it only removes a timing side-channel from the comparison
itself. The exact-string-equality quirk this note used to describe no longer applies.

Run `npm ci --ignore-scripts`, `npm test`, `npm run typecheck`. Tests cover provider
request bytes, reference construction, signature behaviors, failure messages,
refund primitives and idempotency classification. No remote configured.
