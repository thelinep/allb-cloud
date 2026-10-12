import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCipheriv,randomBytes} from 'node:crypto';
import {PGlite} from './helpers/dependencies.mjs';
import {hashPassword} from '../packages/auth-core/credentials.mjs';
import {readSession} from '../packages/auth-core/sessions.mjs';
import {login,logout,throttle,verifyTotp,totp} from '../packages/auth-core/http.mjs';
const db=new PGlite(),id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,now=new Date('2026-10-10T00:00:00Z');let checks=0;
const reject=async(fn,code)=>{await assert.rejects(fn,e=>e.code===code);checks++;};
try{
 for(const n of ['001_foundation','002_own_auth','005_auth_http'])await db.exec(fs.readFileSync(`packages/enterprise-db/migrations/${n}.sql`,'utf8'));
 const password='correct password long enough';await db.query(`INSERT INTO identities VALUES($1,'maataa','test',$2)`,[id(1),now]);await db.query(`INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,'a@example.test',$2,$3)`,[id(1),await hashPassword(password),now]);
 await reject(()=>login(db,{email:'a@example.test',password:'wrong'},{now}),'INVALID_CREDENTIALS');
 const s=await login(db,{email:'a@example.test',password},{now});assert.equal((await readSession(db,s.token,{now})).user_id,id(1));checks++;
 assert.equal(totp(Buffer.from('12345678901234567890'),1),'287082');checks++;
 const key=randomBytes(32),secret=randomBytes(20),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(`allb-totp:${id(2)}:${id(1)}`));const ciphertext=Buffer.concat([cipher.update(secret),cipher.final()]);
 const envelope=Buffer.from(JSON.stringify({iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')}));await db.query(`INSERT INTO auth_mfa_factors(id,user_id,kind,encrypted_secret,encryption_key_version,confirmed_at) VALUES($1,$2,'totp',$3,'v1',$4)`,[id(2),id(1),envelope,now]);
 await reject(()=>verifyTotp(db,s.token,'abc123',{key,keyVersion:'v1',now}),'INVALID_REQUEST');
 const code=totp(secret,Math.floor(now.getTime()/30000));assert.equal((await verifyTotp(db,s.token,code,{key,keyVersion:'v1',now})).verified,true);checks++;
 await reject(()=>verifyTotp(db,s.token,code,{key,keyVersion:'v1',now}),'INVALID_MFA');
 assert.ok((await readSession(db,s.token,{now})).mfa_verified_at);checks++;
 for(let i=0;i<5;i++)await throttle(db,'test',{now});await reject(()=>throttle(db,'test',{now}),'RATE_LIMITED');await throttle(db,'test',{now:new Date(now.getTime()+900000)});checks++;
 await logout(db,s.token);assert.equal(await readSession(db,s.token,{now}),null);checks++;
 console.log(`PASS ${checks} real auth HTTP service checks`);
}finally{await db.close();}
