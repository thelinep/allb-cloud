import {newSessionToken,sessionTokenHash,hashPassword} from './credentials.mjs';
const purposes=new Set(['verify_email','recover_account','enroll_mfa']);
// Internal primitives: callers must authorize issuance, throttle and deliver the
// token privately. Returning null must never change a public recovery response.
export async function issueChallenge(db,userId,purpose,{now=new Date(),lifetimeSeconds=900}={}){
 if(!purposes.has(purpose)||!Number.isInteger(lifetimeSeconds)||lifetimeSeconds<60||lifetimeSeconds>3600)throw Error('Invalid challenge policy');
 const token=newSessionToken(),hash=sessionTokenHash(token),expiresAt=new Date(now.getTime()+lifetimeSeconds*1000);
 const result=await db.query(`INSERT INTO auth_challenges(token_hash,user_id,purpose,created_at,expires_at)
 SELECT $1,user_id,$3,$4,$5 FROM auth_accounts WHERE user_id=$2 AND disabled_at IS NULL RETURNING user_id`,[hash,userId,purpose,now,expiresAt]);
 return result.rows.length===1?{token,expiresAt}:null;
}
export async function consumeChallenge(db,token,purpose,{now=new Date()}={}){
 const hash=sessionTokenHash(token);if(!hash||!purposes.has(purpose))return null;
 const result=await db.query(`UPDATE auth_challenges c SET consumed_at=$3 FROM auth_accounts a
 WHERE c.token_hash=$1 AND c.purpose=$2 AND c.user_id=a.user_id AND a.disabled_at IS NULL
 AND c.consumed_at IS NULL AND c.expires_at>$3 RETURNING c.user_id`,[hash,purpose,now]);
 return result.rows[0]?.user_id??null;
}
// Consume token and rotate password/version in one statement: replay and stale
// sessions are rejected even when concurrent recovery requests arrive.
export async function recoverPassword(db,token,password,{now=new Date()}={}){
 const hash=sessionTokenHash(token);if(!hash)return false;
 const passwordHash=await hashPassword(password);
 const result=await db.query(`WITH consumed AS (
 UPDATE auth_challenges c SET consumed_at=$2 FROM auth_accounts a
 WHERE c.token_hash=$1 AND c.purpose='recover_account' AND c.user_id=a.user_id
 AND a.disabled_at IS NULL AND a.verified_at IS NOT NULL AND c.consumed_at IS NULL AND c.expires_at>$2
 RETURNING c.user_id)
 UPDATE auth_accounts a SET password_hash=$3,credential_version=a.credential_version+1
 FROM consumed c WHERE a.user_id=c.user_id RETURNING a.user_id`,[hash,now,passwordHash]);
 return result.rows.length===1;
}
