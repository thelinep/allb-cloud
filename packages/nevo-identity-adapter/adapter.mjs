import {withAuthorizedWorkspace, AuthorizationError, permissionMatrix} from '../authorization/workspace.mjs';
import {readSession} from '../auth-core/sessions.mjs';
import {mfaIsFresh} from '../auth-core/policy.mjs';

// Deliberately conservative. NEVO's platform-level SUPER_ADMIN is never ALLB owner.
export const nevoRoleMap=Object.freeze({SUPER_ADMIN:'admin',ADMIN:'admin',PRODUCER:'editor',CLIENT:'viewer',FINANCE:'reviewer',VENDOR:'viewer',VENUE:'viewer',ARTIST:'viewer',GUEST:'viewer',SPONSOR:'viewer',STAFF:'viewer',MEDIA:'viewer'});
const privileged=new Set(['SUPER_ADMIN','ADMIN','FINANCE']);
const deny=code=>{throw new AuthorizationError(code);};

/** Server-only: same PostgreSQL transaction must contain ALLB and NEVO records.
 * NEVO cookies/role headers are never accepted as ALLB credentials.
 * operation is application code, never a browser-supplied callback.
 */
export async function withNevoIdentity(db,token,scope,action,operation,{now=new Date()}={}) {
 if(typeof operation!=='function')throw new TypeError('Trusted server operation required');
 return withAuthorizedWorkspace(db,token,scope,action,async(tx,context)=>{
  // Mapping is provisioned explicitly; no guessing by email, UUID conversion,
  // or client-provided organization/user IDs. CUID values remain opaque.
  const result=await tx.query(`SELECT n.id,n.role,n.status,n."organizationId",n."emailVerifiedAt"
 FROM nevo_identity_links l JOIN "User" n ON n.id=l.nevo_user_id
 WHERE l.allb_user_id=$1 AND l.allb_organization_id=$2 AND l.allb_workspace_id=$3
 AND l.disabled_at IS NULL AND n."organizationId"=l.nevo_organization_id
 FOR SHARE OF l,n`,[context.userId,context.organizationId,context.workspaceId]);
  if(result.rows.length!==1)deny('NEVO_IDENTITY_UNAVAILABLE');
  const user=result.rows[0],mapped=nevoRoleMap[user.role];
  if(user.status!=='ACTIVE'||!user.emailVerifiedAt)deny('NEVO_IDENTITY_UNAVAILABLE');
  if(!mapped||!permissionMatrix[mapped]?.includes(action))deny('FORBIDDEN');
  if(privileged.has(user.role)) {
   const session=await readSession(tx,token,{now});
   const authenticatedAt=new Date(session?.authenticated_at).getTime();
   const mfaAt=new Date(session?.mfa_verified_at).getTime();
   if(!Number.isFinite(authenticatedAt)||authenticatedAt>now.getTime()||mfaAt<authenticatedAt||!mfaIsFresh(session,{now}))deny('MFA_REQUIRED');
  }
  const identity=Object.freeze({...context,nevoUserId:user.id,nevoOrganizationId:user.organizationId,nevoRole:user.role,mappedRole:mapped});
  return operation(tx,identity);
 },{now});
}
