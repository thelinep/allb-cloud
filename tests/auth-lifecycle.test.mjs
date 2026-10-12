import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {PGlite} from './helpers/dependencies.mjs';
import {hashPassword} from '../packages/auth-core/credentials.mjs';
import {login,totp,verifyTotp} from '../packages/auth-core/http.mjs';
import {readSession} from '../packages/auth-core/sessions.mjs';
import {sessionList,sessionRotate,sessionRevoke,beginEnrollment,confirmEnrollment,recoverMfa,revokeFactor,requestRecovery,completeRecovery,createInvitation,acceptInvitation,decryptDelivery,rotateEncryptionKey} from '../packages/auth-core/lifecycle.mjs';
const db=new PGlite(),now=new Date(),options={now,key:randomBytes(32),keyVersion:'v1'},id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},reject=async(fn,code)=>{await assert.rejects(fn,e=>e.code===code);checks++;};
function unbase32(value){let v=0,b=0,output=[];for(const c of value){v=(v<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);b+=5;if(b>=8){output.push((v>>>(b-8))&255);b-=8;}}return Buffer.from(output);}
try{
for(const n of ['001_foundation','002_own_auth','005_auth_http','006_auth_lifecycle'])await db.exec(fs.readFileSync(`packages/enterprise-db/migrations/${n}.sql`,'utf8'));
const password='correct password long enough',hash=await hashPassword(password);
for(let n=1;n<=3;n++){await db.query(`INSERT INTO identities(id,issuer,subject) VALUES($1,'maataa',$2)`,[id(n),String(n)]);await db.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,$4)',[id(n),`u${n}@example.test`,hash,now]);}
await db.query(`INSERT INTO organizations(id,slug,name) VALUES($1,'auth-test','Auth Test')`,[id(20)]);await db.query(`INSERT INTO memberships VALUES($1,$2,'owner')`,[id(20),id(1)]);
const s=await login(db,{email:'u1@example.test',password},{now}),other=await login(db,{email:'u2@example.test',password},{now});
let sessions=await sessionList(db,s.token,{now});eq(sessions.sessions.length,1);eq(sessions.sessions[0].current,true);eq(Object.hasOwn(sessions.sessions[0],'token_hash'),false);
await reject(()=>sessionRevoke(db,other.token,{id:sessions.sessions[0].id},{now}),'NOT_FOUND');
const rotated=await sessionRotate(db,s.token,{now});eq(await readSession(db,s.token,{now}),null);eq((await readSession(db,rotated.token,{now})).user_id,id(1));
const enrolled=await beginEnrollment(db,rotated.token,options),secret=unbase32(enrolled.secret),counter=Math.floor(now.getTime()/30000);
await reject(()=>confirmEnrollment(db,other.token,{factorId:enrolled.factorId,code:totp(secret,counter)},options),'INVALID_MFA');
const confirmation=await confirmEnrollment(db,rotated.token,{factorId:enrolled.factorId,code:totp(secret,counter)},options);eq(confirmation.recoveryCodes.length,10);eq(confirmation.enrolled,true);
await reject(()=>verifyTotp(db,rotated.token,totp(secret,counter),options),'INVALID_MFA');
eq((await recoverMfa(db,rotated.token,{code:confirmation.recoveryCodes[0]},{now})).verified,true);
await reject(()=>recoverMfa(db,rotated.token,{code:confirmation.recoveryCodes[0]},{now}),'INVALID_MFA');
const delivery=await createInvitation(db,rotated.token,{organizationId:id(20),email:'u2@example.test',role:'editor'},options);eq(delivery.queued,true);eq(Object.hasOwn(delivery,'token'),false);
let outbox=await db.query(`SELECT * FROM auth_delivery_outbox WHERE kind='invitation'`),payload=decryptDelivery(outbox.rows[0],options);eq(JSON.stringify(outbox.rows[0]).includes(payload.token),false);
await reject(()=>acceptInvitation(db,rotated.token,{challenge:payload.token},{now}),'INVALID_CHALLENGE');
eq((await acceptInvitation(db,other.token,{challenge:payload.token},{now})).accepted,true);
await reject(()=>acceptInvitation(db,other.token,{challenge:payload.token},{now}),'INVALID_CHALLENGE');
eq((await db.query('SELECT role FROM memberships WHERE organization_id=$1 AND user_id=$2',[id(20),id(2)])).rows[0].role,'editor');
await reject(()=>createInvitation(db,other.token,{organizationId:id(20),email:'u3@example.test',role:'viewer'},options),'MFA_REQUIRED');
eq(await requestRecovery(db,{email:'u3@example.test'},options),await requestRecovery(db,{email:'missing@example.test'},options));
outbox=await db.query(`SELECT * FROM auth_delivery_outbox WHERE kind='recovery'`);eq(outbox.rows.length,1);payload=decryptDelivery(outbox.rows[0],options);
const third=await login(db,{email:'u3@example.test',password},{now});eq((await completeRecovery(db,{challenge:payload.token,password:'a new secure long password'},{now})).recovered,true);eq(await readSession(db,third.token,{now}),null);
await reject(()=>completeRecovery(db,{challenge:payload.token,password:'a new secure long password'},{now}),'INVALID_CHALLENGE');
await reject(()=>login(db,{email:'u3@example.test',password},{now}),'INVALID_CREDENTIALS');eq(Boolean(await login(db,{email:'u3@example.test',password:'a new secure long password'},{now})),true);
const nextOptions={...options,key:randomBytes(32),keyVersion:'v2'};const keyRotation=await rotateEncryptionKey(db,options,nextOptions,{now});eq(keyRotation.factors,1);eq((await db.query('SELECT encryption_key_version FROM auth_mfa_factors WHERE id=$1',[enrolled.factorId])).rows[0].encryption_key_version,'v2');
eq((await db.query('SELECT count(*)::int AS count FROM auth_security_events')).rows[0].count>=7,true);
const expiredSession=await login(db,{email:'u2@example.test',password},{now});await reject(()=>sessionList(db,expiredSession.token,{now:new Date(now.getTime()+86400000)}),'UNAUTHENTICATED');await db.query('UPDATE auth_accounts SET disabled_at=$2 WHERE user_id=$1',[id(2),now]);await reject(()=>sessionList(db,other.token,{now}),'UNAUTHENTICATED');await db.query('UPDATE auth_accounts SET disabled_at=NULL WHERE user_id=$1',[id(2)]);
eq((await revokeFactor(db,rotated.token,{factorId:enrolled.factorId},{now})).revoked,true);eq(await readSession(db,rotated.token,{now}),null);
const all=await sessionRevoke(db,other.token,{all:true},{now});eq(all.all,true);eq(await readSession(db,other.token,{now}),null);
console.log(`PASS ${checks} auth lifecycle checks (encrypted enrollment/outbox, single-use recovery, rotation, revocation, invitation authority)`);
}finally{await db.close();}
