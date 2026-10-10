import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.MAATAA_TEST_BASE||'http://127.0.0.1:4310';
const manifest=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
let passed=0;const errors=[];
for(const path of manifest.concreteRoutes){try{const response=await fetch(base+path);const text=await response.text();assert.equal(response.status,200,path);assert.ok(text.includes('<h1'),path);assert.ok(!text.includes('Unable to render this view'),path);passed++}catch(e){errors.push(String(e))}}
for(const path of ['/components/not-real','/studio/scenes/not-real','/not-a-route']){const response=await fetch(base+path);assert.equal(response.status,404,path)}
const result={checked:manifest.routeCount,passed,unknownRoute404Checks:3,errors,browserInteractions:'UNTESTED',mobileVisualQA:'UNTESTED'};
fs.writeFileSync('http-check-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
