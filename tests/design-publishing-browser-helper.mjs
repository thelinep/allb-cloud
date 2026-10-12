import assert from 'node:assert/strict';
/** Requires three already authenticated real browser pages and a provisioned workspace.
 * Does not seed records or fabricate session authority. */
export async function verifyDesignPublishingBrowser({editor,reviewer,publisher,organizationId,workspaceId,config}) {
 const request=async(page,body)=>page.evaluate(async body=>{const r=await fetch('/api/integration/design',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return{status:r.status,value:await r.json()};},{organizationId,workspaceId,...body});
 for(const path of ['/studio/themes','/studio/branding']){await editor.goto(new URL(path,editor.url()).href);await editor.getByRole('heading',{name:'Workspace server publishing'}).waitFor();await editor.getByLabel('Organization UUID',{exact:true}).fill(organizationId);await editor.getByLabel('Workspace UUID',{exact:true}).fill(workspaceId);await editor.getByRole('button',{name:'Load workspace records'}).click();await editor.getByText('list completed by the authenticated server.').waitFor();}
 const draftId=crypto.randomUUID();let r=await request(editor,{action:'save',id:draftId,config,expectedRevision:0});assert.equal(r.status,200);assert.equal(r.value.revision,1);
 const stale=await request(editor,{action:'save',id:draftId,config,expectedRevision:0});assert.equal(stale.status,409);
 r=await request(editor,{action:'submit',draftId,expectedRevision:1});assert.equal(r.status,200);const versionId=r.value.id;
 r=await request(reviewer,{action:'preview',versionId});assert.equal(r.status,200);assert.deepEqual(r.value.config,config);
 const list=await request(publisher,{action:'list'});assert.equal(list.status,200);const generation=list.value.publications.find(x=>x.route==='/allb/nevo')?.generation??0;
 r=await request(publisher,{action:'publish',versionId,route:'/allb/nevo',expectedGeneration:generation});assert.equal(r.value.error,'approval_required');
 r=await request(reviewer,{action:'review',versionId,decision:'approved',note:'Browser-verified version review'});assert.equal(r.status,200);
 r=await request(publisher,{action:'publish',versionId,route:'/allb/nevo',expectedGeneration:generation});assert.equal(r.status,200);assert.equal(r.value.generation,generation+1);
 const revised=structuredClone(config);revised.global.branding.tagline='Second review version';
 r=await request(editor,{action:'save',id:draftId,config:revised,expectedRevision:1});assert.equal(r.status,200);
 r=await request(editor,{action:'submit',draftId,expectedRevision:2});const secondId=r.value.id;
 r=await request(reviewer,{action:'review',versionId:secondId,decision:'approved'});assert.equal(r.status,200);
 r=await request(publisher,{action:'publish',versionId:secondId,route:'/allb/nevo',expectedGeneration:generation+1});assert.equal(r.status,200);
 r=await request(publisher,{action:'rollback',versionId,route:'/allb/nevo',expectedGeneration:generation+2});assert.equal(r.status,200);assert.equal(r.value.version_id,versionId);
 r=await request(editor,{action:'publish',versionId,route:'/allb/nevo',expectedGeneration:generation+3});assert.equal(r.status,403);
 const contract=async(page,body,headers={})=>page.evaluate(async({body,headers})=>{const r=await fetch('/api/integration/design',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});return{status:r.status,value:await r.json(),requestId:r.headers.get('x-request-id'),etag:r.headers.get('etag')};},{body:{organizationId,workspaceId,...body},headers});
 const repeat={action:'save',id:crypto.randomUUID(),config,expectedRevision:0},key='design-browser-idempotency';
 const first=await contract(editor,repeat,{'Idempotency-Key':key});assert.equal(first.status,200);assert.equal(first.etag,'"rev-1"');
 const replay=await contract(editor,repeat,{'Idempotency-Key':key});assert.equal(replay.status,200);assert.equal(replay.value.revision,1);
 assert.equal((await contract(editor,{...repeat,expectedRevision:1},{'Idempotency-Key':key})).status,409);
 assert.equal((await contract(editor,{...repeat,expectedRevision:1},{'If-Match':'"rev-2"'})).status,412);
 const malformed=await contract(editor,{...repeat,unexpected:'denied'},{'X-Request-ID':'design-request-correlation'});assert.equal(malformed.status,400);assert.equal(malformed.requestId,'design-request-correlation');assert.equal(malformed.value.requestId,'design-request-correlation');
 assert.equal((await contract(editor,repeat,{'X-API-Version':'99'})).status,426);
 const bounded=await contract(editor,{action:'list',limit:1,offset:0});assert.equal(bounded.value.drafts.length,1);assert.equal(bounded.value.pagination.limit,1);
 const deniedQuery=await editor.evaluate(async scope=>{const query=new URLSearchParams(scope);query.set('limit','101');return(await fetch('/api/integration/design?'+query)).status;},{organizationId,workspaceId});assert.equal(deniedQuery,400);
 return{checks:24,versionId,draftId,generation:generation+3};
}
