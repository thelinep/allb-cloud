import assert from 'node:assert/strict';
import {chromium} from './helpers/dependencies.mjs';
import {totp} from '../packages/auth-core/http.mjs';
/** Actual Next HTTP/browser checks. Use an isolated fixture: this revokes its producer. */
export async function verifyApiAuthorityBrowser({baseURL,accounts}){
 const browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});let checks=0;const contexts=[];
 try{
  const producer=accounts.find(a=>a.nevoRole==='PRODUCER'),admin=accounts.find(a=>a.nevoRole==='ADMIN'&&a.organizationId===producer.organizationId),scope={organizationId:producer.organizationId,workspaceId:producer.workspaceId};
  async function session(account){const context=await browser.newContext(),page=await context.newPage();contexts.push(context);await page.goto(baseURL+'/integration/nevo');const call=(path,body,headers={},method='POST')=>page.evaluate(async({path,body,headers,method})=>{const r=await fetch(path,{method,headers:{'Content-Type':'application/json',...headers},...(method==='GET'?{}:{body:JSON.stringify(body)})});return{status:r.status,headers:Object.fromEntries(r.headers),body:await r.json()};},{path,body,headers,method});assert.equal((await call('/api/integration/auth/login',{email:account.email,password:account.password})).status,200);checks++;return{page,call};}
  const p=await session(producer),a=await session(admin);
  const code=totp(Buffer.from(admin.totpSecretHex,'hex'),Math.floor(Date.now()/30000));let mfa=await a.call('/api/integration/auth/mfa',{code});if(mfa.status===401){await new Promise(r=>setTimeout(r,31000-Date.now()%30000));mfa=await a.call('/api/integration/auth/mfa',{code:totp(Buffer.from(admin.totpSecretHex,'hex'),Math.floor(Date.now()/30000))});}assert.equal(mfa.status,200);checks++;
  assert.equal((await p.call(`/api/integration/nevo/context?${new URLSearchParams(scope)}&role=admin`,null,{},'GET')).status,400);checks++;
  assert.equal((await p.call(`/api/integration/nevo/context?${new URLSearchParams(scope)}`,null,{'X-API-Version':'2'},'GET')).status,426);checks++;
  const inquiry={...scope,title:'API contract verified event',requestedDate:'2026-11-15',guestCount:100};
  assert.equal((await p.call('/api/integration/nevo/events',{...inquiry,role:'owner'})).status,400);checks++;
  const first=await p.call('/api/integration/nevo/events',inquiry,{'Idempotency-Key':'contract-inquiry-0001','X-Request-ID':'contract-request-0001'});assert.equal(first.status,201);assert.equal(first.headers.etag,'"rev-1"');assert.equal(first.body.apiVersion,'1');assert.equal(first.body.requestId,'contract-request-0001');checks++;
  const replay=await p.call('/api/integration/nevo/events',inquiry,{'Idempotency-Key':'contract-inquiry-0001'});assert.equal(replay.status,201);assert.equal(replay.body.event.id,first.body.event.id);checks++;
  assert.equal((await p.call('/api/integration/nevo/events',{...inquiry,title:'Different content'},{'Idempotency-Key':'contract-inquiry-0001'})).status,409);checks++;
  const query=new URLSearchParams(scope);let list=await p.call(`/api/integration/nevo/events?${query}&limit=1&offset=0`,null,{},'GET');assert.equal(list.status,200);assert.equal(list.body.events.length,1);checks++;
  assert.equal((await p.call(`/api/integration/nevo/events?${query}&limit=101`,null,{},'GET')).status,400);checks++;
  const scene={id:'contract-scene',schemaVersion:1,revision:0,units:'m',coordinateSystem:{kind:'local',axes:'Y-up',origin:[0,0,0]},nodes:[{id:'stage',name:'Stage',position:[0,0,0],rotation:[0,0,0],scale:[3,1,2],visible:true,color:'#bca36f'}]},command={...scope,expectedRevision:1,command:{type:'layout',payload:{venueId:'contract-venue',venueVersion:'1',scene,expectedSceneRevision:0}}},path=`/api/integration/nevo/events/${first.body.event.id}/commercial`;
  assert.equal((await p.call(path,command,{'If-Match':'"rev-2"','Idempotency-Key':'contract-layout-0001'})).status,412);checks++;
  const layout=await p.call(path,command,{'If-Match':'"rev-1"','Idempotency-Key':'contract-layout-0001'});assert.equal(layout.status,200);assert.equal(layout.headers.etag,'"rev-2"');checks++;
  const layoutReplay=await p.call(path,command,{'If-Match':'"rev-1"','Idempotency-Key':'contract-layout-0001'});assert.equal(layoutReplay.status,200);assert.equal(layoutReplay.body.event.revision,2);checks++;
  assert.equal((await p.call(path,command,{'If-Match':'"rev-1"','Idempotency-Key':'contract-layout-0002'})).status,409);checks++;
  assert.equal((await a.call('/api/integration/nevo/membership',{...scope,userId:producer.userId,role:null},{'Idempotency-Key':'membership-revoke-0001'})).status,200);checks++;
  assert.equal((await a.call('/api/integration/nevo/membership',{...scope,userId:producer.userId,role:null},{'Idempotency-Key':'membership-revoke-0001'})).status,200);checks++;
  assert.equal((await p.call(`/api/integration/nevo/context?${query}`,null,{},'GET')).status,403);checks++;
  assert.equal((await p.call('/api/integration/nevo/events',inquiry,{'Idempotency-Key':'contract-inquiry-0001'})).status,403);checks++;
  // Failed business commands still consume committed rate counts.
  let limited=false;for(let n=0;n<61;n++){const r=await a.call('/api/integration/nevo/events',{...scope,title:'Invalid calendar date',guestCount:100,requestedDate:'2026-02-30'});if(r.status===429){limited=true;break;}assert.equal(r.status,400);}assert.equal(limited,true);checks++;
  console.log(`PASS ${checks} actual Next browser API authority/contract checks`);return{checks,eventId:first.body.event.id};
 }finally{for(const context of contexts)await context.close();await browser.close();}
}
