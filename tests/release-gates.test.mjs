import assert from 'node:assert/strict';import {assessRelease,requiredGates} from '../packages/release-evidence/gates.mjs';
const candidate={schemaVersion:1,commit:'fixture',gates:{}};assert.equal(assessRelease(candidate).ready,false);assert.equal(assessRelease(candidate).blockers.length,14);
for(const name of requiredGates)candidate.gates[name]={status:'verified',scope:'local',evidence:['fixture']};assert.equal(assessRelease(candidate).ready,false);
for(const name of requiredGates)candidate.gates[name].scope='production-like';assert.equal(assessRelease(candidate).ready,true);
candidate.gates.identity.evidence=[];assert.equal(assessRelease(candidate).ready,false);assert.equal(assessRelease(candidate).blockers[0].gate,'identity');
candidate.gates.fake={};assert.throws(()=>assessRelease(candidate),/Unknown/);assert.throws(()=>assessRelease({}),/Invalid/);console.log('PASS 7 fail-closed release assessment checks; fixture flags are not real certification');
