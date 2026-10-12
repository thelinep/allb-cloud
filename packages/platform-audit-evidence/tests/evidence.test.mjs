import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { hashEvidence, prepareEvidenceAppend, verifyEvidenceChain } from '../dist/index.js';

// Frozen pre-extraction implementation: compatibility is with persisted v1 bytes,
// not a new sorted-key JSON encoding.
function legacyHash(input) {
  return createHash('sha256').update(JSON.stringify({
    eventId: input.eventId, actor: input.actor, action: input.action,
    payload: input.payload, previousHash: input.previousHash ?? null,
  })).digest('hex');
}
const input = { eventId: 'event-1', actor: 'actor-1', action: 'approved', payload: '{"version":4}' };
function chain() {
  const first = prepareEvidenceAppend(input, undefined, null);
  return [first, prepareEvidenceAppend({ ...input, action: 'signed' }, first.hash, first.sequence)];
}

test('preserves legacy hashes for strings, Unicode, objects, omitted payload and null links', () => {
  for (const payload of [input.payload, 'स्वीकृत ✅', { z: 1, a: 2 }, null, undefined]) {
    for (const previousHash of [undefined, null, 'previous']) {
      const record = { ...input, payload, previousHash };
      assert.equal(hashEvidence(record), legacyHash(record));
    }
  }
  assert.notEqual(hashEvidence({ ...input, payload: { z: 1, a: 2 } }), hashEvidence({ ...input, payload: { a: 2, z: 1 } }));
  assert.notEqual(hashEvidence(input), hashEvidence({ ...input, payload: { version: 4 } }));
});

test('prepares genesis and successor without mutating the caller payload', () => {
  const frozen = Object.freeze({ ...input });
  const first = prepareEvidenceAppend(frozen, undefined, null);
  assert.equal(first.sequence, 1);
  assert.equal(first.previousHash, undefined);
  assert.equal(first.hash, legacyHash(frozen));
  const second = prepareEvidenceAppend(frozen, first.hash, 7);
  assert.equal(second.sequence, 8);
  assert.equal(second.previousHash, first.hash);
  assert.equal(second.hash, legacyHash({ ...frozen, previousHash: first.hash }));
  assert.deepEqual(frozen, input);
});

test('verifies empty and full legacy chains', () => {
  assert.deepEqual(verifyEvidenceChain([]), []);
  const records = chain();
  assert.deepEqual(verifyEvidenceChain(records), [true, true]);
  assert.deepEqual(verifyEvidenceChain(records.map(r => ({ ...r, hash: legacyHash(r) }))), [true, true]);
});

test('detects payload, actor, action, event and hash tampering', () => {
  for (const field of ['payload', 'actor', 'action', 'eventId', 'hash']) {
    const records = chain();
    records[0] = { ...records[0], [field]: 'tampered' };
    assert.equal(verifyEvidenceChain(records)[0], false, field);
  }
  const records = chain();
  records[0].hash = 'tampered';
  assert.deepEqual(verifyEvidenceChain(records), [false, false]);
});

test('detects reordering and missing predecessors', () => {
  const records = chain();
  assert.deepEqual(verifyEvidenceChain([...records].reverse()), [false, false]);
  assert.deepEqual(verifyEvidenceChain(records.slice(1)), [false]);
});

test('preserves v1 limits: metadata and tail truncation need independent verification', () => {
  const records = chain();
  records[0] = { ...records[0], sequence: 90, previousHash: 'metadata-only', documentHash: 'changed' };
  assert.deepEqual(verifyEvidenceChain(records), [true, true]);
  assert.deepEqual(verifyEvidenceChain(records.slice(0, 1)), [true]);
});
