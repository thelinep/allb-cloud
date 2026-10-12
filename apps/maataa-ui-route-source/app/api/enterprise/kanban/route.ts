import {envelope,errorEnvelope,assertVersion,validatedQuery} from '../../../../../../packages/api-contracts/contracts.mjs';
import snapshot from '../../../../lib/enterprise-execution-snapshot.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 try{assertVersion(request);validatedQuery(request.url,{});}catch(error){return errorEnvelope(error,request);}
 const headers={'Cache-Control':'no-store'};
 // Explicit opt-in for a local Node server. Workers use the bundled snapshot.
 const registryDirectory=process.env.ENTERPRISE_REGISTRY_DIR;
 if(!registryDirectory){
  return envelope({...snapshot,observedAt:new Date().toISOString(),source:'compiled-snapshot',agentActivity:'unverified'},request);
 }
 try {
  const {readFile}=await import('node:fs/promises');
  const path=await import('node:path');
  const [registry,execution]=await Promise.all(['enterprise-task-registry.json','enterprise-execution.json'].map(async name=>JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(registryDirectory,name),'utf8'))));
  return envelope({registry,execution,observedAt:new Date().toISOString(),source:'local-repository',agentActivity:'unverified'},request);
 } catch {
  return envelope({error:'Configured local registry unavailable',source:'local-repository',agentActivity:'unverified'},request,503);
 }
}
