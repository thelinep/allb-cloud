import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),host=path.join(root,'apps/maataa-ui-route-source'),require=createRequire(path.join(host,'package.json')),{chromium}=require('@playwright/test');
const base='http://127.0.0.1:3196',checks=[];let browser,logs='';
const server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H','127.0.0.1','-p','3196'],{cwd:host,stdio:['ignore','pipe','pipe']});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
try{
 for(let i=0;i<40;i++){try{if((await fetch(base+'/integration/workflow',{signal:AbortSignal.timeout(1000)})).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({executablePath:process.env.ALLB_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const missing=await page.goto(base+'/unknown-ui-recovery-check');assert.equal(missing.status(),404);await page.getByRole('heading',{name:'Page not found',exact:true}).waitFor();await page.getByRole('link',{name:'Return to ALLB home',exact:true}).click();await page.waitForURL(base+'/');checks.push(`${width}: real404 home recovery`);
 const workspace={organizationId:'org-ui-fixture',workspaceId:'workspace-ui-fixture',name:'UI failure-injection fixture',role:'admin'};
 let event={id:'event-ui-fixture',revision:1,state:{inquiry:{title:'Conflict fixture'},status:'inquiry',quotes:[]}};let mutations=0,release;
 await page.route('**/api/integration/auth/session',r=>r.fulfill({json:{userId:'fixture-user',workspaces:[workspace]}}));
 await page.route('**/api/integration/nevo/events?*',r=>r.fulfill({json:r.request().url().includes('eventId=')?{event}:{events:[event]}}));
 await page.route('**/api/integration/nevo/events/event-ui-fixture/commercial',async r=>{mutations++;await new Promise(resolve=>release=resolve);await r.fulfill({status:409,json:{error:'REVISION_CONFLICT'}});});
 await page.goto(base+'/integration/workflow');await page.getByRole('button').filter({hasText:'Conflict fixture'}).click();await page.getByRole('tab',{name:'Scene',exact:true}).click();await page.getByLabel('Venue reference').fill('unsaved-input');await page.getByLabel('Venue version').fill('v1');await page.getByRole('button',{name:'Save scene revision',exact:true}).click();await page.getByRole('status').filter({hasText:'Saving or loading'}).waitFor();assert.equal(await page.locator('main.nevo-workflow').getAttribute('aria-busy'),'true');assert.equal(await page.getByRole('button',{name:'Save scene revision',exact:true}).isDisabled(),true);release();await page.getByRole('alert').filter({hasText:'REVISION CONFLICT'}).waitFor();assert.equal(await page.getByLabel('Venue reference').inputValue(),'unsaved-input');event={...event,revision:2};await page.getByRole('button',{name:'Recover latest saved revision',exact:true}).click();await page.getByRole('status').filter({hasText:'Latest saved revision loaded'}).waitFor();assert.equal(mutations,1);assert.equal(await page.getByLabel('Venue reference').inputValue(),'unsaved-input');checks.push(`${width}: visible busy, duplicate disabled,409 input preserved,latest revision recovery,no automatic mutation retry`);
 await page.getByRole('tab',{name:'Scene',exact:true}).focus();await page.keyboard.press('End');assert.equal(await page.getByRole('tab',{name:'Handoff',exact:true}).getAttribute('aria-selected'),'true');await page.keyboard.press('Home');assert.equal(await page.getByRole('tab',{name:'Inquiry',exact:true}).getAttribute('aria-selected'),'true');checks.push(`${width}: keyboard Home/End workflow tabs`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const violations=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));assert.deepEqual(violations,[]);checks.push(`${width}: overflow and axe pass`);await page.close();
 }
 await mkdir(path.join(root,'artifacts/nevo-ui-recovery'),{recursive:true});await writeFile(path.join(root,'artifacts/nevo-ui-recovery/results.json'),JSON.stringify({checks,evidenceMode:'production_next_browser_with_explicit_UI_failure_injection_not_backend_authorization'},null,2));console.log(JSON.stringify({checks}));
}finally{await browser?.close();server.kill('SIGTERM');}
