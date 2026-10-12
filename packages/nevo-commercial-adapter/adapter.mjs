import { createHash } from 'node:crypto';
export class CommercialAdapterError extends Error { constructor(code) { super(code); this.code = code; } }
const fail = code => { throw new CommercialAdapterError(code); };
const text = v => typeof v === 'string' && v.trim().length > 0;
const clone = v => JSON.parse(JSON.stringify(v));
const freeze = v => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
// PostgreSQL JSONB can reorder object keys; a frozen snapshot must survive reload.
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const digest = v => createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
/** Accept Decimal.toString() output, never numberValue()/binary floats. INR/USD-style two-decimal currencies only. */
export function decimalToMinor(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) fail('INVALID_DECIMAL');
  const [whole, fraction = ''] = value.split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))).toString();
}
export function minorToDecimal(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) fail('INVALID_MINOR');
  const n = BigInt(value); return `${n / 100n}.${(n % 100n).toString().padStart(2, '0')}`;
}
/** Explicit policy; production payment semantics require a separately reviewed decision. */
export function createHandoffPolicy({ id, version, paymentGate, currency }) {
  if (!text(id) || !Number.isSafeInteger(version) || version < 1 || !['planning_only', 'settled_payment'].includes(paymentGate) || !['INR', 'USD', 'EUR', 'GBP'].includes(currency)) fail('POLICY_REQUIRED');
  return freeze({ id, version, paymentGate, currency });
}
/** Scoped server-loaded aggregate in; immutable persistence envelope out. No database/network side effects. */
export function mapHandoff({ record, booking, payment = null, policy, actor, at, existing = null }) {
  policy = createHandoffPolicy(policy ?? {});
  if (!record || !actor || !text(actor.id) || actor.organizationId !== record.organizationId || actor.workspaceId !== record.workspaceId || !actor.roles?.includes('production')) fail('SCOPE_OR_ROLE_DENIED');
  if (!text(booking?.id) || booking.eventId !== record.id || booking.organizationId !== record.organizationId || booking.workspaceId !== record.workspaceId) fail('BOOKING_SCOPE_MISMATCH');
  if (existing) {
    if (existing.organizationId !== record.organizationId || existing.workspaceId !== record.workspaceId || existing.eventId !== record.id || existing.bookingId !== booking.id || existing.policy.id !== policy.id || existing.policy.version !== policy.version || existing.policy.paymentGate !== policy.paymentGate || existing.policy.currency !== policy.currency) fail('REPLAY_SCOPE_OR_POLICY_CONFLICT');
    if (existing.digest !== digest(existing.snapshot)) fail('FROZEN_DIGEST_MISMATCH');
    return { handoff: freeze(clone(existing)), replay: true };
  }
  const quote = record.quotes?.at(-1);
  if (record.status !== 'approved' || !quote || quote.currency !== policy.currency || booking.quoteId !== quote.id || booking.quoteVersion !== quote.version || booking.quoteStatus !== 'ACCEPTED') fail('QUOTE_BINDING_MISMATCH');
  for (const approval of [record.commercialReview, record.decision]) {
    if (approval?.outcome !== 'approve' || approval.quoteId !== quote.id || approval.quoteVersion !== quote.version || approval.layoutDigest !== record.layout?.digest || !text(approval.actorId)) fail('APPROVAL_MISMATCH');
  }
  if (quote.layoutDigest !== record.layout.digest || Date.parse(record.commercialReview.at) > Date.parse(record.decision.at) || !Number.isFinite(Date.parse(record.commercialReview.at)) || !Number.isFinite(Date.parse(record.decision.at))) fail('APPROVAL_ORDER_OR_LAYOUT_MISMATCH');
  if (!text(at) || !Number.isFinite(Date.parse(at)) || Date.parse(at) < Date.parse(record.decision.at)) fail('INVALID_TIMESTAMP');
  if (!Number.isSafeInteger(quote.subtotalMinor) || quote.subtotalMinor < 0) fail('INVALID_QUOTE_MONEY');
  const amountMinor = String(quote.subtotalMinor);
  let settlement = null;
  if (policy.paymentGate === 'settled_payment') {
    if (!['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)) fail('BOOKING_NOT_CONFIRMED');
    if (!text(payment?.id) || payment.bookingId !== booking.id || payment.organizationId !== record.organizationId || payment.workspaceId !== record.workspaceId || payment.status !== 'SUCCEEDED' || payment.currency !== policy.currency) fail('SETTLEMENT_REQUIRED');
    const paidMinor = decimalToMinor(payment.amount);
    if (BigInt(paidMinor) <= 0n) fail('POSITIVE_SETTLEMENT_REQUIRED');
    settlement = { id: payment.id, amountMinor: paidMinor, currency: payment.currency, status: payment.status };
  }
  const snapshot = clone({ inquiry: record.inquiry, layout: record.layout, quote, commercialReview: record.commercialReview, decision: record.decision, policy, booking: { id: booking.id, status: booking.status, quoteId: quote.id, quoteVersion: quote.version }, settlement });
  const handoff = freeze({ schemaVersion: 1, organizationId: record.organizationId, workspaceId: record.workspaceId, eventId: record.id, bookingId: booking.id, quoteId: quote.id, quoteVersion: quote.version, amountMinor, amountDecimal: minorToDecimal(amountMinor), currency: policy.currency, policy, status: policy.paymentGate === 'planning_only' ? 'planning_handoff' : 'commercial_handoff', bookingConfirmed: policy.paymentGate === 'settled_payment', frozenBy: actor.id, frozenAt: at, snapshot, digest: digest(snapshot) });
  return { handoff, replay: false };
}
