import {test,expect} from '@playwright/test';
import axe from 'axe-core';
import fs from 'node:fs';
import {defaults} from '../../../../packages/design-config/config';
const manifest:{concreteRoutes:string[]}=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
test('Studio applies theme and route branding to the actual landing, then survives reload',async({page})=>{
 await page.goto('/studio/themes');
 await page.getByLabel('Scope',{exact:true}).selectOption('route');
 await page.getByLabel('Route',{exact:true}).selectOption('/allb/nevo');
 await page.getByLabel('Preset',{exact:true}).selectOption('NEVO midnight');
 expect(await page.evaluate(()=>localStorage.getItem('allb.design-studio.active.v1'))).toBeNull();
 await page.getByRole('button',{name:'Apply locally',exact:true}).click();
 await page.getByRole('navigation',{name:'Application'}).getByRole('link',{name:'Branding',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Branding Studio',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Apply locally',exact:true})).toBeEnabled();
 await page.getByLabel('Scope',{exact:true}).selectOption('route');
 await page.getByLabel('Route',{exact:true}).selectOption('/allb/nevo');
 await page.getByLabel('Brand name',{exact:true}).fill('NEVO Enterprise Test');
 await page.getByLabel('Tagline',{exact:true}).fill('Luxury In Every Moment.');
 await page.getByRole('button',{name:'Apply locally',exact:true}).click();
 await page.goto('/allb/nevo');
 await expect(page.locator('.lp-page')).toHaveClass(/lp-configured/);
 await expect(page.locator('.lp-wordmark').first()).toHaveText('NEVO Enterprise Test');
 await expect(page.locator('.lp-hero-copy')).toContainText('Luxury In Every Moment.');
 expect(await page.locator('.lp-page').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--accent'))).toBe('#e7bcd7');
 await page.reload();
 await expect(page.locator('.lp-wordmark').first()).toHaveText('NEVO Enterprise Test');
 await page.getByRole('link',{name:'Open local workspace',exact:false}).first().click();
 await expect(page).toHaveURL(/\/workspace\/nevo$/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('NEVO');
});
test('Gallery filter and search isolate matching brands',async({page})=>{
 await page.goto('/allb');
 await page.getByRole('searchbox',{name:'Search concept artwork'}).fill('NEVO');
 await expect(page.locator('.allb-card')).toHaveCount(2);
 await page.getByRole('searchbox',{name:'Search concept artwork'}).fill('not-a-real-brand-998');
 await expect(page.locator('.allb-empty')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('.allb-card')).toHaveCount(36);
 await page.getByRole('button',{name:'Production',exact:true}).click();
 expect(await page.locator('.allb-card').count()).toBeGreaterThan(0);
 expect(await page.locator('.allb-card').count()).toBeLessThan(36);
 for(const category of await page.locator('.allb-card-kicker span:last-child').allTextContents())expect(category).toBe('Production');
});
test('Skip link is keyboard accessible',async({page})=>{
 await page.goto('/');await page.keyboard.press('Tab');
 await expect(page.locator('.app-skip')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#content$/);
});
test('Studio validates JSON and exports a reviewed draft without applying it',async({page})=>{
 await page.goto('/studio/themes');
 await expect(page.getByLabel('Import JSON')).toBeEnabled();
 await page.getByLabel('Import JSON').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":99}')});
 await expect(page.getByRole('status')).toContainText('Invalid design configuration or unsupported schema version');
 expect(await page.evaluate(()=>localStorage.getItem('allb.design-studio.active.v1'))).toBeNull();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export JSON',exact:true}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('allb-design-config.json');
 const stream=await download.createReadStream();const chunks:Buffer[]=[];
 for await(const chunk of stream!)chunks.push(Buffer.from(chunk));
 const config=JSON.parse(Buffer.concat(chunks).toString());
 await page.getByLabel('Import JSON').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(config))});
 await expect(page.getByRole('status')).toContainText('Imported as an unsaved draft');
 expect(await page.evaluate(()=>localStorage.getItem('allb.design-studio.active.v1'))).toBeNull();
 await page.getByRole('button',{name:'Reset defaults',exact:true}).click();
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 expect(JSON.parse((await page.evaluate(()=>localStorage.getItem('allb.design-studio.v1')))! ).global).toEqual(config.global);
});
test('Global, implicit brand, family and exact settings resolve in the browser',async({page})=>{
 const config=structuredClone(defaults);
 config.global.theme.accent='#ffaaaa';
 config.brands.nevo.theme={accent:'#aaffaa'};
 config.routes['/allb/*']={theme:{accent:'#aaaaff'}};
 config.routes['/allb/nevo'].theme={accent:'#112233'};
 await page.addInitScript(value=>localStorage.setItem('allb.design-studio.active.v1',JSON.stringify(value)),config);
 for(const [route,accent] of [['/overview','#ffaaaa'],['/workspace/nevo','#aaffaa'],['/allb/siddham','#aaaaff'],['/allb/nevo','#112233']]){
  await page.goto(route);
  expect(await page.locator('.design-runtime').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--accent'))).toBe(accent);
 }
});
test('Representative visual evidence',async({page},info)=>{
 for(const [name,route] of [['gallery','/allb'],['themes','/studio/themes'],['nevo','/allb/nevo'],['workspace','/workspace/nevo']]){
  await page.goto(route,{waitUntil:'networkidle'});
  await page.screenshot({path:info.outputPath(name+'.png'),fullPage:false});
 }
});
for(const route of manifest.concreteRoutes){
 test('accessibility and horizontal layout '+route,async({page})=>{
  const failedStyles:string[]=[];
  page.on('response',response=>{if(response.request().resourceType()==='stylesheet'&&response.status()>=400)failedStyles.push(response.url());});
  await page.goto(route,{waitUntil:'networkidle'});
  expect(failedStyles,'Stylesheets must load before accessibility/layout qualification').toEqual([]);
  expect(await page.locator('.app-header').evaluate(el=>getComputedStyle(el).display)).toBe('flex');
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  if(route.startsWith('/allb/'))await expect(page.getByRole('link',{name:'Open local workspace',exact:false}).first()).toHaveAttribute('href','/workspace/'+route.split('/').at(-1));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Horizontal overflow on '+route).toBeTruthy();
  await page.addScriptTag({content:axe.source});
  const violations=await page.evaluate(async()=>{const results=await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return results.violations.map((v:any)=>({id:v.id,impact:v.impact,nodes:v.nodes.map((n:any)=>({target:n.target,summary:n.failureSummary})).slice(0,8)}));});
  expect(violations,JSON.stringify(violations,null,2)).toEqual([]);
 });
}

test('Application navigation and Studio scope controls operate from the keyboard',async({page})=>{
 await page.goto('/');
 await page.keyboard.press('Tab');
 await expect(page.locator('.app-skip')).toBeFocused();
 // Walk the actual tab order, rather than assigning focus programmatically.
 for(let index=0;index<12;index++){
  if(await page.getByRole('navigation',{name:'Application'}).getByRole('link',{name:'Themes',exact:true}).evaluate(el=>el===document.activeElement))break;
  await page.keyboard.press('Tab');
 }
 await expect(page.getByRole('navigation',{name:'Application'}).getByRole('link',{name:'Themes',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/studio\/themes$/);
 await page.reload();
 for(let index=0;index<150;index++){
  if(await page.getByLabel('Scope',{exact:true}).evaluate(el=>el===document.activeElement))break;
  await page.keyboard.press('Tab');
 }
 await expect(page.getByLabel('Scope',{exact:true})).toBeFocused();
 await page.keyboard.press('Home');
 await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');
 await expect(page.getByRole('combobox',{name:/^Brand/})).toBeVisible();
 for(let index=0;index<150;index++){
  if(await page.getByRole('combobox',{name:/^Brand/}).evaluate(el=>el===document.activeElement))break;
  await page.keyboard.press('Tab');
 }
 await expect(page.getByRole('combobox',{name:/^Brand/})).toBeFocused();
 await page.keyboard.press('Home');
 await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('group',{name:'Edit selected scope',exact:true})).toBeEnabled();
});

test('An unknown route provides a working return-home recovery link',async({page})=>{
 const response=await page.goto('/unknown-verification-route-998');
 expect(response?.status()).toBe(404);
 await expect(page.getByRole('heading',{name:'Page not found',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Return to ALLB home',exact:true}).click();
 await expect(page).toHaveURL(/\/$/);
 await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
});

test('Execution Kanban displays real registry tasks and reversible filters',async({page})=>{
 await page.goto('/enterprise/kanban');
 await expect(page.getByRole('status')).toContainText('131 matching tasks');
 await expect(page.locator('.enterprise-columns article')).toHaveCount(131);
 await page.getByLabel('Search tasks',{exact:true}).fill('E02.08');
 await expect(page.locator('.enterprise-columns article')).toHaveCount(1);
 await expect(page.locator('.enterprise-columns article')).toContainText('E02.08');
 await page.getByLabel('Search tasks',{exact:true}).fill('');
 await page.getByRole('combobox',{name:/^Phase/}).selectOption('2');
 await expect(page.locator('.enterprise-columns article')).toHaveCount(13);
 await page.getByRole('combobox',{name:/^Phase/}).selectOption('all');
 await page.getByRole('button',{name:'Refresh status',exact:true}).click();
 await expect(page.locator('.enterprise-columns article')).toHaveCount(131);
 await expect(page.getByRole('region',{name:'Agent assignments'})).toBeVisible();
});

test('Kanban accessibility, responsive layout and visual evidence',async({page},info)=>{
 await page.goto('/enterprise/kanban');
 await expect(page.locator('.enterprise-columns article')).toHaveCount(131);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy();
 await page.addScriptTag({content:axe.source});
 const violations=await page.evaluate(async()=>{
  const result=await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
  return result.violations.map((entry:any)=>({id:entry.id,impact:entry.impact,targets:entry.nodes.map((node:any)=>node.target)}));
 });
 expect(violations,JSON.stringify(violations)).toEqual([]);
 await page.screenshot({path:info.outputPath('kanban.png'),fullPage:false});
});
