import {test} from 'node:test';
import assert from 'node:assert/strict';
import {attest,verify,retentionDecision} from '../packages/release-evidence/integrity.mjs';
test('anchored export detects content, linkage, order and truncation changes',()=>{
 const a=attest([{id:'a',scope:'one',occurredAt:new Date('2026-01-01')},{id:'b',scope:'two'}]);assert.equal(verify(a,a.anchor),true);
 for(const change of [x=>x.rows[0].record.id='changed',x=>x.rows[0].record.occurredAt=new Date('2026-02-01'),x=>x.rows.reverse(),x=>x.rows.pop(),x=>x.rows[1].previous='bad',x=>x.rows[1].sequence=100]){
  const b=structuredClone(a);change(b);assert.equal(verify(b,a.anchor),false);
 }
 const b=attest([{id:'changed',scope:'one'},{id:'b',scope:'two'}]);assert.equal(verify(b,a.anchor),false);
 assert.equal(verify(a,null),false);assert.equal(verify(attest([]),{count:0,tail:null}),true);
});
test('retention defaults protect evidence and holds; expired disposable files only become review candidates',()=>{
 for(const kind of ['audit','approval','handoff','financial','event-version','scene-version','unknown'])assert.equal(retentionDecision({kind,expiresAt:'2000-01-01'}),'retain');
 assert.equal(retentionDecision({kind:'cache',legalHold:true,expiresAt:'2000-01-01'}),'retain');
 assert.equal(retentionDecision({kind:'cache',expiresAt:'invalid'}),'retain');
 assert.equal(retentionDecision({kind:'temporary-export',expiresAt:'2000-01-01'}),'eligible_for_review');
 assert.equal(retentionDecision({kind:'cache',expiresAt:'2099-01-01'}),'retain');
});
