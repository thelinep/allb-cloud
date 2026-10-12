// Read-only local inventory: no account calls, provisioning or secret reads.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'apps/maataa-ui-route-source');
const pkg=JSON.parse(fs.readFileSync(path.join(app,'package.json'),'utf8'));
const deps={...pkg.dependencies,...pkg.devDependencies};
const configPath=path.join(app,'wrangler.integration.jsonc');
const config=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath,'utf8')):{};
const checks=[];
const add=(id,present,detail)=>checks.push({id,status:present?'present':'blocked',detail});
add('application',true,`Unified application; Next.js ${deps.next}`);
add('adapter',!!deps['@opennextjs/cloudflare'],'Adapter dependency presence is not runtime qualification.');
add('wrangler',!!deps.wrangler,'Wrangler dependency presence is not a release pass.');
add('configuration',fs.existsSync(configPath),'Local integration configuration; no production account inspected.');
add('worker-build',fs.existsSync(path.join(app,'.open-next/worker.js')),'Existing bundle may be stale; fresh Worker build and HTTP checks required.');
add('d1-binding',!!config.d1_databases?.length,'D1 target selected; native schema, transaction and tenant tests required.');
add('private-r2-binding',!!config.r2_buckets?.length,'Private R2 target selected; access expiry and immutable asset tests required.');
add('queue-bindings',!!config.queues?.producers?.length&&!!config.queues?.consumers?.length,'Producer and consumer plus outbox/retry tests required.');
add('scheduled-jobs',!!config.triggers?.crons?.length,'Cron target selected; schedules and policy approval absent.');
for(const [id,detail] of [
 ['workerd-runtime','Public UI passes 552 local Chromium checks; full authenticated D1 backend/staging qualification remains open.'],
 ['auth-cost','Unchanged scrypt succeeds in local workerd probe; deployed CPU/memory budget and full identity lifecycle remain unverified.'],
 ['database-port','PostgreSQL SQL and callback transaction semantics require a native D1 implementation.'],
 ['delivery','Workers-compatible notification delivery and provider reconciliation unverified.'],
 ['recovery','D1 Time Travel/export and R2 recovery not tested.'],
 ['staging-certification','No authorized staging acceptance, SLO, manual AT or visual approval.'],
 ['rollout-authorization','Deployment, DNS and external configuration remain unauthorized.']
])add(id,false,detail);
console.log(JSON.stringify({kind:'cloudflare-only-readiness',target:{runtime:'Workers/OpenNext',database:'D1',assets:'private R2',jobs:'Queues'},compatibilityVerified:false,productionReady:false,externalWrites:false,checks},null,2));
process.exitCode=2;
