import {randomUUID} from 'node:crypto';
import {configAssetReferences} from '../asset-storage/references.mjs';
import {idempotentMutation} from '../api-contracts/contracts.mjs';
import {readSession} from '../auth-core/sessions.mjs';
import {sessionTokenHash} from '../auth-core/credentials.mjs';
export class PublishingError extends Error { constructor(code){super(code);this.code=code;} }
const fail=code=>{throw new PublishingError(code);};
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
// validateConfig is a mandatory trusted server dependency, never request input.
/** @param {any} db @param {{validateConfig?:function,minimumApprovals?:number,requestContext?:any}} options */
export function createPublishingService(db,{validateConfig,minimumApprovals=1,requestContext}={}) {
 if(!Number.isInteger(minimumApprovals)||minimumApprovals<1||minimumApprovals>10)throw Error('Invalid approval policy');
 if(typeof validateConfig!=='function')throw Error('Server configuration validator required');
 const operate=(scope,roles,action,fn)=>db.transaction(async tx=>{
  if(!scope||!uuid(scope.organizationId)||!uuid(scope.workspaceId))fail('invalid_scope');
  const tokenHash=sessionTokenHash(scope.sessionToken);if(!tokenHash)fail('unauthenticated');
  // Hold session/account locks until commit so revocation or disabling cannot race mutations.
  await tx.query(`SELECT s.user_id FROM auth_sessions s JOIN auth_accounts a ON a.user_id=s.user_id WHERE s.token_hash=$1 FOR SHARE OF s,a`,[tokenHash]);
  const session=await readSession(tx,scope.sessionToken);if(!session)fail('unauthenticated');
  const p=[scope.organizationId,scope.workspaceId,session.user_id];
  // Serialize workspace mutations and policy checks, including first publication.
  const membership=await tx.query(`SELECT m.role FROM workspaces w JOIN memberships m ON m.organization_id=w.organization_id WHERE w.organization_id=$1 AND w.id=$2 AND m.user_id=$3 AND (to_jsonb(m)->>'revoked_at') IS NULL FOR UPDATE OF w,m`,p);
  const role=membership.rows[0]?.role;if(!roles.includes(role))fail('forbidden');
  if(role==='owner'||role==='admin'){const mfa=Date.parse(session.mfa_verified_at),authenticated=Date.parse(session.authenticated_at);if(!Number.isFinite(mfa)||mfa<authenticated||mfa>Date.now())fail('mfa_required');}
  const mutate=async()=>{
   const result=await fn(tx,p,role);
   if(!['design.list','design.preview'].includes(action)&&!result.published_at){
    if(result.config&&['design.edit','design.submit'].includes(action)){const refs=managedReferences(result.config,p);for(const ref of refs)await tx.query(`INSERT INTO asset_reference_bindings(organization_id,workspace_id,asset_id,revision,resource_kind,resource_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,[...p.slice(0,2),ref.assetId,ref.revision,action==='design.edit'?'design-draft':'design-version',action==='design.edit'?`${result.id}:${result.revision}`:result.id]);}
    const details={revision:result.revision,generation:result.generation,decision:result.decision,note:result.note};
    await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,$5,$6,$7)`,[randomUUID(),...p,action,result.id??result.version_id??'configuration',JSON.stringify(details)]);
    await tx.query(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES($1,$2,$3,$4,$5::jsonb,$6)`,[randomUUID(),...p.slice(0,2),action,JSON.stringify({actorId:p[2],resourceId:result.id??'configuration',...details}),`design-operation:${randomUUID()}`]);
   }
   return result;
  };
  if(requestContext?.key&&!['design.list','design.preview'].includes(action))return idempotentMutation(tx,{organizationId:p[0],workspaceId:p[1],userId:p[2]},requestContext.key,{actorId:p[2],...requestContext.input},mutate);
  return mutate();
 });
 const editors=['owner','admin','editor'],reviewers=['owner','admin','reviewer'],publishers=['owner','admin'];
 const version=async(tx,p,id)=>{if(!uuid(id))fail('invalid_version');const r=await tx.query(`SELECT * FROM design_versions WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,[...p.slice(0,2),id]);return r.rows[0]??fail('not_found');};
 const managedReferences=(config,p)=>[...(config.assetReferences??[]),...configAssetReferences(config,{organizationId:p[0],workspaceId:p[1]})];
 const assets=async(tx,p,config)=>{for(const ref of managedReferences(config,p)){const row=await tx.query(`SELECT 1 FROM asset_revisions WHERE organization_id=$1 AND workspace_id=$2 AND asset_id=$3 AND revision=$4 AND state='validated' FOR SHARE`,[...p.slice(0,2),ref.assetId,ref.revision]);if(!row.rows.length)fail('asset_not_validated');}};
 const approval=async(tx,p,v)=>{const r=await tx.query(`SELECT a.decision FROM design_approvals a JOIN memberships m ON m.organization_id=a.organization_id AND m.user_id=a.reviewer_id WHERE a.organization_id=$1 AND a.workspace_id=$2 AND a.version_id=$3 AND a.reviewer_id<>$4 AND m.role IN ('owner','admin','reviewer') AND (to_jsonb(m)->>'revoked_at') IS NULL`,[...p.slice(0,2),v.id,v.created_by]);if(r.rows.filter(x=>x.decision==='approved').length<minimumApprovals||r.rows.some(x=>x.decision==='rejected'))fail('approval_required');};
 async function publish(scope,{versionId,route,expectedGeneration},rollback){
  if(typeof route!=='string'||!/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(route)||route.length>500||!Number.isInteger(expectedGeneration)||expectedGeneration<0)fail('invalid_publication');
  return operate(scope,publishers,rollback?'design.rollback':'design.publish',async(tx,p)=>{
   const v=await version(tx,p,versionId);await approval(tx,p,v);await assets(tx,p,v.config);
   const old=(await tx.query(`SELECT * FROM design_publications WHERE organization_id=$1 AND workspace_id=$2 AND route=$3`,[...p.slice(0,2),route])).rows[0];
   if((old?.generation??0)!==expectedGeneration)fail('stale_generation');
   if(rollback){if(!old)fail('not_found');const history=await tx.query(`SELECT 1 FROM audit_events WHERE organization_id=$1 AND workspace_id=$2 AND action IN ('design.publish','design.rollback') AND resource_id=$3 AND details->>'route'=$4`,[...p.slice(0,2),versionId,route]);if(!history.rows.length)fail('not_previous_publication');}
   const r=await tx.query(`INSERT INTO design_publications(organization_id,workspace_id,route,version_id,generation,published_by) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(organization_id,workspace_id,route) DO UPDATE SET version_id=EXCLUDED.version_id,generation=EXCLUDED.generation,published_by=EXCLUDED.published_by,published_at=now() RETURNING *`,[...p.slice(0,2),route,versionId,expectedGeneration+1,p[2]]);
   await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,$5,$6,$7)`,[randomUUID(),...p,rollback?'design.rollback':'design.publish',versionId,JSON.stringify({route,generation:expectedGeneration+1})]);
   await tx.query(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES($1,$2,$3,'design.published',$4,$5)`,[randomUUID(),...p.slice(0,2),JSON.stringify({route,versionId,generation:expectedGeneration+1}),`design:${route}:${expectedGeneration+1}`]);
   return r.rows[0];
  });
 }
 return {
  list(scope,{limit=25,offset=0}={}){
   if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>10000)fail('invalid_pagination');
   return operate(scope,['owner','admin','editor','reviewer','viewer'],'design.list',async(tx,p)=>{
    const values=[...p.slice(0,2),limit,offset];
    const drafts=(await tx.query('SELECT * FROM design_drafts WHERE organization_id=$1 AND workspace_id=$2 ORDER BY updated_at DESC,id LIMIT $3 OFFSET $4',values)).rows;
    const versions=(await tx.query('SELECT * FROM design_versions WHERE organization_id=$1 AND workspace_id=$2 ORDER BY number DESC,id LIMIT $3 OFFSET $4',values)).rows;
    const publications=(await tx.query('SELECT * FROM design_publications WHERE organization_id=$1 AND workspace_id=$2 ORDER BY route LIMIT $3 OFFSET $4',values)).rows;
    const approvals=(await tx.query('SELECT * FROM design_approvals WHERE organization_id=$1 AND workspace_id=$2 ORDER BY version_id,reviewer_id LIMIT $3 OFFSET $4',values)).rows;
    return{drafts,versions,publications,approvals,minimumApprovals,pagination:{limit,offset}};
   });
  },
  saveDraft(scope,{id,config,expectedRevision=0}){if(!uuid(id)||!Number.isInteger(expectedRevision)||expectedRevision<0)fail('invalid_draft');const clean=validateConfig(config);return operate(scope,editors,'design.edit',async(tx,p)=>{await assets(tx,p,clean);const existing=(await tx.query(`SELECT revision FROM design_drafts WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,[...p.slice(0,2),id])).rows[0];if((existing?.revision??0)!==expectedRevision)fail('stale_revision');return (await tx.query(`INSERT INTO design_drafts(organization_id,workspace_id,id,revision,config,updated_by) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(organization_id,workspace_id,id) DO UPDATE SET revision=EXCLUDED.revision,config=EXCLUDED.config,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING *`,[...p.slice(0,2),id,expectedRevision+1,JSON.stringify(clean),p[2]])).rows[0];});},
  submit(scope,{draftId,expectedRevision}){return operate(scope,editors,'design.submit',async(tx,p)=>{if(!uuid(draftId))fail('invalid_draft');const d=(await tx.query(`SELECT * FROM design_drafts WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,[...p.slice(0,2),draftId])).rows[0];if(!d)fail('not_found');if(d.revision!==expectedRevision)fail('stale_revision');const n=(await tx.query(`SELECT COALESCE(MAX(number),0)+1 AS n FROM design_versions WHERE organization_id=$1 AND workspace_id=$2`,p.slice(0,2))).rows[0].n;return(await tx.query(`INSERT INTO design_versions(organization_id,workspace_id,id,number,config,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[...p.slice(0,2),randomUUID(),n,JSON.stringify(d.config),p[2]])).rows[0];});},
  review(scope,{versionId,decision,note=''}){if(typeof note!=='string'||note.length>2000)fail('invalid_review_note');if(!['approved','rejected'].includes(decision))fail('invalid_decision');return operate(scope,reviewers,'design.review',async(tx,p)=>{const v=await version(tx,p,versionId);if(v.created_by===p[2])fail('self_review');const existing=await tx.query(`SELECT 1 FROM design_approvals WHERE organization_id=$1 AND workspace_id=$2 AND version_id=$3 AND reviewer_id=$4`,[...p.slice(0,2),versionId,p[2]]);if(existing.rows.length)fail('decision_already_recorded');await tx.query(`INSERT INTO design_approvals(organization_id,workspace_id,version_id,reviewer_id,decision) VALUES($1,$2,$3,$4,$5)`,[...p.slice(0,2),versionId,p[2],decision]);return {id:versionId,decision,note};});},
  publish:(s,v)=>publish(s,v,false),rollback:(s,v)=>publish(s,v,true),
  preview(scope,id){return operate(scope,['owner','admin','editor','reviewer','viewer'],'design.preview',(tx,p)=>version(tx,p,id));}
 };
}
