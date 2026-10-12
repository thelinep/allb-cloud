import { createHash } from 'node:crypto';

export class WorkflowError extends Error {
  constructor(code) { super(code); this.code = code; }
}
const fail = code => { throw new WorkflowError(code); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const copy = value => JSON.parse(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const roles = { layout: ['planner'], quote: ['commercial'], review: ['commercial_reviewer'], decide: ['client'], handoff: ['production'] };

/** Call only after server authorization; actor/context are not browser credentials. */
export function createInquiry({ id, organizationId, workspaceId, title, requestedDate, guestCount }, actor, at) {
  if (![id, organizationId, workspaceId, title].every(text) || !integer(guestCount) || guestCount === 0) fail('INVALID_INQUIRY');
  const date = new Date(`${requestedDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== requestedDate) fail('INVALID_DATE');
  authorize({ organizationId, workspaceId }, actor, ['planner']);
  timestamp(at);
  return freeze({ schemaVersion: 1, id, organizationId, workspaceId, revision: 0, status: 'inquiry', inquiry: { title: title.trim(), requestedDate, guestCount }, layout: null, quotes: [], commercialReview: null, decision: null, handoff: null, audit: [{ revision: 0, action: 'inquiry', actorId: actor.id, at }] });
}
function timestamp(at) { if (!text(at) || !Number.isFinite(Date.parse(at))) fail('INVALID_TIMESTAMP'); }
function authorize(record, actor, allowed) {
  if (!actor || !text(actor.id) || actor.organizationId !== record.organizationId || actor.workspaceId !== record.workspaceId) fail('SCOPE_DENIED');
  if (!Array.isArray(actor.roles) || !allowed.some(role => actor.roles.includes(role))) fail('ROLE_DENIED');
}
function validateScene(scene) {
  if (!scene || !text(scene.id) || scene.schemaVersion !== 1 || !integer(scene.revision) || scene.units !== 'm' || scene.coordinateSystem?.kind !== 'local' || scene.coordinateSystem?.axes !== 'Y-up' || !Array.isArray(scene.nodes) || !scene.nodes.length) fail('INVALID_SCENE');
  const vector = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  if (!vector(scene.coordinateSystem.origin)) fail('INVALID_SCENE');
  const ids = new Set();
  for (const node of scene.nodes) {
    if (!text(node.id) || ids.has(node.id) || !text(node.name) || !vector(node.position) || !vector(node.rotation) || !vector(node.scale) || node.scale.some(n => n <= 0) || typeof node.visible !== 'boolean' || !/^#[0-9a-f]{6}$/i.test(node.color)) fail('INVALID_SCENE');
    ids.add(node.id);
  }
}
function quoteFor(record, payload) {
  if (!record.layout || !text(payload.id) || record.quotes.some(q => q.id === payload.id) || !/^[A-Z]{3}$/.test(payload.currency) || !Array.isArray(payload.lines) || !payload.lines.length) fail('INVALID_QUOTE');
  const ids = new Set(), nodeIds = new Set(record.layout.scene.nodes.map(n => n.id));
  let totalMinor = 0;
  const lines = payload.lines.map(line => {
    if (!text(line.id) || ids.has(line.id) || !text(line.sku) || !text(line.priceVersion) || !nodeIds.has(line.sceneNodeId) || !integer(line.quantity) || line.quantity === 0 || !integer(line.unitPriceMinor)) fail('INVALID_QUOTE_LINE');
    ids.add(line.id);
    const amountMinor = line.quantity * line.unitPriceMinor;
    if (!integer(amountMinor) || !integer(totalMinor + amountMinor)) fail('MONEY_OVERFLOW');
    totalMinor += amountMinor;
    return { id: line.id, sceneNodeId: line.sceneNodeId, sku: line.sku, priceVersion: line.priceVersion, quantity: line.quantity, unitPriceMinor: line.unitPriceMinor, amountMinor };
  });
  return { id: payload.id, version: record.quotes.length + 1, currency: payload.currency, layoutDigest: record.layout.digest, lines, subtotalMinor: totalMinor, taxTreatment: 'not_calculated', commercialStatus: 'proposal_only' };
}

/** Immutable optimistic-concurrency domain transition. No storage or network effects. */
export function transition(record, command, actor, { expectedRevision, at }) {
  if (!record || record.schemaVersion !== 1 || !Object.hasOwn(roles, command?.type)) fail('INVALID_COMMAND');
  authorize(record, actor, roles[command.type]);
  if (expectedRevision !== record.revision) fail('REVISION_CONFLICT');
  timestamp(at);
  if (record.status === 'handed_off') fail('RECORD_FROZEN');
  const next = copy(record), payload = command.payload ?? {};
  if (command.type === 'layout') {
    validateScene(payload.scene);
    if (!text(payload.venueId) || !text(payload.venueVersion)) fail('INVALID_VENUE');
    next.layout = { venueId: payload.venueId, venueVersion: payload.venueVersion, scene: copy(payload.scene), digest: hash({ venueId: payload.venueId, venueVersion: payload.venueVersion, scene: payload.scene }) };
    next.commercialReview = null; next.decision = null;
    next.status = 'layout_draft';
  } else if (command.type === 'quote') {
    if (!['layout_draft', 'quoted', 'commercially_reviewed', 'approved', 'changes_requested'].includes(record.status)) fail('INVALID_TRANSITION');
    next.quotes.push(quoteFor(record, payload)); next.commercialReview = null; next.decision = null; next.status = 'quoted';
  } else if (command.type === 'review') {
    if (record.status !== 'quoted' || !['approve', 'request_changes'].includes(payload.outcome)) fail('INVALID_TRANSITION');
    const quote = record.quotes.at(-1);
    if (payload.quoteId !== quote.id || payload.quoteVersion !== quote.version || quote.layoutDigest !== record.layout.digest) fail('STALE_QUOTE');
    if (!text(payload.note)) fail('DECISION_NOTE_REQUIRED');
    next.commercialReview = { outcome: payload.outcome, quoteId: quote.id, quoteVersion: quote.version, layoutDigest: quote.layoutDigest, note: payload.note.trim(), actorId: actor.id, at };
    next.decision = null;
    next.status = payload.outcome === 'approve' ? 'commercially_reviewed' : 'changes_requested';
  } else if (command.type === 'decide') {
    if (record.status !== 'commercially_reviewed' || !['approve', 'request_changes'].includes(payload.outcome)) fail('INVALID_TRANSITION');
    const quote = record.quotes.at(-1);
    if (payload.quoteId !== quote.id || payload.quoteVersion !== quote.version || quote.layoutDigest !== record.layout.digest) fail('STALE_QUOTE');
    if (!text(payload.note)) fail('DECISION_NOTE_REQUIRED');
    next.decision = { outcome: payload.outcome, quoteId: quote.id, quoteVersion: quote.version, layoutDigest: quote.layoutDigest, note: payload.note.trim(), actorId: actor.id, at };
    next.status = payload.outcome === 'approve' ? 'approved' : 'changes_requested';
  } else {
    if (record.status !== 'approved' || !text(payload.teamId)) fail('INVALID_TRANSITION');
    const latest = record.quotes.at(-1);
    if (record.commercialReview?.outcome !== 'approve' || record.decision?.outcome !== 'approve' || [record.commercialReview, record.decision].some(a => a.quoteId !== latest.id || a.quoteVersion !== latest.version || a.layoutDigest !== record.layout.digest)) fail('APPROVAL_MISMATCH');
    const snapshot = { commercialReview: record.commercialReview, inquiry: record.inquiry, layout: record.layout, quote: record.quotes.at(-1), decision: record.decision };
    next.handoff = { teamId: payload.teamId, at, actorId: actor.id, snapshot: copy(snapshot), digest: hash(snapshot), status: 'planning_handoff', bookingConfirmed: false };
    next.status = 'handed_off';
  }
  next.revision += 1;
  next.audit.push({ revision: next.revision, action: command.type, actorId: actor.id, at });
  return freeze(next);
}
