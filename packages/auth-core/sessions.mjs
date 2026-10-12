import {newSessionToken,sessionTokenHash} from './credentials.mjs';
// Internal server primitives only. No browser endpoint may call issueSession
// without completed credential verification, throttling and required MFA.
export async function issueSession(db,userId,{credentialVersion,now=new Date(),lifetimeSeconds=28800}={}){
 if(!Number.isInteger(credentialVersion)||credentialVersion<1)throw Error('Verified credential version required');
 if(!Number.isInteger(lifetimeSeconds)||lifetimeSeconds<60||lifetimeSeconds>86400)throw Error('Invalid session lifetime');
 const token=newSessionToken(),hash=sessionTokenHash(token);
 const expires=new Date(now.getTime()+lifetimeSeconds*1000);
 const result=await db.query(`INSERT INTO auth_sessions(token_hash,user_id,credential_version,authenticated_at,expires_at,last_seen_at)
 SELECT $1,user_id,credential_version,$3,$4,$3 FROM auth_accounts
 WHERE user_id=$2 AND credential_version=$5 AND verified_at IS NOT NULL AND disabled_at IS NULL RETURNING user_id`,[hash,userId,now,expires,credentialVersion]);
 if(result.rows.length!==1)return null;
 return {token,expiresAt:expires};
}
export async function readSession(db,token,{now=new Date()}={}){
 const hash=sessionTokenHash(token);if(!hash)return null;
 const result=await db.query(`SELECT s.user_id,s.authenticated_at,s.mfa_verified_at FROM auth_sessions s
 JOIN auth_accounts a ON a.user_id=s.user_id AND a.credential_version=s.credential_version
 WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>$2
 AND a.disabled_at IS NULL AND a.verified_at IS NOT NULL`,[hash,now]);
 return result.rows[0]??null;
}
export async function revokeSession(db,token,{now=new Date()}={}){
 const hash=sessionTokenHash(token);if(!hash)return;
 await db.query('UPDATE auth_sessions SET revoked_at=$2 WHERE token_hash=$1 AND revoked_at IS NULL',[hash,now]);
}
// Server callers derive userId from their verified session, never request input.
export async function listSessions(db,userId,{now=new Date()}={}){
 const result=await db.query(`SELECT s.authenticated_at,s.expires_at,s.last_seen_at,s.mfa_verified_at
 FROM auth_sessions s JOIN auth_accounts a ON a.user_id=s.user_id AND a.credential_version=s.credential_version
 WHERE s.user_id=$1 AND s.revoked_at IS NULL AND s.expires_at>$2 AND a.disabled_at IS NULL
 ORDER BY s.authenticated_at DESC`,[userId,now]);
 return result.rows;
}
export async function revokeAllSessions(db,userId,{now=new Date()}={}){
 await db.query('UPDATE auth_sessions SET revoked_at=$2 WHERE user_id=$1 AND revoked_at IS NULL',[userId,now]);
}
export async function rotateSession(db,token,{now=new Date(),lifetimeSeconds=28800}={}){
 const hash=sessionTokenHash(token);if(!hash)return null;
 if(!Number.isInteger(lifetimeSeconds)||lifetimeSeconds<60||lifetimeSeconds>86400)throw Error('Invalid session lifetime');
 const nextToken=newSessionToken(),nextHash=sessionTokenHash(nextToken),expiresAt=new Date(now.getTime()+lifetimeSeconds*1000);
 const result=await db.query(`WITH previous AS (
 UPDATE auth_sessions s SET revoked_at=$2 FROM auth_accounts a
 WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>$2
 AND a.user_id=s.user_id AND a.credential_version=s.credential_version
 AND a.disabled_at IS NULL AND a.verified_at IS NOT NULL
 RETURNING s.user_id,s.credential_version,s.authenticated_at,s.mfa_verified_at)
 INSERT INTO auth_sessions(token_hash,user_id,credential_version,authenticated_at,expires_at,last_seen_at,mfa_verified_at)
 SELECT $3,user_id,credential_version,authenticated_at,$4,$2,mfa_verified_at FROM previous RETURNING user_id`,[hash,now,nextHash,expiresAt]);
 return result.rows.length===1?{token:nextToken,expiresAt}:null;
}
