# NEVO commercial integration policy

Pinned upstream: `thelinep/nevoeos` commit `f50af9dd91b987080faa8fa00f2416b73cf8de78`.
Inspected source blobs:

| Path | Git blob |
|---|---|
| `apps/web/lib/commercial-lifecycle.ts` | `8e2bdcd69162be1beb11a8819a8d65febad6950c` |
| `apps/web/app/api/bookings/[bookingId]/handoff/route.ts` | `2232b9bbf26f80cba61f04b2a4778deab76cfd37` |
| `prisma/schema.prisma` | `3a9bc347b6e41228373fe10a7d4dd50db8378e98` |

## Findings and reconciliation

Upstream quote revisions increment version and supersede predecessor/sibling offers. Handoff freezes once per booking (`ProductionHandoff.bookingId @unique`) and checks one successful payment. Its function does **not** explicitly require confirmed booking status or accepted quote status. The snapshot has a quote ID but no explicit quote-version column. Upstream conversion uses `numberValue` and quote calculations use binary floating point with rounding. These behaviors cannot silently become ALLB authority.

ALLB already requires internal commercial review followed by client approval tied to the exact quote and scene/layout digest. `packages/nevo-commercial-adapter/adapter.mjs` retains both approvals, requires an explicitly accepted linked quote, and emits an immutable handoff envelope containing the exact quote version, approvals, layout, policy version and settlement evidence.

The user selected `settled_payment` for the first release. The amount threshold remains open; this choice does not establish full payment.

Payment gate is mandatory, never inferred:

- `planning_only`: no payment needed; output is `planning_handoff` and `bookingConfirmed: false`. This does not authorize production spending or confirm a commercial booking.
- `settled_payment`: confirmed/in-progress/completed booking plus one positive, tenant/workspace/booking-bound successful payment in the same currency. This reflects the upstream successful-payment existence gate, strengthened with explicit booking/quote binding. A small advance can satisfy it; **full payment is not established**.

Production choice of payment threshold (advance versus full settlement), refunds, cancellations, supplier tax, contracts and commercial total authority remains a decision gate. The current adapter amount is the existing ALLB quote **subtotal**, whose tax treatment remains `not_calculated`; it is not a tax-inclusive invoice or final payable total. Upstream GST/commercial-snapshot service must be integrated before financial use.

## Exact money

`decimalToMinor` takes Decimal `.toString()` output as a decimal string and uses BigInt internally. It rejects numbers, exponents, negatives and excess precision, without rounding. `minorToDecimal` reverses the mapping. Serialized minor amounts are strings, retaining values beyond JavaScript safe-integer limits. Only explicit two-decimal INR/USD/EUR/GBP policies are supported. Existing ALLB quote subtotal remains a validated safe integer; broad-currency support is not invented.

## Replay and persistence boundary

An existing frozen handoff replays its original state even if the mutable current quote has advanced. It must match organization, workspace, event, booking and exact policy and pass its snapshot digest. No silent re-freezing. This is a pure adapter, not persistence: the future repository must load scoped aggregates, authenticate the actor, enforce authorization and run insert-or-replay in a transaction with a unique scoped booking key. Digest detects accidental tampering, not malicious rewriting of both snapshot and digest; signed evidence/storage authority is a separate gate. No HTTP route, real booking, payment provider or backend was claimed.

## Validation

`node --test tests/nevo-commercial-adapter.test.mjs`: six tests passed for exact money, absent/invalid policies, frozen planning snapshots, scope/roles/stale/reversed approvals, confirmed positive settlement, immutable replay and conflicts. Existing workflow tests are unchanged. Live Prisma/PostgreSQL, concurrent unique-key replay and authenticated browser flows remain untested integration gates.
