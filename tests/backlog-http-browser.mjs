import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {provisionLocalFixture,fixtureId} from './helpers/nevo-local-fixture.mjs';
import {PGlite,chromium} from './helpers/dependencies.mjs';
import {hashPassword} from '../packages/auth-core/credentials.mjs';
import {verifyAuthLifecycleBrowser} from './auth-lifecycle-browser.mjs';
import {verifyApiAuthorityBrowser} from './api-authority-browser.mjs';

const root=process.cwd(),app=path.join(root,'apps/maataa-ui-route-source');
const require=createRequire(path.join(app,'package.json'));
const port=3198,baseURL=`http://localhost:${port}`,fixture=await provisionLocalFixture();
const assetDirectory=mkdtempSync(path.join(tmpdir(),'allb-asset-http-'));
const account={...fixture.tenants[0],userId:fixtureId(9999),email:'lifecycle-owner@example.test',password:'Isolated account lifecycle browser password'};
let server,browser,logs='';const checks=[];
async function start(){server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{cwd:app,env:{...process.env,...fixture.env,ALLB_AUTH_ORIGIN:baseURL,ALLB_LOCAL_ASSET_DIR:assetDirectory},stdio:['ignore','pipe','pipe']});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);for(let i=0;i<50;i++){try{if((await fetch(baseURL+'/integration/security',{signal:AbortSignal.timeout(2000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error(logs);}
async function stop(){if(!server)return;const child=server;server=null;await new Promise(resolve=>{child.once('exit',resolve);child.kill('SIGTERM');setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');resolve();},5000).unref();});}
try{
 const seed=new PGlite(fixture.directory);
 try{await seed.query(`INSERT INTO identities(id,issuer,subject) VALUES($1,'local-fixture',$2)`,[account.userId,account.email]);await seed.query('INSERT INTO memberships(organization_id,user_id,role) VALUES($1,$2,$3)',[account.organizationId,account.userId,'owner']);await seed.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,now())',[account.userId,account.email,await hashPassword(account.password)]);}finally{await seed.close();}
 await start();
 // A simulated delivery worker reads encrypted outbox entries only while the
 // server is stopped. PGlite never has concurrent process handles on one disk.
 const deliveryDb={query:async(sql,values)=>{await stop();const db=new PGlite(fixture.directory);try{return await db.query(sql,values);}finally{await db.close();await start();}}};
 checks.push({authLifecycle:await verifyAuthLifecycleBrowser({baseURL,account,db:deliveryDb,key:Buffer.from(fixture.env.ALLB_TOTP_KEY_HEX,'hex'),keyVersion:fixture.env.ALLB_TOTP_KEY_VERSION})});
 browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext(),page=await context.newPage();await page.goto(baseURL+'/integration/workflow',{waitUntil:'domcontentloaded'});
 const post=(url,body)=>page.evaluate(async({url,body})=>{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};},{url,body});
 const producer=fixture.actors.find(a=>a.nevoRole==='PRODUCER'&&a.organizationId===fixture.tenants[0].organizationId);
 assert.equal((await post('/api/integration/auth/login',{email:producer.email,password:producer.password})).status,200);
 const png=await require('sharp')({create:{width:80,height:60,channels:4,background:'#ddbbaa'}}).png().toBuffer();
 const uploaded=await post('/api/integration/assets',{action:'upload',...fixture.tenants[0],base64:png.toString('base64')});assert.equal(uploaded.status,200);assert.equal(uploaded.body.state,'validated');checks.push('Protected upload validates actual PNG and derivatives');
 const query=new URLSearchParams({...fixture.tenants[0],assetId:uploaded.body.assetId,revision:'1'});
 const download=await context.request.get(`${baseURL}/api/integration/assets?${query}`);assert.equal(download.status(),200);assert.deepEqual(await download.body(),png);checks.push('Authenticated exact-revision download integrity');
 const derivative=await context.request.get(`${baseURL}/api/integration/assets?${query}&derivative=thumbnail`);assert.equal(derivative.status(),200);assert.equal((await require('sharp')(await derivative.body()).metadata()).format,'webp');checks.push('Decoded WebP derivative served');
 const denied=await context.request.get(`${baseURL}/api/integration/assets?${new URLSearchParams({...fixture.tenants[1],assetId:uploaded.body.assetId,revision:'1'})}`);assert.equal(denied.status(),403);checks.push('Cross-tenant upload/download denied');
 const rejected=await post('/api/integration/assets',{action:'upload',...fixture.tenants[0],base64:Buffer.from('<svg onload="bad()"/>').toString('base64')});assert.equal(rejected.body.state,'rejected');checks.push('Unsupported active image quarantined');
 assert.equal((await post('/api/integration/operations',{action:'consent',...fixture.tenants[0],subject:'local-fixture',allowed:true})).status,200);
 const jobInput={action:'enqueue',...fixture.tenants[0],kind:'notification-preview',payload:{text:'Local only',subject:'local-fixture'},idempotencyKey:'http-browser-local-job'};
 const job=await post('/api/integration/operations',jobInput);assert.equal(job.status,200);const replay=await post('/api/integration/operations',jobInput);assert.equal(replay.body.result.id,job.body.result.id);checks.push('Durable queue idempotent enqueue');
 const tick=await post('/api/integration/operations',{action:'tick',...fixture.tenants[0]});assert.equal(tick.status,200);assert.equal(tick.body.result.result.mode,'local-preview');checks.push('Local preview delivery has explicit provenance');
 const headers=await fetch(baseURL+'/integration/security');assert.equal(headers.headers.get('x-content-type-options'),'nosniff');assert.equal(headers.headers.get('x-frame-options'),'SAMEORIGIN');checks.push('Actual response security headers');
 await context.close();await browser.close();browser=null;
 checks.push({apiAuthority:await verifyApiAuthorityBrowser({baseURL,accounts:fixture.actors})});
 mkdirSync(path.join(root,'artifacts/backlog-browser'),{recursive:true});writeFileSync(path.join(root,'artifacts/backlog-browser/results.json'),JSON.stringify({checks,mode:'actual-next-local-validation',mailDelivery:'simulated-encrypted-outbox-worker',externalProviders:false},null,2)+'\n');console.log(JSON.stringify({passed:true,checks}));
}catch(error){console.error(logs.slice(-3000));throw error;}finally{await browser?.close();await stop();fixture.cleanup();rmSync(assetDirectory,{recursive:true,force:true});}
