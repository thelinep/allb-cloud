import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from './helpers/dependencies.mjs';
import {withNevoIdentity,nevoRoleMap} from '../packages/nevo-identity-adapter/adapter.mjs';
import {issueSession} from '../packages/auth-core/sessions.mjs';
import {sessionTokenHash} from '../packages/auth-core/credentials.mjs';
const db=new PGlite(),id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const now=new Date('2026-10-10T00:00:00Z'),scope={organizationId:id(1),workspaceId:id(2)};let checks=0;
async function denied(fn,code){await assert.rejects(fn,e=>e.code===code);checks++;}
try {
 for(const file of ['001_foundation','002_own_auth'])await db.exec(fs.readFileSync(`packages/enterprise-db/migrations/${file}.sql`,'utf8'));
 await db.exec(`CREATE TABLE "Organization"(id text PRIMARY KEY);CREATE TABLE "User"(id text PRIMARY KEY,role text,status text,"organizationId" text,"emailVerifiedAt" timestamptz);`);
 await db.exec(fs.readFileSync('packages/nevo-identity-adapter/schema.sql','utf8'));
 await db.exec(`INSERT INTO organizations(id,slug,name) VALUES('${id(1)}','org','Org'); INSERT INTO workspaces VALUES('${id(1)}','${id(2)}','main','Main'); INSERT INTO identities VALUES('${id(3)}','maataa','person',now()); INSERT INTO memberships VALUES('${id(1)}','${id(3)}','admin'); INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES('${id(3)}','p@example.test','${'x'.repeat(64)}',now()); INSERT INTO "Organization" VALUES('cuid-org'); INSERT INTO "User" VALUES('cuid-user','ADMIN','ACTIVE','cuid-org',now()); INSERT INTO nevo_identity_links VALUES('${id(3)}','${id(1)}','${id(2)}','cuid-user','cuid-org',NULL);`);
 const {token}=await issueSession(db,id(3),{credentialVersion:1,now});
 const run=(action='design.read',options={now})=>withNevoIdentity(db,token,scope,action,(_tx,ctx)=>ctx,options);
 await denied(()=>run(),'MFA_REQUIRED');
 await db.query('UPDATE auth_sessions SET mfa_verified_at=$2 WHERE token_hash=$1',[sessionTokenHash(token),now]);
 assert.equal((await run()).nevoUserId,'cuid-user');checks++;
 await denied(()=>withNevoIdentity(db,token,{...scope,organizationId:id(99)},'design.read',()=>assert.fail('must not run'),{now}),'FORBIDDEN');
 await denied(()=>withNevoIdentity(db,token,{...scope,workspaceId:id(99)},'design.read',()=>assert.fail('must not run'),{now}),'FORBIDDEN');
 await db.exec('DELETE FROM nevo_identity_links');await denied(()=>run(),'NEVO_IDENTITY_UNAVAILABLE');
 await db.query('INSERT INTO nevo_identity_links VALUES($1,$2,$3,$4,$5,NULL)',[id(3),id(1),id(2),'cuid-user','cuid-org']);
 await db.exec(`UPDATE "User" SET role='SUPER_ADMIN'`);assert.equal((await run()).mappedRole,'admin');checks++;
 await denied(()=>run('design.publish',{now:new Date(now.getTime()+901000)}),'MFA_REQUIRED');
 for(const role of ['CLIENT','GUEST','VENDOR','STAFF']){await db.query('UPDATE "User" SET role=$1',[role]);await denied(()=>run('design.publish'),'FORBIDDEN');}
 await db.exec(`UPDATE "User" SET role='UNKNOWN'`);await denied(()=>run(),'FORBIDDEN');
 await db.exec(`UPDATE "User" SET role='ADMIN',status='SUSPENDED'`);await denied(()=>run(),'NEVO_IDENTITY_UNAVAILABLE');
 await db.exec(`UPDATE "User" SET status='ACTIVE',"organizationId"='other-org'`);await denied(()=>run(),'NEVO_IDENTITY_UNAVAILABLE');
 await db.exec(`UPDATE "User" SET "organizationId"='cuid-org',"emailVerifiedAt"=NULL`);await denied(()=>run(),'NEVO_IDENTITY_UNAVAILABLE');
 await db.exec(`UPDATE "User" SET "emailVerifiedAt"=now();UPDATE nevo_identity_links SET disabled_at=now()`);await denied(()=>run(),'NEVO_IDENTITY_UNAVAILABLE');
 await db.exec(`UPDATE nevo_identity_links SET disabled_at=NULL;UPDATE auth_accounts SET disabled_at=now()`);await denied(()=>run(),'UNAUTHENTICATED');
 await db.exec(`UPDATE auth_accounts SET disabled_at=NULL,credential_version=2`);await denied(()=>run(),'UNAUTHENTICATED');
 await db.exec(`UPDATE auth_accounts SET credential_version=1;UPDATE memberships SET role='reviewer';UPDATE "User" SET role='FINANCE'`);
 await db.query('UPDATE auth_sessions SET authenticated_at=$1,mfa_verified_at=$2',[now,new Date(now.getTime()-1000)]);await denied(()=>run(),'MFA_REQUIRED');
 await db.query('UPDATE auth_sessions SET authenticated_at=$1,mfa_verified_at=$2',[new Date(now.getTime()+1000),now]);await denied(()=>run(),'UNAUTHENTICATED');
 await db.query('UPDATE auth_sessions SET authenticated_at=$1,mfa_verified_at=$1',[now]);assert.equal((await run()).mappedRole,'reviewer');checks++;
 await db.exec(`UPDATE auth_sessions SET revoked_at=now()`);await denied(()=>run(),'UNAUTHENTICATED');
 assert.equal(Object.keys(nevoRoleMap).length,12);checks++;
 console.log(`PASS ${checks} NEVO identity bridge checks against disposable PostgreSQL`);
} finally {await db.close();}

// Genuine imported NEVO primitives: preserve formats instead of relabeling.
const {scryptHashPassword,scryptVerifyPassword}=await import('../packages/platform-auth-core/src/password-hashers/scrypt.ts');
const {createSessionToken,hashSessionToken}=await import('../packages/platform-auth-core/src/session.ts');
const {verifyPassword}=await import('../packages/auth-core/credentials.mjs');
const {webAuthnConfig}=await import('../packages/platform-mfa/src/config.ts');
const {consumeWebAuthnChallenge}=await import('../packages/platform-mfa/src/challenge-store.ts');
const password='A deliberately long password';
const legacyHash=await scryptHashPassword(password);
assert.match(legacyHash,/^[a-f0-9]{32}:[a-f0-9]{128}$/);
assert.equal(await scryptVerifyPassword(password,legacyHash),true);
assert.equal(await scryptVerifyPassword('incorrect password',legacyHash),false);
assert.equal(await verifyPassword(password,legacyHash),false); // Never silently import.
const legacyToken=createSessionToken();assert.equal(hashSessionToken(legacyToken),sessionTokenHash(legacyToken));
assert.equal(webAuthnConfig(new Request('https://nevoevents.in'),{}),null);
assert.deepEqual(webAuthnConfig(new Request('https://nevoevents.in'),{NEVO_FIDO_ENABLED:'1',NEVO_WEBAUTHN_ORIGIN:'https://nevoevents.in',NEVO_WEBAUTHN_RP_ID:'nevoevents.in'}),{origin:'https://nevoevents.in',rpID:'nevoevents.in',rpName:'NEVO'});
assert.throws(()=>webAuthnConfig(new Request('https://nevoevents.in'),{NEVO_FIDO_ENABLED:'1',NEVO_WEBAUTHN_ORIGIN:'http://nevoevents.in'}),/HTTPS/);
assert.throws(()=>webAuthnConfig(new Request('https://nevoevents.in'),{NEVO_FIDO_ENABLED:'1',NEVO_WEBAUTHN_ORIGIN:'https://nevoevents.in',NEVO_WEBAUTHN_RP_ID:'allb.xyz'}),/must match/);
// Delegate contract only: these assertions do not certify a real authenticator.
assert.equal(await consumeWebAuthnChallenge({findFirst:async()=>null},'u','AUTHENTICATE'),null);
assert.equal(await consumeWebAuthnChallenge({findFirst:async()=>({id:'c',challenge:'x'}),updateMany:async()=>({count:0})},'u','AUTHENTICATE'),null);
console.log('PASS 11 imported auth/MFA compatibility assertions (WebAuthn ceremony untested)');
