import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {compatibility,canPublish,mandatoryReleaseGates} from '../packages/release-evidence/brand-compatibility.mjs';
const manifest=JSON.parse(readFileSync(new URL('../docs/brand-expansion-manifest.json',import.meta.url),'utf8'));
test('all artwork concepts have distinct dependency entries and closed release gates',()=>{
 assert.equal(manifest.items.length,36);assert.equal(new Set(manifest.items.map(x=>x.slug)).size,36);
 for(const entry of manifest.items){assert.equal(compatibility(entry.requiredContracts).compatible,true);assert.equal(canPublish(entry),false);assert.equal(entry.workflowStatus,'not_certified_by_landing');}
});
test('unknown majors, missing gates and duplicated auth authority cannot publish',()=>{
 const entry=manifest.items.find(x=>x.slug==='nevo');assert.equal(canPublish(entry,{gates:mandatoryReleaseGates}),true);
 assert.equal(canPublish({...entry,authority:'brand-local-auth'},{gates:mandatoryReleaseGates}),false);
 assert.equal(canPublish({...entry,requiredContracts:{identity:2}},{gates:mandatoryReleaseGates}),false);
 assert.equal(canPublish(entry,{gates:mandatoryReleaseGates.slice(1)}),false);
 assert.equal(compatibility({unknown:1}).compatible,false);assert.equal(compatibility({}).compatible,false);
});
