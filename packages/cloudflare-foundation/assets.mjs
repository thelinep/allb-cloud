import {scopeIds,sha256,requireAuthority,FoundationError,sessionHash} from './repository.mjs';
const assetId=/^[a-f0-9-]{36}$/i;
function reference(scope,id,revision){const ids=scopeIds(scope);if(!assetId.test(id)||!Number.isSafeInteger(revision)||revision<1)throw new FoundationError('INVALID_ASSET');return [...ids,id,revision];}
export async function putPrivateAsset(db,bucket,token,scope,{id,revision,bytes}){
 const ref=reference(scope,id,revision);await requireAuthority(db,token,scope,{write:true});
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>8388608)throw new FoundationError('INVALID_ASSET_BYTES');
 const digest=await sha256(bytes);const key=`private/${ref.join('/')}/${crypto.randomUUID()}`;
 const created=await bucket.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{sha256:digest}});
 if(!created)throw new FoundationError('OBJECT_CONFLICT',409);
 try{
  const actor=await requireAuthority(db,token,scope,{write:true});
  // Membership/session read and insertion occur in one SQL statement, never trusting caller user IDs.
  const result=await db.prepare(`INSERT INTO cf_asset_revisions SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM cf_sessions s JOIN cf_accounts a ON a.id=s.user_id JOIN cf_memberships m ON m.user_id=s.user_id WHERE s.token_hash=? AND s.revoked=0 AND s.expires_at>? AND a.disabled=0 AND a.verified_at IS NOT NULL AND s.credential_version=a.credential_version AND m.organization_id=? AND m.workspace_id=? AND m.revoked=0 AND m.role IN('owner','admin','editor'))`).bind(...ref,key,digest,bytes.length,actor.hash,Date.now(),...ref.slice(0,2)).run();
  if(result.meta.changes!==1)throw new FoundationError('FORBIDDEN',403);
 }catch(error){await bucket.delete(key);throw error;}
 return {id,revision,digest,byteSize:bytes.length};
}
async function assetRow(db,token,scope,id,revision){const ref=reference(scope,id,revision);await requireAuthority(db,token,scope);const row=await db.prepare('SELECT object_key,digest,byte_size FROM cf_asset_revisions WHERE organization_id=? AND workspace_id=? AND asset_id=? AND revision=?').bind(...ref).first();if(!row)throw new FoundationError('NOT_FOUND',404);return row;}
async function signingKey(secret){if(typeof secret!=='string'||!/^[a-f0-9]{64}$/i.test(secret))throw new FoundationError('ACCESS_KEY_UNCONFIGURED',503);return crypto.subtle.importKey('raw',Uint8Array.from(secret.match(/../g),x=>parseInt(x,16)),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function mintAccess(db,secret,token,scope,id,revision,{ttlSeconds=60,now=Date.now()}={}){if(!Number.isInteger(ttlSeconds)||ttlSeconds<1||ttlSeconds>300)throw new FoundationError('INVALID_TTL');await assetRow(db,token,scope,id,revision);const payload=JSON.stringify({v:1,ref:reference(scope,id,revision),principal:await sessionHash(token),issuedAt:now,expiresAt:now+ttlSeconds*1000});const signature=hex(await crypto.subtle.sign('HMAC',await signingKey(secret),new TextEncoder().encode(payload)));return {payload,signature,expiresAt:now+ttlSeconds*1000};}
export async function getPrivateAsset(db,bucket,secret,token,scope,id,revision,access,{now=Date.now()}={}){
 if(access){if(typeof access.payload!=='string'||access.payload.length>2048||typeof access.signature!=='string'||!/^[a-f0-9]{64}$/.test(access.signature))throw new FoundationError('INVALID_ACCESS',403);const valid=await crypto.subtle.verify('HMAC',await signingKey(secret),Uint8Array.from(access.signature.match(/../g),x=>parseInt(x,16)),new TextEncoder().encode(access.payload));if(!valid)throw new FoundationError('INVALID_ACCESS',403);let p;try{p=JSON.parse(access.payload);}catch{throw new FoundationError('INVALID_ACCESS',403);}if(p.v!==1||JSON.stringify(p.ref)!==JSON.stringify(reference(scope,id,revision))||p.principal!==await sessionHash(token)||!Number.isSafeInteger(p.issuedAt)||!Number.isSafeInteger(p.expiresAt)||p.issuedAt>now||p.expiresAt<=now||p.expiresAt-p.issuedAt>300000||p.expiresAt<=p.issuedAt)throw new FoundationError('INVALID_ACCESS',403);}
 const row=await assetRow(db,token,scope,id,revision);const object=await bucket.get(row.object_key);if(!object||object.size!==row.byte_size||object.size>8388608)throw new FoundationError('ASSET_INTEGRITY_FAILURE',409);const bytes=new Uint8Array(await object.arrayBuffer());if(await sha256(bytes)!==row.digest)throw new FoundationError('ASSET_INTEGRITY_FAILURE',409);await requireAuthority(db,token,scope);return bytes;
}
