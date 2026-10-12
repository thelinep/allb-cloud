import test from 'node:test';
import assert from 'node:assert/strict';
import { decimalToMinor, minorToDecimal, createHandoffPolicy, mapHandoff } from '../packages/nevo-commercial-adapter/adapter.mjs';
const at = '2026-10-10T07:00:00Z';
const approval = { outcome: 'approve', quoteId: 'q', quoteVersion: 2, layoutDigest: 'layout', actorId: 'reviewer', at };
const fixture = () => ({ record: { id: 'event', organizationId: 'org', workspaceId: 'ws', status: 'approved', inquiry: {}, layout: { digest: 'layout' }, quotes: [{ id: 'q', version: 2, currency: 'INR', subtotalMinor: 10001, layoutDigest: 'layout', lines: [] }], commercialReview: { ...approval }, decision: { ...approval, actorId: 'client' } }, booking: { id: 'b', eventId: 'event', organizationId: 'org', workspaceId: 'ws', quoteId: 'q', quoteVersion: 2, quoteStatus: 'ACCEPTED', status: 'CONFIRMED' }, actor: { id: 'producer', organizationId: 'org', workspaceId: 'ws', roles: ['production'] }, at, policy: { id: 'pilot', version: 1, paymentGate: 'planning_only', currency: 'INR' } });
test('Decimal strings preserve values beyond safe JS integer without rounding', () => {
  for (const [decimal, minor] of [['0.01', '1'], ['100.1', '10010'], ['9999999999999999.99', '999999999999999999']]) { assert.equal(decimalToMinor(decimal), minor); assert.equal(decimalToMinor(minorToDecimal(minor)), minor); }
  for (const value of [0.1, '-1', '1.001', '1e2', 'NaN', '01.00']) assert.throws(() => decimalToMinor(value), { code: 'INVALID_DECIMAL' });
});
test('unselected or unsupported policy fails closed', () => {
  assert.throws(() => mapHandoff({ ...fixture(), policy: null }), { code: 'POLICY_REQUIRED' });
  assert.throws(() => createHandoffPolicy({ id: 'x', version: 1, paymentGate: 'bypass', currency: 'INR' }), { code: 'POLICY_REQUIRED' });
});
test('planning export freezes exact reviewed quote without confirming booking', () => {
  const input = fixture(); const result = mapHandoff(input); assert.equal(result.handoff.bookingConfirmed, false); assert.equal(result.handoff.amountDecimal, '100.01'); assert.equal(result.handoff.quoteVersion, 2); assert.equal(result.handoff.status, 'planning_handoff');
  input.record.inquiry.title = 'Changed'; assert.equal(result.handoff.snapshot.inquiry.title, undefined); assert.throws(() => { result.handoff.snapshot.quote.version = 3; }, TypeError);
});
test('tenant, role, stale quote, missing review and reversed approval order fail', () => {
  for (const mutate of [i => { i.actor.workspaceId = 'other'; }, i => { i.actor.roles = ['client']; }, i => { i.booking.quoteVersion = 1; }, i => { i.record.commercialReview = null; }, i => { i.record.commercialReview.at = '2026-10-11T00:00:00Z'; }, i => { i.record.layout.digest = 'changed'; }]) { const i = fixture(); mutate(i); assert.throws(() => mapHandoff(i)); }
});
test('commercial gate needs confirmed booking and positive scoped settled payment', () => {
  const i = fixture(); i.policy.paymentGate = 'settled_payment'; assert.throws(() => mapHandoff(i), { code: 'SETTLEMENT_REQUIRED' });
  i.payment = { id: 'p', bookingId: 'b', organizationId: 'org', workspaceId: 'ws', status: 'SUCCEEDED', currency: 'INR', amount: '0.00' }; assert.throws(() => mapHandoff(i), { code: 'POSITIVE_SETTLEMENT_REQUIRED' });
  i.payment.amount = '10.00'; assert.equal(mapHandoff(i).handoff.snapshot.settlement.amountMinor, '1000');
  i.booking.status = 'CANCELLED'; assert.throws(() => mapHandoff(i), { code: 'BOOKING_NOT_CONFIRMED' });
});
test('idempotent replay preserves frozen quote; scope/policy/tampering cannot replay', () => {
  const i = fixture(); const existing = mapHandoff(i).handoff; i.record.quotes[0].version = 3;
  const replay = mapHandoff({ ...i, existing }); assert.equal(replay.replay, true); assert.equal(replay.handoff.quoteVersion, 2);
  assert.throws(() => mapHandoff({ ...i, existing: { ...existing, bookingId: 'other' } }), { code: 'REPLAY_SCOPE_OR_POLICY_CONFLICT' });
  assert.throws(() => mapHandoff({ ...i, existing: { ...existing, digest: 'bad' } }), { code: 'FROZEN_DIGEST_MISMATCH' });
  assert.throws(() => mapHandoff({ ...i, existing, policy: { ...i.policy, version: 2 } }), { code: 'REPLAY_SCOPE_OR_POLICY_CONFLICT' });
});
