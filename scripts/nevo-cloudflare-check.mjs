// Local-only inventory/build gate. No deploy, provisioning or credential reads.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'apps/maataa-ui-route-source');
const pkg=JSON.parse(fs.readFileSync(path.join(app,'package.json'),'utf8'));
const deps={...pkg.dependencies,...pkg.devDependencies};
const config=JSON.parse(fs.readFileSync(path.join(app,'wrangler.integration.jsonc'),'utf8'));
const exists=p=>fs.existsSync(path.join(app,p));
const installed=p=>[app,root].some(base=>fs.existsSync(path.join(base,'node_modules',p,'package.json')));
const executable=name=>[app,root].map(base=>path.join(base,'node_modules/.bin',name)).find(p=>fs.existsSync(p));
const checks=[];
const add=(id,pass,detail)=>checks.push({id,status:pass?'pass':'blocked',detail});
add('local-only-config',config.workers_dev===false&&config.preview_urls===false&&!config.routes&&!config.account_id&&!config.hyperdrive&&!config.r2_buckets&&!config.queues,'No domain routes or remote binding identifiers in integration configuration.');
add('worker-entry',config.main==='.open-next/worker.js'&&config.assets?.binding==='ASSETS'&&config.compatibility_flags?.includes('nodejs_compat'),'OpenNext generated Worker entry with assets and Node compatibility.');
add('adapter-installed',!!deps['@opennextjs/cloudflare']&&installed('@opennextjs/cloudflare'),'Pinned adapter must be installed in the unified application.');
add('wrangler-installed',!!deps.wrangler&&installed('wrangler'),'Pinned Wrangler must be installed in the unified application.');
if(process.argv.includes('--build')){
 const bin=executable('opennextjs-cloudflare');
 if(bin){
  const args=['build','--config','wrangler.integration.jsonc'];
  if(process.argv.includes('--skip-next-build'))throw Error('Worker decoder boundary requires a fresh ALLB_BUILD_TARGET=worker Next build; skipping is unsafe');
  const result=spawnSync(bin,args,{cwd:app,stdio:'inherit',env:{...process.env,CI:'1',ALLB_BUILD_TARGET:'worker'}});
  add('adapter-build',result.status===0,'Actual adapter build exit status; does not prove deployed runtime compatibility.');
 }else add('adapter-build',false,'Adapter executable absent; build not run.');
}
add('worker-output',exists('.open-next/worker.js')&&(!process.argv.includes('--build')||checks.some(c=>c.id==='adapter-build'&&c.status==='pass')),'Generated Worker bundle must exist; Next.js output alone is insufficient.');
const kanban=fs.readFileSync(path.join(app,'app/api/enterprise/kanban/route.ts'),'utf8');
add('kanban-runtime',kanban.includes("source:'compiled-snapshot'")&&kanban.includes('if(!registryDirectory)')&&kanban.includes('ENTERPRISE_REGISTRY_DIR'),'Default serves compiled snapshot; repository file reads require explicit local Node registry configuration. Do not set ENTERPRISE_REGISTRY_DIR on Workers.');
add('auth-memory',false,'Unchanged scrypt succeeds in local workerd probe; deployed CPU/memory and integrated lifecycle remain unverified. Do not weaken hashing.');
add('durable-bindings',false,'No durable database, R2, Queue or verified mail bindings provisioned/tested. NEVO deployment identifiers intentionally not copied.');
add('workerd-runtime',false,'Public rendering passes local Worker browser checks; authenticated D1 application cutover and staging qualification remain open.');
console.log(JSON.stringify({kind:'allb-nevo-cloudflare-gates',sourceRef:'thelinep/nevoeos@f50af9d',externalWrites:false,compatibilityVerified:false,checks},null,2));
process.exitCode=checks.some(c=>c.status==='blocked')?2:0;
