import {createHash,randomUUID} from 'node:crypto';
import {withAuthorizedWorkspace} from '../authorization/workspace.mjs';

const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export class RecordError extends Error{constructor(code){super(code);this.code=code;this.status=code==='NOT_FOUND'?404:code==='STALE_REVISION'?409:400;}}
const fail=code=>{throw new RecordError(code);};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function json(v){if(!object(v))fail('INVALID_DOCUMENT');let s;try{s=JSON.stringify(v);}catch{fail('INVALID_DOCUMENT');}if(!s||Buffer.byteLength(s)>1_000_000||!object(JSON.parse(s)))fail('INVALID_DOCUMENT');return s;}
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(object(v))return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
export function recordDigest(v){return createHash('sha256').update(JSON.stringify(canonical(JSON.parse(json(v))))).digest('hex');}
function scope(c){if(!c||![c.organizationId,c.workspaceId,c.userId].every(v=>typeof v==='string'&&uuid.test(v)))fail('INVALID_SCOPE');return[c.organizationId,c.workspaceId];}
function eventId(id){if(typeof id!=='string'||!uuid.test(id))fail('INVALID_EVENT');}
function stateContext(state,c,id){if(!object(state))fail('INVALID_DOCUMENT');if(state.organizationId!==undefined&&state.organizationId!==c.organizationId||state.workspaceId!==undefined&&state.workspaceId!==c.workspaceId||state.id!==undefined&&state.id!==id)fail('STATE_SCOPE_MISMATCH');}
async function audit(tx,c,id,action,revision){const auditId=randomUUID();await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)`,[auditId,c.organizationId,c.workspaceId,c.userId,action,id,JSON.stringify({revision})]);await tx.query(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES($1,$2,$3,$4,$5::jsonb,$6)`,[randomUUID(),c.organizationId,c.workspaceId,action,JSON.stringify({auditId,actorId:c.userId,resourceId:id,revision}),`audit:${auditId}`]);}
async function append(tx,c,id,revision,state){await tx.query(`INSERT INTO production_event_versions(organization_id,workspace_id,event_id,revision,state,digest,created_by) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7)`,[...scope(c),id,revision,json(state),recordDigest(state),c.userId]);}

/** Trusted transaction repository. The caller MUST enter an authorized transaction;
 * context is never copied from browser JSON. No transaction is opened here so commercial
 * changes, approval evidence and version appends can commit atomically together. */
export const eventRecords=Object.freeze({
 async list(tx,c,{limit=100,offset=0}={}){if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>10000)throw new TypeError('Invalid pagination');const r=await tx.query(`SELECT id,title,revision,created_at,updated_at FROM production_events WHERE organization_id=$1 AND workspace_id=$2 ORDER BY updated_at DESC,id LIMIT $3 OFFSET $4`,[...scope(c),limit,offset]);return r.rows;},
 async read(tx,c,id,{lock=false}={}){eventId(id);const r=await tx.query(`SELECT * FROM production_events WHERE organization_id=$1 AND workspace_id=$2 AND id=$3${lock?' FOR UPDATE':''}`,[...scope(c),id]);return r.rows[0]??null;},
 async create(tx,c,{id=randomUUID(),title,state}){eventId(id);if(typeof title!=='string'||!title.trim()||title.trim().length>200)fail('INVALID_TITLE');stateContext(state,c,id);const s=json(state);const r=await tx.query(`INSERT INTO production_events(organization_id,workspace_id,id,title,state,created_by,updated_by) VALUES($1,$2,$3,$4,$5::jsonb,$6,$6) ON CONFLICT DO NOTHING RETURNING *`,[...scope(c),id,title.trim(),s,c.userId]);if(!r.rows.length)fail('STALE_REVISION');await append(tx,c,id,1,state);await audit(tx,c,id,'event.create',1);return r.rows[0];},
 async save(tx,c,{id,expectedRevision,state}){eventId(id);if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)fail('INVALID_REVISION');stateContext(state,c,id);const s=json(state);const r=await tx.query(`UPDATE production_events SET state=$4::jsonb,revision=revision+1,updated_by=$5,updated_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND revision=$6 RETURNING *`,[...scope(c),id,s,c.userId,expectedRevision]);if(!r.rows.length)fail('STALE_REVISION');await append(tx,c,id,r.rows[0].revision,state);await audit(tx,c,id,'event.save',r.rows[0].revision);return r.rows[0];},
 async versions(tx,c,id){eventId(id);const r=await tx.query(`SELECT revision,state,digest,created_by,created_at FROM production_event_versions WHERE organization_id=$1 AND workspace_id=$2 AND event_id=$3 ORDER BY revision`,[...scope(c),id]);return r.rows;},
 async saveScene(tx,c,{eventId:id,sceneId,expectedRevision,document}){eventId(id);if(typeof sceneId!=='string'||!sceneId.trim()||sceneId.length>200||!Number.isSafeInteger(expectedRevision)||expectedRevision<0)fail('INVALID_SCENE');const s=json(document);if(document.id!==sceneId||document.organizationId!==undefined&&document.organizationId!==c.organizationId||document.eventId!==undefined&&document.eventId!==id)fail('STATE_SCOPE_MISMATCH');if(!await this.read(tx,c,id,{lock:true}))fail('NOT_FOUND');const r=await tx.query(`SELECT COALESCE(MAX(revision),0)::int AS revision FROM production_scene_versions WHERE organization_id=$1 AND workspace_id=$2 AND event_id=$3 AND scene_id=$4`,[...scope(c),id,sceneId]);if(r.rows[0].revision!==expectedRevision)fail('STALE_REVISION');const revision=expectedRevision+1;await tx.query(`INSERT INTO production_scene_versions(organization_id,workspace_id,event_id,scene_id,revision,document,digest,created_by) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,[...scope(c),id,sceneId,revision,s,recordDigest(document),c.userId]);await audit(tx,c,id,'scene.save',revision);return{sceneId,revision,document:JSON.parse(s)};},
 async readScene(tx,c,id,sceneId,revision){eventId(id);if(typeof sceneId!=='string'||!Number.isSafeInteger(revision)||revision<1)fail('INVALID_SCENE');const r=await tx.query(`SELECT * FROM production_scene_versions WHERE organization_id=$1 AND workspace_id=$2 AND event_id=$3 AND scene_id=$4 AND revision=$5`,[...scope(c),id,sceneId,revision]);return r.rows[0]??null;}
});

/** Own-auth boundary for app callers; NEVO bridge callers can use eventRecords inside
 * withNevoIdentity to enforce the intersection of BOTH authorities. */
export function createEventService(db,{authorize=withAuthorizedWorkspace}={}){const run=(token,c,action,fn)=>authorize(db,token,c,action,fn);return{
 list:(token,c)=>run(token,c,'design.read',(tx,ctx)=>eventRecords.list(tx,ctx)),
 read:(token,c,id)=>run(token,c,'design.read',(tx,ctx)=>eventRecords.read(tx,ctx,id)),
 create:(token,c,input)=>run(token,c,'design.edit',(tx,ctx)=>eventRecords.create(tx,ctx,input)),
 save:(token,c,input)=>run(token,c,'design.edit',(tx,ctx)=>eventRecords.save(tx,ctx,input)),
 versions:(token,c,id)=>run(token,c,'design.read',(tx,ctx)=>eventRecords.versions(tx,ctx,id)),
 saveScene:(token,c,input)=>run(token,c,'design.edit',(tx,ctx)=>eventRecords.saveScene(tx,ctx,input)),
 readScene:(token,c,id,sceneId,revision)=>run(token,c,'design.read',(tx,ctx)=>eventRecords.readScene(tx,ctx,id,sceneId,revision))
};}
