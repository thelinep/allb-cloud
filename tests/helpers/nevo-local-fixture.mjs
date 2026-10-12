/** Disposable E2E fixture ONLY. Never runs during application startup. */
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {createCipheriv,randomBytes} from 'node:crypto';
import {hashPassword} from '../../packages/auth-core/credentials.mjs';
const require=createRequire(new URL('../../apps/maataa-ui-route-source/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
export const fixtureId=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export async function provisionLocalFixture(){
 const directory=mkdtempSync(join(tmpdir(),'allb-next-e2e-'));
 const db=new PGlite(directory),key=randomBytes(32),password='Isolated browser fixture password 2026';
 const tenants=[],actors=[];
 try{
  for(const name of readdirSync(new URL('../../packages/enterprise-db/migrations/',import.meta.url)).filter(name=>/^\d+.*\.sql$/.test(name)).sort())await db.exec(readFileSync(new URL(`../../packages/enterprise-db/migrations/${name}`,import.meta.url),'utf8'));
  // These minimal source-model tables exercise the genuine identity bridge.
  // They are fixture schema, not a substitute for NEVO Prisma migrations.
  await db.exec('CREATE TABLE "Organization"(id text PRIMARY KEY);CREATE TABLE "User"(id text PRIMARY KEY,role text,status text,"organizationId" text,"emailVerifiedAt" timestamptz);');
  await db.exec(readFileSync(new URL('../../packages/nevo-identity-adapter/schema.sql',import.meta.url),'utf8'));
  const hash=await hashPassword(password);
  for(const t of [1,2]){
   const scope={organizationId:fixtureId(t),workspaceId:fixtureId(t+10)};
   tenants.push(scope);
   await db.query('INSERT INTO organizations(id,slug,name) VALUES($1,$2,$3)',[scope.organizationId,`tenant-${t}`,`Fixture Tenant ${t}`]);
   await db.query('INSERT INTO workspaces VALUES($1,$2,$3,$4)',[scope.organizationId,scope.workspaceId,'studio','Fixture Studio']);
   await db.query('INSERT INTO "Organization" VALUES($1)',[`fixture-org-${t}`]);
   for(const [index,nevoRole,role] of [[1,'PRODUCER','editor'],[2,'FINANCE','reviewer'],[3,'CLIENT','viewer'],[4,'ADMIN','admin']]){
    const userId=fixtureId(t*100+index),email=`${nevoRole.toLowerCase()}${t}@example.test`,secret=randomBytes(20);
    await db.query(`INSERT INTO identities(id,issuer,subject) VALUES($1,'maataa',$2)`,[userId,email]);
    await db.query('INSERT INTO memberships VALUES($1,$2,$3)',[scope.organizationId,userId,role]);
    await db.query('INSERT INTO auth_accounts(user_id,email,password_hash,verified_at) VALUES($1,$2,$3,now())',[userId,email,hash]);
    await db.query('INSERT INTO "User" VALUES($1,$2,$3,$4,now())',[`fixture-${t}-${index}`,nevoRole,'ACTIVE',`fixture-org-${t}`]);
    await db.query('INSERT INTO nevo_identity_links VALUES($1,$2,$3,$4,$5,NULL)',[userId,scope.organizationId,scope.workspaceId,`fixture-${t}-${index}`,`fixture-org-${t}`]);
    const factorId=fixtureId(t*1000+index),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    cipher.setAAD(Buffer.from(`allb-totp:${factorId}:${userId}`));
    const ciphertext=Buffer.concat([cipher.update(secret),cipher.final()]);
    const envelope=Buffer.from(JSON.stringify({iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')}));
    await db.query(`INSERT INTO auth_mfa_factors(id,user_id,kind,encrypted_secret,encryption_key_version,confirmed_at) VALUES($1,$2,'totp',$3,'v1',now())`,[factorId,userId,envelope]);
    actors.push({...scope,userId,email,password,role,nevoRole,totpSecretHex:secret.toString('hex')});
   }
  }
 }catch(error){await db.close();rmSync(directory,{recursive:true,force:true});throw error;}
 await db.close();
 return{directory,tenants,actors,env:{ALLB_LOCAL_DATABASE_DIR:directory,ALLB_TOTP_KEY_HEX:key.toString('hex'),ALLB_TOTP_KEY_VERSION:'v1'},cleanup:()=>rmSync(directory,{recursive:true,force:true})};
}
