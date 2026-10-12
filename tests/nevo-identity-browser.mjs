/** Isolated test harness, NOT a production login/API implementation. */
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {PGlite} from './helpers/dependencies.mjs';
import {hashPassword,verifyAccountCredentials} from '../packages/auth-core/credentials.mjs';
import {issueSession,revokeSession} from '../packages/auth-core/sessions.mjs';
import {sessionCookie,SESSION_COOKIE} from '../packages/auth-core/policy.mjs';
import {withNevoIdentity} from '../packages/nevo-identity-adapter/adapter.mjs';
const require=createRequire(new URL('../apps/maataa-ui-route-source/package.json',import.meta.url));
const {chromium}=require('playwright');
const db=new PGlite(),id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let server,browser,origin,checks=0;
const password='Isolated fixture password 2026';
const respond=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const tokenFrom=req=>req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1);
try {
 for(const name of ['001_foundation','002_own_auth'])await db.exec(fs.readFileSync(`packages/enterprise-db/migrations/${name}.sql`,'utf8'));
 await db.exec('CREATE TABLE "Organization"(id text PRIMARY KEY);CREATE TABLE "User"(id text PRIMARY KEY,role text,status text,"organizationId" text,"emailVerifiedAt" timestamptz);');
 await db.exec(fs.readFileSync('packages/nevo-identity-adapter/schema.sql','utf8'));
 await db.exec('CREATE TABLE fixture_records(organization_id uuid,workspace_id uuid,value text);');
 const hash=await hashPassword(password);
 for(const n of [1,2]) {
  await db.query('INSERT INTO organizations(id,slug,name) VALUES($1,$2,$3)',[id(n),`tenant-${n}`,`Tenant ${n}`]);
  await db.query('INSERT INTO workspaces VALUES($1,$2,$3,$4)',[id(n),id(n+10),'main','Main']);
  await db.query('INSERT INTO identities(id,issuer,subject) VALUES($1,$2,$3)',[id(n+20),'maataa',`user-${n}`]);
  await db.query('INSERT INTO memberships VALUES($1,$2,$3)',[id(n),id(n+20),'editor']);
  await db.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,now())',[id(n+20),`user${n}@example.test`,hash]);
  await db.query('INSERT INTO "Organization" VALUES($1)',[`cuid-org-${n}`]);
  await db.query('INSERT INTO "User" VALUES($1,$2,$3,$4,now())',[`cuid-user-${n}`,'PRODUCER','ACTIVE',`cuid-org-${n}`]);
  await db.query('INSERT INTO nevo_identity_links VALUES($1,$2,$3,$4,$5,NULL)',[id(n+20),id(n),id(n+10),`cuid-user-${n}`,`cuid-org-${n}`]);
  await db.query('INSERT INTO fixture_records VALUES($1,$2,$3)',[id(n),id(n+10),`private tenant ${n}`]);
 }
 server=http.createServer(async(req,res)=>{
  try {
   const url=new URL(req.url,origin);
   if(req.method==='GET'&&url.pathname==='/') {
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Isolated identity fixture</title><main><h1>Test harness — no production service</h1><form><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><button>Sign in</button></form><output aria-live="polite"></output></main><script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const r=await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});document.querySelector('output').textContent=r.ok?'Signed in':'Rejected'}</script></html>`);return;
   }
   if(req.method==='POST') {
    if(req.headers.origin!==origin)return respond(res,403,{error:'ORIGIN_DENIED'});
    if(req.headers['content-type']!=='application/json')return respond(res,415,{error:'INVALID_CONTENT_TYPE'});
   }
   if(req.method==='POST'&&url.pathname==='/login') {
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2048)return respond(res,413,{error:'TOO_LARGE'});}
    let body;try{body=JSON.parse(raw);}catch{return respond(res,400,{error:'INVALID_JSON'});}
    if(typeof body.email!=='string'||typeof body.password!=='string')return respond(res,400,{error:'INVALID_INPUT'});
    const verified=await verifyAccountCredentials(db,body.email,body.password);
    if(!verified)return respond(res,401,{error:'UNAUTHENTICATED'});
    const session=await issueSession(db,verified.userId,{credentialVersion:verified.credentialVersion});
    if(!session)return respond(res,401,{error:'UNAUTHENTICATED'});
    res.setHeader('Set-Cookie',sessionCookie(session.token,{expiresAt:session.expiresAt}));return respond(res,200,{ok:true});
   }
   if(req.method==='GET'&&url.pathname==='/record') {
    const scope={organizationId:url.searchParams.get('organizationId'),workspaceId:url.searchParams.get('workspaceId')};
    const record=await withNevoIdentity(db,tokenFrom(req),scope,'design.read',async(tx,context)=>(await tx.query('SELECT value FROM fixture_records WHERE organization_id=$1 AND workspace_id=$2',[context.organizationId,context.workspaceId])).rows[0]);
    return respond(res,200,record);
   }
   if(req.method==='POST'&&url.pathname==='/logout'){await revokeSession(db,tokenFrom(req));return respond(res,200,{ok:true});}
   respond(res,404,{error:'NOT_FOUND'});
  }catch(error){respond(res,error.status??500,{error:error.code??'INTERNAL_ERROR'});}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH??'/workspace/scratch/80aa72c897e9/ui-browser-runtime/chromium',headless:true,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']});
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport});const page=await context.newPage();await page.goto(origin);
  await page.getByLabel('Email').fill('user1@example.test');await page.getByLabel('Password').fill(password);await page.getByRole('button',{name:'Sign in'}).click();await page.waitForFunction(()=>document.querySelector('output').textContent==='Signed in');checks++;
  const requestRecord=n=>page.evaluate(async ({origin,organizationId,workspaceId})=>{const r=await fetch(`${origin}/record?organizationId=${organizationId}&workspaceId=${workspaceId}`,{headers:{'x-role':'SUPER_ADMIN','x-user-id':'forged'}});return {status:r.status,body:await r.json()};},{origin,organizationId:id(n),workspaceId:id(n+10)});
  assert.deepEqual(await requestRecord(1),{status:200,body:{value:'private tenant 1'}});checks++;
  assert.equal((await requestRecord(2)).status,403);checks++;
  const cookie=(await context.cookies()).find(c=>c.name===SESSION_COOKIE);assert.ok(cookie?.httpOnly&&cookie.secure&&cookie.sameSite==='Lax');checks++;
  const deniedOrigin=await context.request.post(`${origin}/logout`,{headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},data:{}});assert.equal(deniedOrigin.status(),403);checks++;
  const logout=await page.evaluate(async()=>{const r=await fetch('/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});return r.status;});assert.equal(logout,200);checks++;
  assert.equal((await requestRecord(1)).status,401);checks++;
  await page.getByLabel('Email').fill('user2@example.test');
  const secondLogin=page.waitForResponse(r=>r.url()===origin+'/login'&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Sign in'}).click();assert.equal((await secondLogin).status(),200);
  assert.deepEqual(await requestRecord(2),{status:200,body:{value:'private tenant 2'}});checks++;
  assert.equal((await requestRecord(1)).status,403);checks++;
  await context.close();
 }
 console.log(`PASS ${checks} authenticated desktop/mobile-emulated Chromium harness checks; production app adoption and MFA ceremony remain untested`);
} finally {await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await db.close();}
