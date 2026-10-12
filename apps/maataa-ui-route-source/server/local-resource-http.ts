import {withNevoDatabase} from './nevo-database';
import {withAuthorizedWorkspace} from '../../../packages/authorization/workspace.mjs';
import {durableLimit,ContractError} from '../../../packages/api-contracts/contracts.mjs';
export function sessionToken(request:Request){const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];if(!token)throw new ContractError('UNAUTHENTICATED',401);return token;}
/** Commit quota before business validation; authority is resolved again by service. */
export async function localResourceRate(request:Request,scope:any,action:string,family:string){const token=sessionToken(request);const denial=await withNevoDatabase(db=>withAuthorizedWorkspace(db,token,scope,action,async(tx:any,c:any)=>{try{await durableLimit(tx,`${family}:${c.organizationId}:${c.workspaceId}:${c.userId}`,{limit:60});return null;}catch(e){if((e as any).code==='RATE_LIMITED')return e;throw e;}}));if(denial)throw denial;return token;}
