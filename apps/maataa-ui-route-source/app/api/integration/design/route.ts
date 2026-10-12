import {withNevoDatabase} from '../../../../server/nevo-database';
import {parseConfig} from '../../../../../../packages/design-config/config';
import {createPublishingService} from '../../../../../../packages/design-publishing/service.mjs';
import {withAuthorizedWorkspace} from '../../../../../../packages/authorization/workspace.mjs';
import {boundedJson,envelope,durableLimit,validateObject,pagination,expectedRevision,etag,ContractError,assertVersion} from '../../../../../../packages/api-contracts/contracts.mjs';
import {observe} from '../../../../../../packages/observability/local.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const revision=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0;
const optional=(check:(v:unknown)=>boolean)=>(v:unknown)=>v===undefined||check(v);
const common={action:(v:unknown)=>typeof v==='string',organizationId:uuid,workspaceId:uuid};
const fields:Record<string,Record<string,(v:unknown)=>boolean>>={
 save:{id:uuid,config:v=>!!v&&typeof v==='object',expectedRevision:revision},
 submit:{draftId:uuid,expectedRevision:revision},
 review:{versionId:uuid,decision:v=>v==='approved'||v==='rejected',note:optional(v=>typeof v==='string'&&v.length<=2000)},
 publish:{versionId:uuid,route:v=>typeof v==='string'&&v.length<=500&&/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(v),expectedGeneration:revision},
 rollback:{versionId:uuid,route:v=>typeof v==='string'&&v.length<=500&&/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(v),expectedGeneration:revision},
 preview:{versionId:uuid},list:{limit:optional(v=>Number.isInteger(v)&&Number(v)>=1&&Number(v)<=100),offset:optional(v=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<=10000)},
};
function error(e:unknown,request:Request){const value=e as {code?:string;status?:number};const code=value.code&&/^[a-zA-Z_]+$/.test(value.code)?value.code:'database_unavailable';const lower=code.toLowerCase();const status=value.status??(lower==='unauthenticated'?401:['forbidden','mfa_required'].includes(lower)?403:lower.startsWith('stale')?409:lower==='not_found'?404:lower==='database_unavailable'?503:400);return envelope({error:code},request,status);}
async function run(request:Request,body:any){
 if(!Object.hasOwn(fields,body.action))throw new ContractError('INVALID_ACTION');
 validateObject(body,{...common,...fields[body.action]});
 const sessionToken=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];if(!sessionToken)throw new ContractError('unauthenticated',401);
 if(request.headers.has('if-match')){const revision=expectedRevision(request);if((body.expectedRevision??body.expectedGeneration)!==revision)throw new ContractError('REVISION_PRECONDITION_MISMATCH',412);}
 return withNevoDatabase(async db=>{
  const permission=body.action==='review'?'design.review':['publish','rollback'].includes(body.action)?'design.publish':['save','submit'].includes(body.action)?'design.edit':'design.read';
  const context=await withAuthorizedWorkspace(db,sessionToken,body,permission,(_tx:any,c:any)=>c);
  await durableLimit(db,`design:${context.organizationId}:${context.workspaceId}:${context.userId}:${request.method}`,{limit:request.method==='GET'?120:60});
  const service=createPublishingService(db,{validateConfig:parseConfig,minimumApprovals:Number(process.env.ALLB_DESIGN_MIN_APPROVALS??1),requestContext:{key:request.headers.get('idempotency-key'),input:{method:request.method,path:new URL(request.url).pathname,body}}});
  const scope={organizationId:body.organizationId,workspaceId:body.workspaceId,sessionToken};
  switch(body.action){case 'save':return service.saveDraft(scope,body);case 'submit':return service.submit(scope,body);case 'review':return service.review(scope,body);case 'publish':return service.publish(scope,body);case 'rollback':return service.rollback(scope,body);case 'preview':return service.preview(scope,body.versionId);default:return service.list(scope,body);}
 });
}
function result(value:any,request:Request){const response=envelope(value,request);const revision=value.revision??value.generation;if(Number.isInteger(revision)&&revision>0)response.headers.set('ETag',etag(revision));return response;}
export async function GET(request:Request){return observe('design-api',async()=>{try{assertVersion(request);const u=new URL(request.url);if([...u.searchParams.keys()].some(k=>!['organizationId','workspaceId','limit','offset'].includes(k)||u.searchParams.getAll(k).length!==1))throw new ContractError('INVALID_QUERY');return result(await run(request,{organizationId:u.searchParams.get('organizationId'),workspaceId:u.searchParams.get('workspaceId'),action:'list',...pagination(request.url)}),request);}catch(e){return error(e,request);}}, {request});}
export async function POST(request:Request){return observe('design-api',async()=>{try{return result(await run(request,await boundedJson(request)),request);}catch(e){return error(e,request);}}, {request});}
