const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=code=>{throw Object.assign(Error(code),{code});};
export async function assertAssetReferences(tx,c,refs){
 if(!Array.isArray(refs)||refs.length>100)fail('INVALID_ASSET_REFERENCES');
 for(const ref of refs){
  if(!uuid.test(ref?.assetId)||!Number.isInteger(ref.revision)||ref.revision<1)fail('INVALID_ASSET_REFERENCE');
  const r=await tx.query(`SELECT sha256 FROM asset_revisions WHERE organization_id=$1 AND workspace_id=$2 AND asset_id=$3 AND revision=$4 AND state='validated' FOR SHARE`,[c.organizationId,c.workspaceId,ref.assetId,ref.revision]);
  if(!r.rows.length)fail('ASSET_NOT_VALIDATED');
 }
 return true;
}
/** Resolve only our explicitly private local asset route. External/static branding
 * URLs remain ordinary configuration assets and are not claimed as managed. */
export function configAssetReferences(config,context){
 const refs=[];
 const layers=[config?.global,...Object.values(config?.brands??{}),...Object.values(config?.routes??{})];
 // Only media fields carry managed assets; copy/name strings cannot manufacture references.
 for(const layer of layers)for(const field of ['logo','favicon','hero']){
  const value=layer?.branding?.[field];if(typeof value!=='string'||!value)continue;
  let u;try{u=new URL(value,'https://local.invalid');}catch{continue;}
  let decodedPath;try{decodedPath=decodeURIComponent(u.pathname);}catch{fail('INVALID_ASSET_REFERENCE');}
  if(decodedPath!=='/api/integration/assets')continue;
  if(!value.startsWith('/')||value.startsWith('//')||u.pathname!=='/api/integration/assets')fail('ASSET_PRIVATE_URL_UNSUPPORTED');
  const fields=['organizationId','workspaceId','assetId','revision','derivative'];
  if([...u.searchParams.keys()].some(k=>!fields.includes(k)||u.searchParams.getAll(k).length!==1))fail('INVALID_ASSET_REFERENCE');
  if(u.searchParams.get('organizationId')!==context.organizationId||u.searchParams.get('workspaceId')!==context.workspaceId)fail('ASSET_SCOPE_MISMATCH');
  const assetId=u.searchParams.get('assetId'),revision=Number(u.searchParams.get('revision')),derivative=u.searchParams.get('derivative');
  if(!uuid.test(assetId)||!Number.isInteger(revision)||revision<1||derivative!==null&&!['preview','thumbnail'].includes(derivative))fail('INVALID_ASSET_REFERENCE');
  if(!refs.some(r=>r.assetId===assetId&&r.revision===revision))refs.push({assetId,revision});
 }
 if(refs.length>100)fail('INVALID_ASSET_REFERENCES');
 return refs;
}
