import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let checks=0;
async function rejects(sql,code){await assert.rejects(db.exec(sql),e=>e.code===code);checks++;}
try{
 await db.exec(fs.readFileSync('../../packages/enterprise-db/migrations/001_foundation.sql','utf8'));checks++;
 await db.exec(fs.readFileSync('../../packages/enterprise-db/migrations/002_own_auth.sql','utf8'));checks++;
 await db.exec(`INSERT INTO organizations(id,slug,name) VALUES('${id(1)}','tenant-a','A'),('${id(2)}','tenant-b','B');
 INSERT INTO identities(id,issuer,subject) VALUES('${id(3)}','https://issuer.example','subject-a'),('${id(4)}','https://issuer.example','subject-b');
 INSERT INTO memberships VALUES('${id(1)}','${id(3)}','owner'),('${id(2)}','${id(4)}','owner');
 INSERT INTO workspaces VALUES('${id(1)}','${id(5)}','nevo','NEVO'),('${id(2)}','${id(6)}','nevo','NEVO B');`);checks++;
 await rejects(`INSERT INTO identities(id,issuer,subject) VALUES('${id(7)}','https://issuer.example','subject-a')`,'23505');
 await rejects(`INSERT INTO workspaces VALUES('${id(1)}','${id(8)}','nevo','Duplicate')`,'23505');
 await rejects(`INSERT INTO memberships VALUES('${id(1)}','${id(4)}','root')`,'23514');
 await rejects(`INSERT INTO design_drafts(organization_id,workspace_id,id,config,updated_by) VALUES('${id(1)}','${id(6)}','${id(9)}','{}','${id(3)}')`,'23503');
 await rejects(`INSERT INTO design_drafts(organization_id,workspace_id,id,config,updated_by) VALUES('${id(1)}','${id(5)}','${id(9)}','{}','${id(4)}')`,'23503');
 await rejects(`INSERT INTO design_drafts(organization_id,workspace_id,id,config,updated_by) VALUES('${id(1)}','${id(5)}','${id(9)}','[]','${id(3)}')`,'23514');
 await db.exec(`INSERT INTO design_versions(organization_id,workspace_id,id,number,config,created_by) VALUES('${id(1)}','${id(5)}','${id(10)}',1,'{}','${id(3)}');`);checks++;
 await rejects(`UPDATE design_versions SET config='{"changed":true}'`,'P0001');
 await rejects(`DELETE FROM design_versions`,'P0001');
 await rejects(`INSERT INTO design_approvals(organization_id,workspace_id,version_id,reviewer_id,decision) VALUES('${id(1)}','${id(5)}','${id(10)}','${id(4)}','approved')`,'23503');
 await rejects(`INSERT INTO design_publications(organization_id,workspace_id,route,version_id,published_by) VALUES('${id(2)}','${id(6)}','/allb/nevo','${id(10)}','${id(4)}')`,'23503');
 await db.exec(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id) VALUES('${id(11)}','${id(1)}','${id(5)}','${id(3)}','test','draft');`);
 await rejects(`DELETE FROM audit_events`,'P0001');
 await db.exec(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES('${id(12)}','${id(1)}','${id(5)}','test','{}','one');`);
 await rejects(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES('${id(13)}','${id(1)}','${id(5)}','test','{}','one')`,'23505');
 await assert.rejects(db.transaction(async tx=>{
  await tx.exec(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES('${id(14)}','${id(1)}','${id(5)}','test','{}','rollback');`);
  throw Error('abort');
 }));
 assert.equal((await db.query(`SELECT count(*)::int AS n FROM outbox_events WHERE id='${id(14)}'`)).rows[0].n,0);checks++;
 await db.exec(`INSERT INTO auth_accounts(user_id,email,password_hash) VALUES('${id(3)}','owner@example.test','${'x'.repeat(64)}');`);
 await rejects(`INSERT INTO auth_accounts(user_id,email,password_hash) VALUES('${id(4)}','OWNER@example.test','${'x'.repeat(64)}')`,'23514');
 await rejects(`INSERT INTO auth_sessions(token_hash,user_id,credential_version,authenticated_at,expires_at,last_seen_at) VALUES('${'a'.repeat(64)}','${id(3)}',1,now(),now()-interval '1 hour',now())`,'23514');
 await rejects(`INSERT INTO auth_invitations(id,organization_id,invited_by,email,role,token_hash,expires_at) VALUES('${id(15)}','${id(1)}','${id(4)}','new@example.test','editor','${'b'.repeat(64)}',now()+interval '1 day')`,'23503');
 await rejects(`INSERT INTO auth_challenges(token_hash,user_id,purpose,expires_at) VALUES('raw-token','${id(3)}','recover_account',now()+interval '1 hour')`,'23514');
 await db.exec(`INSERT INTO auth_recovery_codes(user_id,code_hash) VALUES('${id(3)}','${'c'.repeat(64)}');`);
 await rejects(`INSERT INTO auth_recovery_codes(user_id,code_hash) VALUES('${id(3)}','${'c'.repeat(64)}')`,'23505');
 console.log(`PASS ${checks} migration/constraint/rollback checks in disposable PostgreSQL (PGlite)`);
}finally{await db.close();}
