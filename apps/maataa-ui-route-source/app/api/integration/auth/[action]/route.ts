import {authEnvironment} from '../../../../../../../packages/auth-core/environment.mjs';
import {boundedJson,ContractError,envelope} from '../../../../../../../packages/api-contracts/contracts.mjs';
import {withNevoDatabase} from '../../../../../server/nevo-database';
import {login,logout,verifyTotp,AuthHttpError} from '../../../../../../../packages/auth-core/http.mjs';
import {sessionList,sessionRotate,sessionRevoke,beginEnrollment,confirmEnrollment,recoverMfa,revokeFactor,requestRecovery,completeRecovery,createInvitation,acceptInvitation} from '../../../../../../../packages/auth-core/lifecycle.mjs';
import {readSession} from '../../../../../../../packages/auth-core/sessions.mjs';
import {sessionCookie,clearSessionCookie} from '../../../../../../../packages/auth-core/policy.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const token=(request:Request)=>/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/.exec(request.headers.get('cookie')??'')?.[1]??'';
const responseFor=(request:Request,body:unknown,status=200,cookie?:string)=>{const result=envelope(body,request,status);if(cookie)result.headers.set('Set-Cookie',cookie);return result;};
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 const response=(body:unknown,status=200,cookie?:string)=>responseFor(request,body,status,cookie);
 const {action}=await params;if(!['login','logout','mfa','rotate','revoke','enroll','confirm','recover-mfa','revoke-factor','request-recovery','complete-recovery','invite','accept-invite'].includes(action))return response({error:'NOT_FOUND'},404);
 let environment;try{environment=authEnvironment();}catch{return response({error:'AUTH_UNAVAILABLE'},503);}
 const expected=environment.origin;
 if(!expected||request.headers.get('origin')!==expected||new URL(request.url).origin!==expected)return response({error:'ORIGIN_REJECTED'},403);
 let input;try{input=await boundedJson(request,{maxBytes:4096});}catch(error:any){return error instanceof ContractError?response({error:error.code},error.status):response({error:'INVALID_REQUEST'},400);}
 try{return await withNevoDatabase(async db=>{
  if(action==='login'){const session=await login(db,input);return response({authenticated:true},200,sessionCookie(session.token,{expiresAt:session.expiresAt}));}
  if(action==='logout'){await logout(db,token(request));return response({loggedOut:true},200,clearSessionCookie());}
  const options={key:environment.key,keyVersion:environment.keyVersion};
  if(action==='rotate'){const session=await sessionRotate(db,token(request));return response({rotated:true},200,sessionCookie(session.token,{expiresAt:session.expiresAt}));}
  if(action==='revoke'){const result=await sessionRevoke(db,token(request),input);return response(result,200,result.all||result.current?clearSessionCookie():undefined);}
  if(action==='enroll')return response(await beginEnrollment(db,token(request),options));
  if(action==='confirm')return response(await confirmEnrollment(db,token(request),input,options));
  if(action==='recover-mfa')return response(await recoverMfa(db,token(request),input));
  if(action==='revoke-factor')return response(await revokeFactor(db,token(request),input),200,clearSessionCookie());
  if(action==='request-recovery')return response(await requestRecovery(db,input,options),202);
  if(action==='complete-recovery')return response(await completeRecovery(db,input),200,clearSessionCookie());
  if(action==='invite')return response(await createInvitation(db,token(request),input,options),202);
  if(action==='accept-invite')return response(await acceptInvitation(db,token(request),input));
  return response(await verifyTotp(db,token(request),input?.code,options));
 });}catch(error:any){return error instanceof AuthHttpError?response({error:error.code},error.status):response({error:'AUTH_UNAVAILABLE'},503);}
}
export async function GET(request:Request,{params}:{params:Promise<{action:string}>}){
 const response=(body:unknown,status=200,cookie?:string)=>responseFor(request,body,status,cookie);
 const action=(await params).action;
 if(!['session','sessions','factors'].includes(action))return response({error:'NOT_FOUND'},404);
 if(!token(request))return response({error:'UNAUTHENTICATED'},401);
 try{return await withNevoDatabase(async db=>{if(action==='sessions')return response(await sessionList(db,token(request)));const session=await readSession(db,token(request));if(!session)return response({error:'UNAUTHENTICATED'},401);
 if(action==='factors'){const factors=await db.query('SELECT id,kind,confirmed_at,created_at FROM auth_mfa_factors WHERE user_id=$1 AND confirmed_at IS NOT NULL AND revoked_at IS NULL',[session.user_id]);return response({factors:factors.rows});}
 const workspaces=await db.query(`SELECT m.organization_id AS "organizationId",w.id AS "workspaceId",w.name,m.role FROM memberships m JOIN workspaces w ON w.organization_id=m.organization_id WHERE m.user_id=$1 AND (to_jsonb(m)->>'revoked_at') IS NULL ORDER BY w.name`,[session.user_id]);
 return response({authenticated:true,userId:session.user_id,mfaVerifiedAt:session.mfa_verified_at,workspaces:workspaces.rows});
 });}catch{return response({error:'AUTH_UNAVAILABLE'},503);}
}
