// Read-only readiness inventory; deliberately never deploys or reads secret values.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'apps/maataa-ui-route-source');
const exists=p=>fs.existsSync(path.join(app,p));
const pkg=JSON.parse(fs.readFileSync(path.join(app,'package.json'),'utf8'));
const deps={...pkg.dependencies,...pkg.devDependencies};
const checks=[
 {id:'application',status:'pass',detail:`Unified application found; Next.js ${deps.next}`},
 {id:'adapter',status:deps['@opennextjs/cloudflare']?'present':'blocked',detail:'An installed adapter is required; package presence alone does not verify runtime compatibility.'},
 {id:'wrangler',status:deps.wrangler?'present':'blocked',detail:'Unified app must pin Wrangler and use its own configuration.'},
 {id:'configuration',status:['wrangler.jsonc','wrangler.json','wrangler.toml'].some(exists)?'present':'blocked',detail:'Archived Hemant configuration is not the unified app deployment configuration.'},
 {id:'worker-build',status:exists('.open-next/worker.js')?'present':'blocked',detail:'Worker bundle must be built and tested in workerd; next build alone is insufficient.'},
 {id:'runtime',status:'untested',detail:'This inventory does not execute workerd or make a Cloudflare API request.'},
 {id:'auth-cost',status:'unverified',detail:'Node scrypt N=2^17/r=8 exceeds 128 MiB before overhead; benchmark or isolate credential verification before selecting Workers hosting for Auth.'},
 {id:'database',status:'unverified',detail:'PGlite migration tests are development evidence, not a durable networked production database.'},
 {id:'domain',status:'user-confirmed',detail:'nevoevents.in is already configured in Cloudflare; account, zone and route access have not been inspected.'},
 {id:'delivery',status:'unverified',detail:'Invitation/recovery outbound delivery provider and verified sender remain to be tested.'}
];
console.log(JSON.stringify({kind:'cloudflare-readiness-inventory',compatibilityVerified:false,externalWrites:false,checks},null,2));
process.exitCode=checks.some(c=>c.status==='blocked')?2:0;
