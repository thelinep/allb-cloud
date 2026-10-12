import {randomUUID,createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,unlink,readdir,stat} from 'node:fs/promises';
import {isAbsolute,join} from 'node:path';
import {decodeLocalImage} from '@allb/local-image-processor';
import {idempotentMutation} from '../api-contracts/contracts.mjs';
import {withAuthorizedWorkspace} from '../authorization/workspace.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=code=>{throw Object.assign(Error(code),{code});};
const hash=b=>createHash('sha256').update(b).digest('hex');
const key=()=>randomUUID();
export {assertAssetReferences,configAssetReferences} from './references.mjs';
import {assertAssetReferences} from './references.mjs';
export function createAssetStorage(db,{directory='',maxBytes=8*1024*1024,maxPixels=16000000}={}){
 if(!isAbsolute(directory??''))throw Error('Explicit absolute durable local storage directory required');
 if(!Number.isInteger(maxBytes)||maxBytes<1||!Number.isInteger(maxPixels)||maxPixels<1)throw Error('Invalid storage limits');
 const file=k=>{if(!uuid.test(k))fail('INVALID_OBJECT_KEY');return join(directory,k);};
 const authorized=(token,scope,action,fn)=>withAuthorizedWorkspace(db,token,scope,action,fn);
 return {
  inventory(token,scope,{limit=100,offset=0}={}){if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>10000)fail('INVALID_PAGINATION');return authorized(token,scope,'asset.read',async(tx,c)=>(await tx.query(`SELECT r.asset_id,r.revision,r.sha256,r.mime_type,r.byte_size,r.state,(SELECT count(*) FROM asset_reference_bindings b WHERE b.organization_id=r.organization_id AND b.workspace_id=r.workspace_id AND b.asset_id=r.asset_id AND b.revision=r.revision) AS reference_count FROM asset_revisions r WHERE organization_id=$1 AND workspace_id=$2 ORDER BY asset_id,revision LIMIT $3 OFFSET $4`,[c.organizationId,c.workspaceId,limit,offset])).rows);},
  retentionDryRun(token,scope,{olderThanHours=24}={}){
   if(!Number.isInteger(olderThanHours)||olderThanHours<24)fail('INVALID_RETENTION_POLICY');
   return authorized(token,scope,'membership.manage',async(tx,c)=>{
    const known=new Set((await tx.query('SELECT object_key FROM asset_revisions UNION SELECT object_key FROM asset_derivatives')).rows.map(r=>r.object_key));
    let orphanCount=0,orphanBytes=0;
    for(const name of await readdir(/*turbopackIgnore: true*/ directory).catch(e=>{if(e.code==='ENOENT')return [];throw e;})){if(!uuid.test(name)||known.has(name))continue;const info=await stat(file(name));if(info.isFile()&&info.mtimeMs<Date.now()-olderThanHours*3600000){orphanCount++;orphanBytes+=info.size;}}
    return {mode:'dry-run',minimumAgeHours:olderThanHours,orphanCount,orphanBytes,deletionPerformed:false,policy:'No referenced or revision-recorded objects are eligible; operator-approved external cleanup required'};
   });
  },
  /** @param {string} token @param {{organizationId:string,workspaceId:string}} scope @param {{assetId?:string,expectedRevision?:number,bytes?:Buffer,idempotencyKey?:string}} input */
  upload(token,scope,{assetId=undefined,expectedRevision=0,bytes=Buffer.alloc(0),idempotencyKey=undefined}={}){
   const requestedAssetId=assetId??null;
   if((assetId!==undefined&&!uuid.test(assetId))||!Number.isInteger(expectedRevision)||expectedRevision<0||!Buffer.isBuffer(bytes)||bytes.length===0||bytes.length>maxBytes)fail('INVALID_UPLOAD');
   return authorized(token,scope,'design.edit',async(tx,c)=>{
    const created=[];
    const perform=async()=>{
    assetId??=randomUUID();
    await tx.query(`INSERT INTO assets(organization_id,workspace_id,id,created_by) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,[c.organizationId,c.workspaceId,assetId,c.userId]);
    await tx.query(`SELECT id FROM assets WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 FOR UPDATE`,[c.organizationId,c.workspaceId,assetId]);
    const prior=await tx.query(`SELECT COALESCE(max(revision),0) AS revision FROM asset_revisions WHERE organization_id=$1 AND workspace_id=$2 AND asset_id=$3`,[c.organizationId,c.workspaceId,assetId]);
    if(Number(prior.rows[0].revision)!==expectedRevision)fail('STALE_REVISION');
    const revision=expectedRevision+1,objectKey=key();
    await mkdir(directory,{recursive:true,mode:0o700});
    try{
     await writeFile(file(objectKey),bytes,{flag:'wx',mode:0o600});created.push(objectKey);
     let mime='application/octet-stream',state='rejected',derivatives=[];
     const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
     const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
     const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
     try{
      if(!png&&!jpeg&&!webp)throw Error('unsupported signature');
      const decoded=await decodeLocalImage(bytes,maxPixels);
      mime=png?'image/png':jpeg?'image/jpeg':'image/webp';state='validated';
      for(const out of decoded){const dk=key();await writeFile(file(dk),out.bytes,{flag:'wx',mode:0o600});created.push(dk);derivatives.push({name:out.name,key:dk,sha256:hash(out.bytes),size:out.bytes.length,width:out.width,height:out.height});}
     }catch(error){if(error.code==='LOCAL_ASSET_PROCESSOR_UNSUPPORTED_RUNTIME'||error.code==='MODULE_NOT_FOUND')throw error;state='rejected';}
     await tx.query(`INSERT INTO asset_revisions VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[c.organizationId,c.workspaceId,assetId,revision,objectKey,hash(bytes),mime,bytes.length,state]);
     for(const d of derivatives)await tx.query(`INSERT INTO asset_derivatives VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[c.organizationId,c.workspaceId,assetId,revision,d.name,d.key,d.sha256,d.size,d.width,d.height]);
     await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,'asset.upload',$5,$6::jsonb)`,[key(),c.organizationId,c.workspaceId,c.userId,assetId,JSON.stringify({revision,state,sha256:hash(bytes)})]);
     await tx.query(`INSERT INTO outbox_events(id,organization_id,workspace_id,kind,payload,idempotency_key) VALUES($1,$2,$3,'asset.revision',$4::jsonb,$5)`,[key(),c.organizationId,c.workspaceId,JSON.stringify({assetId,revision,state,sha256:hash(bytes)}),`asset:${assetId}:${revision}`]);
     return {assetId,revision,state,sha256:hash(bytes),derivatives:derivatives.map(({name,width,height})=>({name,width,height}))};
    }catch(error){await Promise.all(created.map(k=>unlink(file(k)).catch(()=>{})));throw error;}
    };
    try{return idempotencyKey===undefined?await perform():await idempotentMutation(tx,c,idempotencyKey,{actorId:c.userId,assetId:requestedAssetId,expectedRevision,sha256:hash(bytes)},perform);}catch(error){await Promise.all(created.map(k=>unlink(file(k)).catch(()=>{})));throw error;}
   });
  },
  download(token,scope,{assetId,revision,derivative}={}){
   if(!uuid.test(assetId)||!Number.isInteger(revision)||!['preview','thumbnail',undefined].includes(derivative))fail('INVALID_ASSET_REFERENCE');
   return authorized(token,scope,'asset.read',async(tx,c)=>{
    const params=[c.organizationId,c.workspaceId,assetId,revision];
    const r=await tx.query(`SELECT object_key,sha256,mime_type FROM asset_revisions WHERE organization_id=$1 AND workspace_id=$2 AND asset_id=$3 AND revision=$4 AND state='validated'`,params);
    if(!r.rows.length)return null;
    let row=r.rows[0];
    if(derivative){const d=await tx.query(`SELECT object_key,sha256 FROM asset_derivatives WHERE organization_id=$1 AND workspace_id=$2 AND asset_id=$3 AND revision=$4 AND name=$5`,[...params,derivative]);if(!d.rows.length)return null;row={...d.rows[0],mime_type:'image/webp'};}
    const bytes=await readFile(file(row.object_key));if(hash(bytes)!==row.sha256)fail('ASSET_INTEGRITY_FAILURE');return {bytes,mime:row.mime_type,sha256:row.sha256};
   });
  },
  bind(token,scope,{refs,resourceKind,resourceId}){
   if(!['design-version','scene-version'].includes(resourceKind)||typeof resourceId!=='string'||resourceId.length>200)fail('INVALID_BINDING');
   return authorized(token,scope,'design.edit',async(tx,c)=>{await assertAssetReferences(tx,c,refs);for(const r of refs)await tx.query(`INSERT INTO asset_reference_bindings VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,[c.organizationId,c.workspaceId,r.assetId,r.revision,resourceKind,resourceId]);return true;});
  }
 };
}
