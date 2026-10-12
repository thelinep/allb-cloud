import {authorizeWorkspace} from '../../../packages/authorization/workspace.mjs';
import {boundedJson,envelope,durableLimit,idempotentMutation,etag,expectedRevision,errorEnvelope} from '../../../packages/api-contracts/contracts.mjs';
import {withNevoDatabase} from './nevo-database';
import {withNevoIdentity} from '../../../packages/nevo-identity-adapter/adapter.mjs';
type Context={userId:string;organizationId:string;workspaceId:string;nevoRole:string};
export function commercialResponse(value:any,status=200,request?:Request){const response=envelope(value,request,status);if(value?.event?.revision)response.headers.set('ETag',etag(value.event.revision));return response;}
export function commercialError(error:unknown,request?:Request){return errorEnvelope(error,request,{fallback:'NEVO_DATABASE_UNAVAILABLE'});}
export function requireSameOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw Object.assign(new Error('ORIGIN_DENIED'),{code:'ORIGIN_DENIED',status:403});}
export async function commercialBody(request:Request){return boundedJson(request);}
export function authorizedCommercial<T>(request:Request,scope:Record<string,unknown>,action:string,run:(tx:any,context:Context)=>Promise<T>):Promise<T>{const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];if(!token)return Promise.reject(Object.assign(new Error('UNAUTHENTICATED'),{code:'UNAUTHENTICATED',status:401}));return withNevoDatabase(async db=>{
 const identity=await withNevoIdentity(db,token,scope,action,(_tx:any,c:Context)=>c);
 // Commit the count independently; rejected business mutations cannot erase it.
 await durableLimit(db,`${identity.organizationId}:${identity.workspaceId}:${identity.userId}:${request.method}`,{limit:request.method==='GET'?120:60});
 // Re-resolve after committing the limiter: revocation cannot race cached authority.
 return withNevoIdentity(db,token,scope,action,run);
 });}
export function commercialRevision(request:Request,body:any){if(request.headers.has('if-match')){const revision=expectedRevision(request);if(body.expectedRevision!==revision)throw Object.assign(new Error('REVISION_PRECONDITION_MISMATCH'),{code:'REVISION_PRECONDITION_MISMATCH',status:412});return revision;}return body.expectedRevision;}
export function commercialMutation<T>(request:Request,body:any,tx:any,context:Context,run:()=>Promise<T>):Promise<T>{const key=request.headers.get('idempotency-key');if(!key)return run();return idempotentMutation(tx,context,key,{actorId:context.userId,method:request.method,path:new URL(request.url).pathname,body},run);}

/** Commit rate counts before domain services open their own re-authorized transactions. */
export function rateWorkspaceRequest<T>(request:Request,scope:any,action:string,run:(db:any,token:string)=>Promise<T>):Promise<T>{const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-maataa-session=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];if(!token)return Promise.reject(Object.assign(new Error('UNAUTHENTICATED'),{code:'UNAUTHENTICATED',status:401}));return withNevoDatabase(async db=>{const identity=await authorizeWorkspace(db,token,scope,action);await durableLimit(db,`${identity.organizationId}:${identity.workspaceId}:${identity.userId}:${request.method}`,{limit:request.method==='GET'?120:60});return run(db,token);});}
