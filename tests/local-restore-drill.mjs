import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,cpSync,mkdirSync,readdirSync,rmSync,lstatSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {performance} from 'node:perf_hooks';
import {sessionTokenHash} from '../packages/auth-core/credentials.mjs';
import {createAssetStorage} from '../packages/asset-storage/service.mjs';
import {attest,verify} from '../packages/release-evidence/integrity.mjs';
const require=createRequire(new URL('../apps/maataa-ui-route-source/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
const sharp=require('sharp');
const temp=mkdtempSync(join(tmpdir(),'allb-cold-restore-')),source=join(temp,'source'),copy=join(temp,'restored');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):e.isFile()?[join(dir,e.name)]:[]);
const uid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let db;const start=performance.now();let assertions=0;
try{
 mkdirSync(source,{recursive:true});db=new PGlite(join(source,'database'));
 const migrations=readdirSync(new URL('../packages/enterprise-db/migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort();
 for(const migration of migrations)await db.exec(readFileSync(new URL('../packages/enterprise-db/migrations/'+migration,import.meta.url),'utf8'));
 await db.query('INSERT INTO organizations(id,slug,name) VALUES($1,$2,$3)',[uid(1),'restore-fixture','Restore Fixture']);
 await db.query('INSERT INTO workspaces VALUES($1,$2,$3,$4)',[uid(1),uid(2),'restore','Restore']);
 await db.query("INSERT INTO identities(id,issuer,subject) VALUES($1,'fixture','restore')",[uid(3)]);
 await db.query("INSERT INTO memberships(organization_id,user_id,role) VALUES($1,$2,'editor')",[uid(1),uid(3)]);
 await db.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,now())',[uid(3),'restore@example.test','x'.repeat(64)]);
 const token=Buffer.alloc(32,3).toString('base64url');
 await db.query("INSERT INTO auth_sessions(token_hash,user_id,credential_version,authenticated_at,expires_at,last_seen_at) VALUES($1,$2,1,now(),now()+interval '1 day',now())",[sessionTokenHash(token),uid(3)]);
 const assetDir=join(source,'assets');mkdirSync(assetDir);
 // Public source bytes, no customer/credential material copied into the report.
 const image=files(new URL('../apps/maataa-ui-route-source/public/allb/',import.meta.url).pathname).find(p=>p.endsWith('.webp'));
 assert.ok(image,'public creative asset available');cpSync(image,join(assetDir,'creative.webp'));assertions++;
 const asset=join(assetDir,'creative.webp');
 await db.query('INSERT INTO assets VALUES($1,$2,$3,$4)',[uid(1),uid(2),uid(4),uid(3)]);
 await db.query("INSERT INTO asset_revisions VALUES($1,$2,$3,1,'creative.webp',$4,'image/webp',$5,'validated')",[uid(1),uid(2),uid(4),hash(asset),lstatSync(asset).size]);
 await db.query("INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id) VALUES($1,$2,$3,$4,'restore.fixture',$5)",[uid(5),uid(1),uid(2),uid(3),uid(4)]);
 const scope={organizationId:uid(1),workspaceId:uid(2)},objects=join(source,'objects');
 const png=await sharp({create:{width:80,height:60,channels:4,background:'#cba'}}).png().toBuffer();
 const uploaded=await createAssetStorage(db,{directory:objects}).upload(token,scope,{assetId:uid(6),bytes:png});
 assert.equal(uploaded.derivatives.length,2);assertions++;
 await assert.rejects(db.query('DELETE FROM audit_events'),/immutable/);assertions++;
 await assert.rejects(db.query("UPDATE audit_events SET action='tampered'"),/immutable/);assertions++;
 const auditExport=attest((await db.query('SELECT * FROM audit_events ORDER BY occurred_at,id')).rows);
 const trustedAnchor=structuredClone(auditExport.anchor);assert.equal(verify(auditExport,trustedAnchor),true);assertions++;
 await db.close();db=null; // Required cold consistency boundary: never copy an open PGlite directory.
 const manifest=files(source).map(path=>({path:relative(source,path),sha256:hash(path)}));
 const backupStart=performance.now();cpSync(source,copy,{recursive:true});
 for(const entry of manifest)assert.equal(hash(join(copy,entry.path)),entry.sha256);assertions++;
 const restoreStart=performance.now();db=new PGlite(join(copy,'database'));
 const row=(await db.query('SELECT object_key,sha256,byte_size FROM asset_revisions WHERE asset_id=$1',[uid(4)])).rows[0];
 assert.equal(hash(join(copy,'assets',row.object_key)),row.sha256);assertions++;
 assert.equal(lstatSync(join(copy,'assets',row.object_key)).size,Number(row.byte_size));assertions++;
 assert.ok((await db.query('SELECT count(*)::int AS n FROM audit_events')).rows[0].n>=1);assertions++;
 const restoredAudit=attest((await db.query('SELECT * FROM audit_events ORDER BY occurred_at,id')).rows);
 assert.equal(verify(restoredAudit,trustedAnchor),true);assertions++;
 restoredAudit.rows.pop();assert.equal(verify(restoredAudit,trustedAnchor),false);assertions++;
 const restoredStorage=createAssetStorage(db,{directory:join(copy,'objects')});
 assert.deepEqual((await restoredStorage.download(token,scope,{assetId:uid(6),revision:1})).bytes,png);assertions++;
 for(const derivative of ['preview','thumbnail']){
  const restored=await restoredStorage.download(token,scope,{assetId:uid(6),revision:1,derivative});
  assert.equal((await sharp(restored.bytes).metadata()).format,'webp');assertions++;
 }
 const tampered=join(copy,'assets',row.object_key);writeFileSync(tampered,'tampered');assert.notEqual(hash(tampered),row.sha256);assertions++;
 const result={status:'PASS',assertions,mode:'cold_disk_pglite_uploaded_asset_and_derivatives_fixture',migrations,files:manifest.length,backupMilliseconds:Math.round(restoreStart-backupStart),restoreMilliseconds:Math.round(performance.now()-restoreStart),totalMilliseconds:Math.round(performance.now()-start),immutableAuditUpdateDelete:'rejected',tamperedAsset:'detected',productionPostgresRestore:'not_tested',remoteObjectStorage:'not_tested',productionCredentialsIncluded:false};
 writeFileSync(new URL('../artifacts/hardening/local-restore.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{if(db)await db.close();rmSync(temp,{recursive:true,force:true});}
