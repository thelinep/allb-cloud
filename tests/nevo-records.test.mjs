import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {createEventService,recordDigest} from '../packages/nevo-records/repository.mjs';
import {sessionTokenHash} from '../packages/auth-core/credentials.mjs';
const require=createRequire(new URL('../apps/maataa-ui-route-source/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
const dir=mkdtempSync(join(tmpdir(),'allb-records-'));
let db=new PGlite(dir),checks=0;
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const check=()=>checks++;
const reject=async(p,code)=>{await assert.rejects(p,e=>e.code===code);check();};
const token=n=>Buffer.alloc(32,n).toString('base64url');
const a={organizationId:id(1),workspaceId:id(3)},b={organizationId:id(2),workspaceId:id(4)};
try{
 assert.equal(recordDigest({z:2,a:{y:1,b:2}}),recordDigest({a:{b:2,y:1},z:2}));check();
 for(const file of ['001_foundation.sql','002_own_auth.sql','003_event_records.sql'])await db.exec(readFileSync(new URL('../packages/enterprise-db/migrations/'+file,import.meta.url),'utf8'));
 await db.exec(`INSERT INTO organizations VALUES('${id(1)}','alpha','A',now()),('${id(2)}','beta','B',now()); INSERT INTO workspaces VALUES('${id(1)}','${id(3)}','studio','Studio'),('${id(2)}','${id(4)}','studio','Studio');`);
 for(const [n,org,role] of [[5,1,'editor'],[6,2,'editor'],[7,1,'viewer']]){
  await db.query(`INSERT INTO identities(id,issuer,subject) VALUES($1,'own',$2)`,[id(n),String(n)]);
  await db.query(`INSERT INTO memberships VALUES($1,$2,$3)`,[id(org),id(n),role]);
  await db.query(`INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,now())`,[id(n),`${n}@example.test`,'x'.repeat(64)]);
  await db.query(`INSERT INTO auth_sessions(token_hash,user_id,credential_version,authenticated_at,expires_at,last_seen_at) VALUES($1,$2,1,now(),now()+interval '1 day',now())`,[sessionTokenHash(token(n)),id(n)]);
 }
 let service=createEventService(db);
 const first=await service.create(token(5),a,{id:id(10),title:'Production',state:{id:id(10),organizationId:id(1),workspaceId:id(3),schemaVersion:1,status:'inquiry'}});assert.equal(first.revision,1);check();
 await reject(service.create(token(7),a,{id:id(11),title:'Forbidden',state:{}}),'FORBIDDEN');
 await reject(service.read(token(5),b,id(10)),'FORBIDDEN');
 assert.equal(await service.read(token(6),b,id(10)),null);check();
 assert.equal((await service.list(token(6),b)).length,0);check();
 await reject(service.save(token(5),a,{id:id(10),expectedRevision:1,state:{organizationId:id(2)}}),'STATE_SCOPE_MISMATCH');
 await reject(service.save(token(5),a,{id:id(10),expectedRevision:1,state:[]}),'INVALID_DOCUMENT');
 const second=await service.save(token(5),a,{id:id(10),expectedRevision:1,state:{status:'layout',value:2}});assert.equal(second.revision,2);check();
 await reject(service.save(token(5),a,{id:id(10),expectedRevision:1,state:{status:'stale'}}),'STALE_REVISION');
 assert.equal((await service.versions(token(7),a,id(10))).length,2);check();
 const scene={id:'scene-one',schemaVersion:1,nodes:[]};
 assert.equal((await service.saveScene(token(5),a,{eventId:id(10),sceneId:scene.id,expectedRevision:0,document:scene})).revision,1);check();
 await reject(service.saveScene(token(5),a,{eventId:id(10),sceneId:scene.id,expectedRevision:0,document:scene}),'STALE_REVISION');
 await reject(service.saveScene(token(5),a,{eventId:id(10),sceneId:scene.id,expectedRevision:1,document:{...scene,organizationId:id(2)}}),'STATE_SCOPE_MISMATCH');
 assert.equal(await service.readScene(token(6),b,id(10),scene.id,1),null);check();
 await assert.rejects(db.query('UPDATE production_event_versions SET state=$1::jsonb WHERE event_id=$2',['{}',id(10)]),/immutable/);check();
 await assert.rejects(db.query('DELETE FROM production_scene_versions WHERE event_id=$1',[id(10)]),/immutable/);check();
 const failing=createEventService({transaction:fn=>db.transaction(tx=>fn({query:(sql,args)=>sql.includes('INSERT INTO audit_events')?Promise.reject(Error('injected audit failure')):tx.query(sql,args)}))});
 await assert.rejects(failing.save(token(5),a,{id:id(10),expectedRevision:2,state:{status:'broken'}}),/injected audit failure/);check();
 assert.equal((await service.read(token(5),a,id(10))).revision,2);check();
 assert.equal((await service.versions(token(5),a,id(10))).length,2);check();
 // Two callers with the same expected revision: exactly one may commit. PGlite
 // serializes transactions; this tests optimistic collision, not network locking.
 const collision=await Promise.allSettled([service.save(token(5),a,{id:id(10),expectedRevision:2,state:{winner:'one'}}),service.save(token(5),a,{id:id(10),expectedRevision:2,state:{winner:'two'}})]);
 assert.equal(collision.filter(v=>v.status==='fulfilled').length,1);assert.equal(collision.find(v=>v.status==='rejected').reason.code,'STALE_REVISION');check();
 await db.close();db=new PGlite(dir);service=createEventService(db);
 assert.equal((await service.read(token(5),a,id(10))).revision,3);check();
 assert.deepEqual((await service.readScene(token(5),a,id(10),scene.id,1)).document,scene);check();
 assert.equal((await service.versions(token(5),a,id(10))).length,3);check();
 await db.query(`UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1`,[id(5)]);
 await reject(service.read(token(5),a,id(10)),'UNAUTHENTICATED');
 console.log(`PASS ${checks} durable event/scene assertions; disk-backed PGlite reopen, scoped auth, version conflict and atomic rollback`);
}finally{await db.close();rmSync(dir,{recursive:true,force:true});}
