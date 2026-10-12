import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiry, transition } from '../packages/nevo-workflow/workflow.mjs';
const at = '2026-10-10T07:00:00Z';
const actor = role => ({ id: role, organizationId: 'org-a', workspaceId: 'workspace-a', roles: [role] });
const inquiry = overrides => createInquiry({ id: 'event-a', organizationId: 'org-a', workspaceId: 'workspace-a', title: 'Corporate launch', requestedDate: '2026-11-10', guestCount: 100, ...overrides }, actor('planner'), at);
// Same schema as the existing MAATAA SceneDocument: meters, local Y-up, explicit transforms.
const scene = { id: 'scene-a', schemaVersion: 1, revision: 0, units: 'm', coordinateSystem: { kind: 'local', axes: 'Y-up', origin: [0, 0, 0] }, nodes: [{ id: 'stage', name: 'Stage', position: [0, 0, 0], rotation: [0, 0, 0], scale: [3, 1, 2], visible: true, color: '#bca36f' }] };
const layout = (r, s = scene) => run(r, 'layout', { venueId: 'venue-a', venueVersion: '1', scene: s }, 'planner');
const quotePayload = id => ({ id, currency: 'INR', lines: [{ id: 'stage-line', sceneNodeId: 'stage', sku: 'stage-sku', priceVersion: '2026-10', quantity: 2, unitPriceMinor: 150000 }] });
const run = (r, type, payload, role) => transition(r, { type, payload }, actor(role), { expectedRevision: r.revision, at });
const quote = r => run(r, 'quote', quotePayload(`quote-${r.revision}`), 'commercial');
const review = (r, outcome = 'approve') => run(r, 'review', { quoteId: r.quotes.at(-1).id, quoteVersion: r.quotes.at(-1).version, outcome, note: 'Internal commercial review' }, 'commercial_reviewer');
const decide = (r, outcome = 'approve') => run(r, 'decide', { quoteId: r.quotes.at(-1).id, quoteVersion: r.quotes.at(-1).version, outcome, note: 'Reviewed scope and proposal' }, 'client');
test('full lifecycle freezes approved scope and exact versioned commercial handoff', () => {
  const original = inquiry(); const drafted = layout(original); const quoted = quote(drafted);
  const approved = decide(review(quoted)); const handed = run(approved, 'handoff', { teamId: 'crew-a' }, 'production');
  assert.equal(original.status, 'inquiry'); assert.equal(original.layout, null);
  assert.equal(handed.status, 'handed_off'); assert.equal(handed.revision, 5);
  assert.equal(handed.handoff.snapshot.quote.subtotalMinor, 300000);
  assert.equal(handed.handoff.bookingConfirmed, false);
  assert.equal(handed.handoff.snapshot.quote.taxTreatment, 'not_calculated');
  assert.match(handed.handoff.digest, /^[a-f0-9]{64}$/);
  assert.equal(handed.audit.length, 6);
  assert.throws(() => { handed.handoff.snapshot.layout.scene.nodes[0].scale[0] = 50; }, TypeError);
  assert.throws(() => layout(handed), { code: 'RECORD_FROZEN' });
  assert.equal(layout(approved).commercialReview, null); assert.equal(layout(approved).decision, null);
});
test('scope, roles and stale writes fail before any mutation', () => {
  const r = inquiry(); const command = { type: 'layout', payload: { venueId: 'v', venueVersion: '1', scene } };
  for (const key of ['organizationId', 'workspaceId']) assert.throws(() => transition(r, command, { ...actor('planner'), [key]: 'other' }, { expectedRevision: 0, at }), { code: 'SCOPE_DENIED' });
  assert.throws(() => transition(r, command, actor('client'), { expectedRevision: 0, at }), { code: 'ROLE_DENIED' });
  assert.throws(() => transition(r, command, actor('planner'), { expectedRevision: 9, at }), { code: 'REVISION_CONFLICT' });
  assert.equal(r.revision, 0);
  assert.throws(() => transition(r, { type: 'toString' }, actor('planner'), { expectedRevision: 0, at }), { code: 'INVALID_COMMAND' });
});
test('layout edits invalidate approval of old quote; a new version must be reviewed', () => {
  const r = quote(layout(inquiry())); const edited = layout(r, { ...scene, revision: 1 });
  assert.equal(edited.status, 'layout_draft');
  assert.throws(() => decide(edited), { code: 'INVALID_TRANSITION' });
  const revised = quote(edited);
  assert.equal(revised.quotes.length, 2); assert.equal(revised.quotes[1].version, 2);
  assert.throws(() => run(review(revised), 'decide', { quoteId: r.quotes[0].id, quoteVersion: 1, outcome: 'approve', note: 'Old' }, 'client'), { code: 'STALE_QUOTE' });
  assert.equal(decide(review(revised)).status, 'approved');
});
test('change requests require revised quote before approval or handoff', () => {
  const r = decide(review(quote(layout(inquiry()))), 'request_changes');
  assert.throws(() => run(r, 'handoff', { teamId: 'crew' }, 'production'), { code: 'INVALID_TRANSITION' });
  assert.equal(decide(review(quote(r))).status, 'approved');
});
test('quote rejects unknown scene references, fractional money and unsafe totals', () => {
  const r = layout(inquiry());
  for (const change of [{ sceneNodeId: 'missing' }, { unitPriceMinor: 1.5 }, { quantity: 0 }, { quantity: 2, unitPriceMinor: Number.MAX_SAFE_INTEGER }]) {
    const p = quotePayload('bad'); Object.assign(p.lines[0], change);
    assert.throws(() => run(r, 'quote', p, 'commercial'), /INVALID_QUOTE_LINE|MONEY_OVERFLOW/);
  }
  const p = quotePayload('duplicate'); p.lines.push({ ...p.lines[0] });
  assert.throws(() => run(r, 'quote', p, 'commercial'), { code: 'INVALID_QUOTE_LINE' });
});
test('invalid inquiries and incompatible or non-finite scenes are rejected', () => {
  for (const requestedDate of ['2026-02-30', '2026-99-99', 'tomorrow']) assert.throws(() => inquiry({ requestedDate }), { code: 'INVALID_DATE' });
  assert.throws(() => inquiry({ guestCount: 0 }), { code: 'INVALID_INQUIRY' });
  assert.throws(() => layout(inquiry(), { ...scene, units: 'ft' }), { code: 'INVALID_SCENE' });
  assert.throws(() => layout(inquiry(), { ...scene, nodes: [{ ...scene.nodes[0], position: [Infinity, 0, 0] }] }), { code: 'INVALID_SCENE' });
});

test('commercial approval precedes client approval and both bind exact quote version', () => {
  const r = quote(layout(inquiry()));
  assert.throws(() => decide(r), { code: 'INVALID_TRANSITION' });
  assert.throws(() => run(r, 'review', { quoteId: r.quotes[0].id, quoteVersion: 1, outcome: 'approve', note: 'Review' }, 'client'), { code: 'ROLE_DENIED' });
  assert.throws(() => run(r, 'review', { quoteId: r.quotes[0].id, quoteVersion: 2, outcome: 'approve', note: 'Review' }, 'commercial_reviewer'), { code: 'STALE_QUOTE' });
  const reviewed = review(r);
  assert.throws(() => run(reviewed, 'handoff', { teamId: 'crew-a' }, 'production'), { code: 'INVALID_TRANSITION' });
  const revised = quote(reviewed);
  assert.equal(revised.commercialReview, null); assert.equal(revised.decision, null);
  assert.throws(() => decide(revised), { code: 'INVALID_TRANSITION' });
  assert.equal(review(r, 'request_changes').status, 'changes_requested');
});
