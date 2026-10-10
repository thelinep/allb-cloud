import {randomBytes,scrypt as callbackScrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(callbackScrypt);
const options={N:131072,r:8,p:1,maxmem:256*1024*1024};
const validInput=value=>typeof value==='string'&&Buffer.byteLength(value,'utf8')<=1024;
export async function hashPassword(password){
 if(!validInput(password)||[...password].length<15)throw Error('Password must contain at least 15 characters and at most 1024 UTF-8 bytes.');
 const salt=randomBytes(16);
 const key=await scrypt(password,salt,64,options);
 return `scrypt:v1:${salt.toString('hex')}:${key.toString('hex')}`;
}
export async function verifyPassword(password,stored){
 if(!validInput(password)||typeof stored!=='string')return false;
 const match=/^scrypt:v1:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored);
 if(!match)return false;
 const actual=await scrypt(password,Buffer.from(match[1],'hex'),64,options);
 return timingSafeEqual(actual,Buffer.from(match[2],'hex'));
}
export function newSessionToken(){return randomBytes(32).toString('base64url');}
export function sessionTokenHash(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 return createHash('sha256').update(token).digest('hex');
}
const dummyHash=`scrypt:v1:${'0'.repeat(32)}:${'0'.repeat(128)}`;
export async function verifyAccountCredentials(db,email,password){
 if(typeof email!=='string'||email.length>254||!validInput(password))return null;
 const normalized=email.trim().toLowerCase();
 const result=await db.query('SELECT user_id,password_hash,credential_version,verified_at,disabled_at FROM auth_accounts WHERE email=$1',[normalized]);
 const account=result.rows[0];
 const matched=await verifyPassword(password,account?.password_hash??dummyHash);
 if(!matched||!account||!account.verified_at||account.disabled_at)return null;
 return {userId:account.user_id,credentialVersion:account.credential_version};
}
