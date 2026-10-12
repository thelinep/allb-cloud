import assert from 'node:assert/strict';
import {chromium} from './helpers/dependencies.mjs';
import {totp} from '../packages/auth-core/http.mjs';
import {decryptDelivery} from '../packages/auth-core/lifecycle.mjs';
function decode(value){let n=0,bits=0,result=[];for(const c of value){n=(n<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);bits+=5;if(bits>=8){result.push((n>>>(bits-8))&255);bits-=8;}}return Buffer.from(result);}
/** Actual Next routes and UI. Fixture DB is used only as an explicit simulated delivery worker. */
export async function verifyAuthLifecycleBrowser({baseURL,account,db,key,keyVersion}){
 const browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});let checks=0;
 try{const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.goto(`${baseURL}/integration/security`);
 const post=(action,input)=>page.evaluate(async({action,input})=>{const r=await fetch(`/api/integration/auth/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});return {status:r.status,body:await r.json()};},{action,input});
 assert.equal((await post('login',{email:account.email,password:'incorrect'})).status,401);checks++;
 assert.equal((await post('login',{email:account.email,password:account.password})).status,200);checks++;
 const hostile=await context.request.post(`${baseURL}/api/integration/auth/logout`,{headers:{Origin:'https://hostile.example.test'},data:{}});assert.equal(hostile.status(),403);checks++;
 await page.goto(`${baseURL}/auth/callback?error=invalid_state&redirect=https://hostile.example.test`);assert.match(await page.getByRole('status').textContent(),/state could not be verified/);assert.equal(await page.locator('a[href*="hostile"]').count(),0);checks++;
 await page.goto(`${baseURL}/integration/security`);
 await page.reload();await page.getByRole('heading',{name:'Account security'}).waitFor();
 await page.getByRole('button',{name:'Rotate current session'}).click();await page.getByRole('status').filter({hasText:'Session rotated.'}).waitFor();checks++;
 await page.getByRole('button',{name:'Start TOTP enrollment'}).click();const secret=await page.locator('.auth-security code').first().textContent();assert.match(secret,/^[A-Z2-7]+$/);checks++;
 await page.getByLabel('Six-digit code',{exact:true}).fill(totp(decode(secret),Math.floor(Date.now()/30000)));
 await page.getByRole('button',{name:'Confirm authenticator'}).click();await page.getByRole('status').filter({hasText:'Authenticator enrolled.'}).waitFor();checks++;
 const recovery=await page.locator('.auth-security li code').first().textContent();await page.getByLabel('One-time recovery code').fill(recovery);await page.getByRole('button',{name:'Use recovery code'}).click();await page.getByRole('status').filter({hasText:'Request completed.'}).waitFor();checks++;
 assert.equal((await post('recover-mfa',{code:recovery})).status,401);checks++;
 await page.getByLabel('Organization ID').fill(account.organizationId);await page.getByLabel('Recipient email').fill(account.email);await page.getByRole('button',{name:'Queue invitation'}).click();await page.getByRole('status').filter({hasText:'Request completed.'}).waitFor();checks++;
 const invite=(await db.query(`SELECT * FROM auth_delivery_outbox WHERE kind='invitation' AND recipient=$1 ORDER BY created_at DESC LIMIT 1`,[account.email])).rows[0],payload=decryptDelivery(invite,{key,keyVersion});
 assert.equal((await post('accept-invite',{challenge:payload.token})).status,200);checks++;assert.equal((await post('accept-invite',{challenge:payload.token})).status,400);checks++;
 const known=await post('request-recovery',{email:account.email}),unknown=await post('request-recovery',{email:'unknown-lifecycle@example.test'});assert.equal(known.status,202);assert.equal(known.body.message,unknown.body.message);assert.equal(known.body.accepted,unknown.body.accepted);assert.equal(known.body.apiVersion,'1');assert.ok(known.body.requestId);checks++;
 const recoveryRow=(await db.query(`SELECT * FROM auth_delivery_outbox WHERE kind='recovery' AND recipient=$1 ORDER BY created_at DESC LIMIT 1`,[account.email])).rows[0],recoveryPayload=decryptDelivery(recoveryRow,{key,keyVersion});
 assert.equal((await post('complete-recovery',{challenge:recoveryPayload.token,password:'updated lifecycle password long enough'})).status,200);checks++;assert.equal(await page.evaluate(async()=> (await fetch('/api/integration/auth/session')).status),401);checks++;
 assert.equal((await post('complete-recovery',{challenge:recoveryPayload.token,password:'updated lifecycle password long enough'})).status,400);checks++;
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks++;
 await context.close();console.log(`PASS ${checks} actual Next lifecycle Chromium checks (mobile UI, enrollment/recovery/invitation/rotation)`);return checks;
 }finally{await browser.close();}
}
