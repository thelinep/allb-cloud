import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {issueSession} from '../../../packages/auth-core/sessions.mjs';
import {sessionTokenHash} from '../../../packages/auth-core/credentials.mjs';
import {authorizeWorkspace,readWorkspaceResource,updateDesignDraft} from '../../../packages/authorization/workspace.mjs';
const db=new PGlite(), id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const scope={organizationId:id(1),workspaceId:id(10)},other={organizationId:id(2),workspaceId:id(20)};
const now=new Date('2026-10-10T00:00:00Z'),options={now};let checks=0;
const check=(v,e)=>{assert.deepEqual(v,e);checks++;};
async function denied(fn,code='FORBIDDEN'){await assert.rejects(fn,e=>e.code===code);checks++;}
try{
 for(const m of ['001_foundation','002_own_auth'])await db.exec(fs.readFileSync(new URL(`../../../packages/enterprise-db/migrations/${m}.sql`,import.meta.url),'utf8'));
 await db.exec(`INSERT INTO organizations VALUES('${id(1)}','tenant-a','A',now()),('${id(2)}','tenant-b','B',now());INSERT INTO workspaces VALUES('${id(1)}','${id(10)}','main','A'),('${id(1)}','${id(11)}','second','A2'),('${id(2)}','${id(20)}','main','B');`);
 const tokens={};
 for(const [n,role,org] of [[3,'viewer',1],[4,'editor',1],[5,'reviewer',1],[6,'admin',1],[7,'owner',2]]){
  await db.query('INSERT INTO identities(id,issuer,subject) VALUES($1,$2,$3)',[id(n),'maataa',`user${n}`]);
  await db.query('INSERT INTO memberships VALUES($1,$2,$3)',[id(org),id(n),role]);
  await db.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,$4)',[id(n),`user${n}@example.test`,'x'.repeat(64),now]);
  tokens[role]=(await issueSession(db,id(n),{credentialVersion:1,now})).token;
 }
 for(const [org,ws,draft,user] of [[1,10,30,4],[1,11,31,4],[2,20,32,7]])await db.query('INSERT INTO design_drafts(organization_id,workspace_id,id,config,updated_by) VALUES($1,$2,$3,$4,$5)',[id(org),id(ws),id(draft),{},id(user)]);
 check((await authorizeWorkspace(db,tokens.viewer,scope,'design.read',options)).role,'viewer');
 await denied(()=>authorizeWorkspace(db,'bad',scope,'design.read',options),'UNAUTHENTICATED');
 await denied(()=>authorizeWorkspace(db,tokens.viewer,other,'design.read',options));
 await denied(()=>authorizeWorkspace(db,tokens.viewer,{organizationId:id(1),workspaceId:id(20)},'design.read',options));
 await denied(()=>authorizeWorkspace(db,tokens.viewer,scope,'unknown.action',options));
 await denied(()=>authorizeWorkspace(db,tokens.viewer,{...scope,role:'admin',userId:id(6)},'design.publish',options));
 await denied(()=>authorizeWorkspace(db,tokens.editor,scope,'design.review',options));
 await denied(()=>authorizeWorkspace(db,tokens.reviewer,scope,'design.edit',options));
 check((await authorizeWorkspace(db,tokens.reviewer,scope,'design.review',options)).role,'reviewer');
 await denied(()=>authorizeWorkspace(db,tokens.admin,scope,'design.read',options),'MFA_REQUIRED');
 await db.query('UPDATE auth_sessions SET mfa_verified_at=$2 WHERE token_hash=$1',[sessionTokenHash(tokens.admin),now]);
 check((await authorizeWorkspace(db,tokens.admin,scope,'design.publish',options)).role,'admin');
 check((await readWorkspaceResource(db,tokens.viewer,scope,'draft',id(30),options)).id,id(30));
 check(await readWorkspaceResource(db,tokens.viewer,scope,'draft',id(32),options),null);
 check(await readWorkspaceResource(db,tokens.viewer,scope,'draft',id(31),options),null);
 await denied(()=>readWorkspaceResource(db,tokens.viewer,scope,'auth_accounts',id(30),options));
 await denied(()=>updateDesignDraft(db,tokens.viewer,scope,id(30),{color:'red'},1,options));
 check(await updateDesignDraft(db,tokens.editor,scope,id(32),{color:'red'},1,options),null);
 check(await updateDesignDraft(db,tokens.editor,scope,id(31),{color:'red'},1,options),null);
 check((await updateDesignDraft(db,tokens.editor,scope,id(30),{color:'gold'},1,options)).revision,2);
 check(await updateDesignDraft(db,tokens.editor,scope,id(30),{color:'red'},1,options),null);
 check((await db.query('SELECT count(*)::int AS n FROM audit_events')).rows[0].n,1);
 check((await db.query('SELECT config FROM design_drafts WHERE id=$1',[id(32)])).rows[0].config,{});
 await db.query('UPDATE memberships SET role=$1 WHERE organization_id=$2 AND user_id=$3',['viewer',id(1),id(4)]);
 await denied(()=>authorizeWorkspace(db,tokens.editor,scope,'design.edit',options));
 await db.query('DELETE FROM memberships WHERE organization_id=$1 AND user_id=$2',[id(1),id(5)]);
 await denied(()=>authorizeWorkspace(db,tokens.reviewer,scope,'design.read',options));
 await db.query('UPDATE auth_sessions SET revoked_at=$2 WHERE token_hash=$1',[sessionTokenHash(tokens.viewer),now]);
 await denied(()=>authorizeWorkspace(db,tokens.viewer,scope,'design.read',options),'UNAUTHENTICATED');
 await db.query('UPDATE auth_accounts SET credential_version=2 WHERE user_id=$1',[id(6)]);
 await denied(()=>authorizeWorkspace(db,tokens.admin,scope,'design.read',options),'UNAUTHENTICATED');
 await denied(()=>authorizeWorkspace(db,tokens.owner,other,'design.publish',{now:new Date(now.getTime()+86400000)}),'UNAUTHENTICATED');
 check((await db.query('SELECT revision FROM design_drafts WHERE id=$1',[id(31)])).rows[0].revision,1);
 await db.query('UPDATE memberships SET role=$1 WHERE organization_id=$2 AND user_id=$3',['editor',id(1),id(4)]);
 await db.exec("CREATE FUNCTION reject_test_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit unavailable'; END; $$; CREATE TRIGGER reject_test_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_test_audit();");
 await assert.rejects(()=>updateDesignDraft(db,tokens.editor,scope,id(30),{color:'orange'},2,options),/audit unavailable/);checks++;
 check((await db.query('SELECT revision,config FROM design_drafts WHERE id=$1',[id(30)])).rows[0],{revision:2,config:{color:'gold'}});

 console.log(`PASS ${checks} tenant authorization checks against disposable PostgreSQL (PGlite)`);
}finally{await db.close();}
