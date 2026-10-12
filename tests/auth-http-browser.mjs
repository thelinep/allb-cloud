import assert from 'node:assert/strict';
import {chromium} from './helpers/dependencies.mjs';
import {totp} from '../packages/auth-core/http.mjs';
/** Runs against the actual Next auth routes, not a replacement HTTP fixture.
 * Provision confirmed factors and two tenant accounts before calling. */
export async function verifyAuthBrowser({baseURL,accounts}){
 const browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});let checks=0;
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const contexts=[];
   try{
    for(const account of accounts.slice(0,2)){
     const context=await browser.newContext({viewport}),page=await context.newPage();contexts.push(context);
     await page.goto(`${baseURL}/integration/nevo`);
     const request=(path,body)=>page.evaluate(async({path,body})=>{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};},{path,body});
     let result=await request('/api/integration/auth/login',{email:account.email,password:'incorrect-password'});assert.equal(result.status,401);checks++;
     result=await request('/api/integration/auth/login',{email:account.email,password:account.password});assert.equal(result.status,200);checks++;
     const cookie=(await context.cookies()).find(c=>c.name==='__Host-maataa-session');assert.ok(cookie?.secure&&cookie.httpOnly);checks++;
     const session=await page.evaluate(async()=>{const r=await fetch('/api/integration/auth/session');return {status:r.status,body:await r.json()};});assert.equal(session.status,200);assert.equal(session.body.userId,account.userId);assert.ok(session.body.workspaces.every(w=>w.organizationId===account.organizationId));checks++;
     const own=await page.evaluate(async scope=>{const r=await fetch(`/api/integration/nevo/context?${new URLSearchParams(scope)}`);return {status:r.status,body:await r.json()};},{organizationId:account.organizationId,workspaceId:account.workspaceId});
     if(account.totpSecretHex){
      assert.equal(own.status,403);checks++;
      if(viewport.width===1440){
      const code=totp(Buffer.from(account.totpSecretHex,'hex'),Math.floor(Date.now()/30000));result=await request('/api/integration/auth/mfa',{code});assert.equal(result.status,200);checks++;
      result=await request('/api/integration/auth/mfa',{code});assert.equal(result.status,401);checks++;
      }
     }else{assert.equal(own.status,200);checks++;}
     const other=accounts.find(a=>a.organizationId!==account.organizationId);
     const foreign=await page.evaluate(async scope=>{const r=await fetch(`/api/integration/nevo/context?${new URLSearchParams(scope)}`,{headers:{'x-role':'SUPER_ADMIN'}});return r.status;},{organizationId:other.organizationId,workspaceId:other.workspaceId});assert.equal(foreign,403);checks++;
     result=await request('/api/integration/auth/logout',{});assert.equal(result.status,200);checks++;
     assert.equal(await page.evaluate(async()=> (await fetch('/api/integration/auth/session')).status),401);checks++;
    }
   }finally{for(const context of contexts)await context.close();}
  }
  console.log(`PASS ${checks} actual Next auth desktop/mobile Chromium checks`);return checks;
 }finally{await browser.close();}
}
