import fs from 'node:fs';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
assert.equal(new Set(manifest.concreteRoutes).size,manifest.routeCount);
const routes=JSON.parse(fs.readFileSync('lib/routes.json','utf8'));
for(const r of routes){const p='app'+(r.path==='/'?'':r.path)+'/page.tsx';assert.ok(fs.existsSync(p),p)}
const modes=new Set(['directory','tokens','form','data','scene','spatial','auth','permissions','sessions','audit','members','assets','workflow','component','code','readiness','docs']);
for(const r of routes)assert.ok(modes.has(r.mode),r.path);
console.log(`PASS: ${routes.length} concrete page modules; ${manifest.routeCount} supported fixture/catalogue URLs`);
