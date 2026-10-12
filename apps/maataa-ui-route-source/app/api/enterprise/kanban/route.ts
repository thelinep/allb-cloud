import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 try {
  const root=resolve(process.cwd(),'../../docs');
  const [registry,execution]=await Promise.all(['enterprise-task-registry.json','enterprise-execution.json'].map(name=>readFile(resolve(root,name),'utf8').then(JSON.parse)));
  return Response.json({registry,execution},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Execution registry unavailable'},{status:503});}
}
