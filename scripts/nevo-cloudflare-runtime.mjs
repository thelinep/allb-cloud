// Local HTTP smoke only; no deployment/provisioning. Exit 2 includes unstarted runtime.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'apps/maataa-ui-route-source');
if(!fs.existsSync(path.join(app,'.open-next/worker.js'))){console.log('Blocked: build the OpenNext Worker first.');process.exit(2);}
const bin=[app,root].map(base=>path.join(base,'node_modules/.bin/wrangler')).find(p=>fs.existsSync(p));
if(!bin){console.log('Blocked: Wrangler executable is not installed.');process.exit(2);}
const child=spawn(bin,['dev','--local','--config','wrangler.integration.jsonc','--ip','127.0.0.1','--port','8891'],{cwd:app,stdio:['ignore','pipe','pipe'],env:{...process.env,CI:'1',WRANGLER_SEND_METRICS:'false'}});
let logs='';const append=b=>{logs=(logs+b).slice(-10000);};child.stdout.on('data',append);child.stderr.on('data',append);child.on('error',e=>append(String(e)));
const checks=[];let started=false;
try{
 for(let n=0;n<45;n++){
  try{const r=await fetch('http://127.0.0.1:8891/allb',{signal:AbortSignal.timeout(2000)});if(r.status===200){started=true;break;}}catch{}
  if(child.exitCode!==null)break;
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 if(started){
  for(const [url,status,label] of [['/allb',200,'ALLB'],['/allb/nevo',200,'NEVO'],['/studio/themes',200,'Theme'],['/studio/branding',200,'Brand'],['/api/enterprise/kanban',200,null],['/allb/01-allb.webp',200,null],['/allb/unknown-worker-check',404,null]]){
   try{const response=await fetch('http://127.0.0.1:8891'+url,{signal:AbortSignal.timeout(5000)});const body=label?await response.text():'';checks.push({url,status:response.status,pass:response.status===status&&(!label||body.includes(label))});}
   catch(error){checks.push({url,pass:false,error:String(error)});}
  }
 }
 console.log(JSON.stringify({kind:'local-worker-http-smoke',externalWrites:false,runtimeStarted:started,checks,logs},null,2));
 process.exitCode=started&&checks.every(check=>check.pass)?0:2;
}finally{child.kill('SIGTERM');}
