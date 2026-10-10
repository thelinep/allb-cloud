import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {toolsFor} from '../lib/launchers.ts';
const manifest=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
const landingManifest=JSON.parse(fs.readFileSync('public/allb/manifest.json','utf8'));
const publicRoot=path.resolve('public');
const sourceRoot=path.resolve('../../sources/maataa-ui-full-alpha7/apps/hemant-observatory/public/allb');
const files=[];
function walk(dir){for(const name of fs.readdirSync(dir)){const p=path.join(dir,name);if(fs.statSync(p).isDirectory())walk(p);else files.push(p);}}
walk(path.join(publicRoot,'allb'));
const digest=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const file of files){const rel=path.relative(path.join(publicRoot,'allb'),file);assert.equal(digest(file),digest(path.join(sourceRoot,rel)),'Asset changed: '+rel);}
const routeSet=new Set(manifest.concreteRoutes);
for(const item of landingManifest.items){assert(routeSet.has('/allb/'+item.slug));assert(routeSet.has('/workspace/'+item.slug));for(const tool of toolsFor(item.category))assert(routeSet.has(tool.path),'Unimplemented tool link '+tool.path);}
const port='4328';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',port],{stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',b=>{log+=b;});server.stderr.on('data',b=>{log+=b;});
const base='http://127.0.0.1:'+port;
try{
 let ready=false;for(let i=0;i<100;i++){try{const r=await fetch(base);if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready,'Server failed to start: '+log);
 for(const route of manifest.concreteRoutes){const r=await fetch(base+route);const html=await r.text();assert.equal(r.status,200,route);assert(html.includes('<h1'),route+' missing heading');assert(html.includes('aria-label="Application"'),route+' missing shared navigation');}
 for(const route of ['/allb/not-real','/workspace/not-real','/components/not-real','/studio/scenes/not-real','/not-a-route'])assert.equal((await fetch(base+route)).status,404,route);
 for(const file of files){const rel='/'+path.relative(publicRoot,file).replaceAll(path.sep,'/');assert.equal((await fetch(base+rel)).status,200,rel);}
 for(const item of landingManifest.items){const landing=await (await fetch(base+'/allb/'+item.slug)).text();assert(landing.includes('/workspace/'+item.slug),'Missing landing handoff '+item.slug);const workspace=await(await fetch(base+'/workspace/'+item.slug)).text();assert(workspace.includes('/allb/'+item.slug),'Missing landing return '+item.slug);}
 const result={routesPassed:manifest.routeCount,unknownRoute404Checks:5,landingWorkspacePairs:landingManifest.items.length,assetHTTPChecks:files.length,assetHashesMatchSource:true,toolTargetsVerified:true,browserInteractions:'UNTESTED',mobileVisualQA:'UNTESTED'};
 fs.writeFileSync('unified-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{server.kill();await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once('exit',resolve);setTimeout(()=>{server.kill('SIGKILL');resolve();},2000).unref();});}
