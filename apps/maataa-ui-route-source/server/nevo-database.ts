import {observe} from '../../../packages/observability/local.mjs';
import {Client} from 'pg';
import {isAbsolute,resolve} from 'node:path';
type Database={query:(sql:string,values?:unknown[])=>Promise<any>;transaction:<T>(run:(tx:Database)=>Promise<T>)=>Promise<T>};
type LocalHandle={db:Promise<any>;tail:Promise<void>};
const localGlobal=globalThis as typeof globalThis & {allbLocalDatabases?:Map<string,LocalHandle>};
/** Explicit opt-in local validation backend. It is never selected when PostgreSQL
 * fails and never provisions records or migrations automatically. */
async function withLocalDatabase<T>(directory:string,run:(db:Database)=>Promise<T>):Promise<T>{
 if(process.versions.workerd||process.env.ENVIRONMENT==='integration-local'||'WebSocketPair' in globalThis)throw new Error('NEVO_LOCAL_DATABASE_UNSUPPORTED_RUNTIME');
 if(!isAbsolute(directory)||directory.includes('\0'))throw new Error('NEVO_DATABASE_UNAVAILABLE');
 const key=resolve(directory);
 const handles=localGlobal.allbLocalDatabases??=new Map();
 let handle=handles.get(key);
 if(!handle){handle={db:import('@electric-sql/pglite').then(({PGlite})=>new PGlite(key)),tail:Promise.resolve()};handles.set(key,handle);}
 // Serialize complete request transactions, including their authorization reads.
 // Local mode supports one Next process; multiple writers/processes are unsupported.
 const previous=handle.tail;
 let release!:()=>void;
 handle.tail=new Promise<void>(r=>{release=r;});
 await previous;
 try{
  const engine=await handle.db;
  const wrap=(connection:any):Database=>({query:(sql,values)=>connection.query(sql,values),transaction:async fn=>engine.transaction((tx:any)=>fn(wrap(tx)))});
  return await run(wrap(engine));
 }finally{release();}
}
/** Explicit server configuration only; no browser supplied connection or fallback. */
export async function withNevoDatabase<T>(run:(db:Database)=>Promise<T>):Promise<T>{
 // Cloudflare-only production: legacy PostgreSQL/local adapters are validation
 // tools, never a Worker fallback while the native D1 application port is open.
 if(process.versions.workerd||'WebSocketPair' in globalThis)throw Object.assign(new Error('NEVO_DATABASE_UNAVAILABLE'),{code:'NEVO_DATABASE_UNAVAILABLE',status:503});
 const connectionString=process.env.ALLB_NEVO_DATABASE_URL;
 const localDirectory=process.env.ALLB_LOCAL_DATABASE_DIR;
 if(connectionString&&localDirectory)throw new Error('NEVO_DATABASE_AMBIGUOUS');
 if(localDirectory)return observe('database-local',()=>withLocalDatabase(localDirectory,run));
 if(!connectionString)throw new Error('NEVO_DATABASE_UNAVAILABLE');
 const url=new URL(connectionString);
 if(!['postgres:','postgresql:'].includes(url.protocol))throw new Error('NEVO_DATABASE_UNAVAILABLE');
 const client=new Client({connectionString,connectionTimeoutMillis:5000,statement_timeout:5000});
 try{
  await client.connect();
  const db:Database={query:(sql,values)=>client.query(sql,values),transaction:async runTransaction=>{await client.query('BEGIN');try{const value=await runTransaction(db);await client.query('COMMIT');return value;}catch(error){await client.query('ROLLBACK');throw error;}}};
  return await observe('database-postgres',()=>run(db));
 }finally{await client.end();}
}
