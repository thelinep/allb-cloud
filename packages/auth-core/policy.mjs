// Cookie policy assumes HTTPS. No development weakening is silently applied.
export const SESSION_COOKIE='__Host-maataa-session';
export function sessionCookie(token,{expiresAt}={}){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token)||!(expiresAt instanceof Date)||!Number.isFinite(expiresAt.getTime()))throw Error('Valid session token and expiry required');
 return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}
export function clearSessionCookie(){return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;}
export function requiresMfa(roles){
 if(!Array.isArray(roles)||roles.some(role=>typeof role!=='string'))throw Error('Trusted server roles required');
 return roles.some(role=>['owner','admin','publisher'].includes(role));
}
export function mfaIsFresh(session,{now=new Date(),maxAgeSeconds=900}={}){
 if(!Number.isInteger(maxAgeSeconds)||maxAgeSeconds<1||maxAgeSeconds>3600)throw Error('Invalid MFA freshness policy');
 if(!session?.mfa_verified_at)return false;
 const timestamp=new Date(session.mfa_verified_at).getTime(),age=now.getTime()-timestamp;
 return Number.isFinite(age)&&age>=0&&age<maxAgeSeconds*1000;
}
