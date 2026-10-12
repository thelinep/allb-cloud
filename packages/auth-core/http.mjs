import {createHash,createHmac,createDecipheriv,timingSafeEqual} from 'node:crypto';
import {verifyAccountCredentials,sessionTokenHash} from './credentials.mjs';
import {issueSession,readSession,revokeSession} from './sessions.mjs';
export class AuthHttpError extends Error {constructor(code,status){super(code);this.code=code;this.status=status;}}
export async function throttle(db,key,{now=new Date(),limit=5}={}){
 const hash=createHash('sha256').update(key).digest('hex');
 const r=await db.query(`INSERT INTO auth_attempt_windows VALUES($1,$2,1) ON CONFLICT(key_hash) DO UPDATE SET
 attempts=CASE WHEN auth_attempt_windows.window_started_at <= $2::timestamptz-interval '15 minutes' THEN 1 ELSE auth_attempt_windows.attempts+1 END,
 window_started_at=CASE WHEN auth_attempt_windows.window_started_at <= $2::timestamptz-interval '15 minutes' THEN $2 ELSE auth_attempt_windows.window_started_at END RETURNING attempts`,[hash,now]);
 if(r.rows[0].attempts>limit)throw new AuthHttpError('RATE_LIMITED',429);
}
export async function login(db,{email,password},{now=new Date()}={}){
 if(typeof email!=='string'||email.length>254||typeof password!=='string'||Buffer.byteLength(password)>1024)throw new AuthHttpError('INVALID_REQUEST',400);
 await throttle(db,`login:${email.trim().toLowerCase()}`,{now});
 const account=await verifyAccountCredentials(db,email,password);
 if(!account)throw new AuthHttpError('INVALID_CREDENTIALS',401);
 const session=await issueSession(db,account.userId,{credentialVersion:account.credentialVersion,now});
 if(!session)throw new AuthHttpError('INVALID_CREDENTIALS',401);
 return session;
}
// TOTP is RFC 6238 SHA-1, six digits and 30s periods. Enrolled secrets must be
// server provisioned AES-256-GCM envelopes; this endpoint does not enroll factors.
export function totp(secret,counter){const bytes=Buffer.alloc(8);bytes.writeBigUInt64BE(BigInt(counter));const h=createHmac('sha1',secret).update(bytes).digest(),i=h[19]&15;return String((h.readUInt32BE(i)&0x7fffffff)%1000000).padStart(6,'0');}
/** @param {{key?: Buffer,keyVersion?: string,now?: Date}} options */
export async function verifyTotp(db,token,code,options={}){
 const {key,keyVersion,now=new Date()}=options;
 const session=await readSession(db,token,{now});if(!session)throw new AuthHttpError('UNAUTHENTICATED',401);
 if(typeof code!=='string'||!/^\d{6}$/.test(code))throw new AuthHttpError('INVALID_REQUEST',400);
 await throttle(db,`mfa:${session.user_id}`,{now});
 if(!Buffer.isBuffer(key)||key.length!==32||!keyVersion)throw new AuthHttpError('MFA_UNAVAILABLE',503);
 return db.transaction(async tx=>{
 await tx.query(`SELECT s.token_hash FROM auth_sessions s JOIN auth_accounts a ON a.user_id=s.user_id WHERE s.token_hash=$1 FOR UPDATE OF s,a`,[sessionTokenHash(token)]);
 if(!await readSession(tx,token,{now}))throw new AuthHttpError('UNAUTHENTICATED',401);
 const r=await tx.query(`SELECT id,encrypted_secret,last_counter,encryption_key_version FROM auth_mfa_factors WHERE user_id=$1 AND kind='totp' AND confirmed_at IS NOT NULL AND revoked_at IS NULL FOR UPDATE`,[session.user_id]);
 let matched=null;
 for(const factor of r.rows){
  if(factor.encryption_key_version!==keyVersion)continue;
  let secret;try{const e=JSON.parse(Buffer.from(factor.encrypted_secret).toString());const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64'));decipher.setAAD(Buffer.from(`allb-totp:${factor.id}:${session.user_id}`));decipher.setAuthTag(Buffer.from(e.tag,'base64'));secret=Buffer.concat([decipher.update(Buffer.from(e.ciphertext,'base64')),decipher.final()]);}catch{continue;}
  const counter=Math.floor(now.getTime()/30000);
  for(const n of [counter-1,counter,counter+1])if(n>=0&&(factor.last_counter===null||BigInt(n)>BigInt(factor.last_counter))&&timingSafeEqual(Buffer.from(totp(secret,n)),Buffer.from(code)))matched={id:factor.id,counter:n};
  secret.fill(0);if(matched)break;
 }
 if(!matched)throw new AuthHttpError('INVALID_MFA',401);
 await tx.query('UPDATE auth_mfa_factors SET last_counter=$2 WHERE id=$1',[matched.id,matched.counter]);
 const result=await tx.query(`UPDATE auth_sessions SET mfa_verified_at=$2 WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>$2 AND authenticated_at<=$2 RETURNING user_id`,[sessionTokenHash(token),now]);
 if(result.rows.length!==1)throw new AuthHttpError('UNAUTHENTICATED',401);
 return {verified:true};
 });
}
export async function logout(db,token){await revokeSession(db,token);return {loggedOut:true};}
