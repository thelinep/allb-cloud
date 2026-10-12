import {withNevoDatabase} from '../../../../server/nevo-database';
import {withAuthorizedWorkspace} from '../../../../../../packages/authorization/workspace.mjs';
import {envelope,errorEnvelope,validatedQuery,assertVersion,ContractError} from '../../../../../../packages/api-contracts/contracts.mjs';
import {snapshot,observe} from '../../../../../../packages/observability/local.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export async function GET(request:Request){return observe('diagnostics-api',async()=>{try{
 assertVersion(request);const scope=validatedQuery(request.url,{organizationId:uuid,workspaceId:uuid});
 const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];if(!token)throw new ContractError('UNAUTHENTICATED',401);
 const context=await withNevoDatabase(db=>withAuthorizedWorkspace(db,token,scope,'membership.manage',async(_tx:any,context:any)=>context));
 const operators=(process.env.ALLB_DIAGNOSTICS_ADMIN_IDS??'').split(',').filter(Boolean);if(!operators.length||operators.some(id=>!uuid(id)))throw new ContractError('OPERATOR_POLICY_REQUIRED',503);if(!operators.includes(context.userId))throw new ContractError('OPERATOR_ACCESS_DENIED',403);
 return envelope({metrics:snapshot(),runtime:{localDatabaseConfigured:!!process.env.ALLB_LOCAL_DATABASE_DIR,postgresConfigured:!!process.env.ALLB_NEVO_DATABASE_URL,localAssetsConfigured:!!process.env.ALLB_LOCAL_ASSET_DIR,externalMonitoring:false}},request);
 }catch(error){return errorEnvelope(error,request);}}, {request});}
