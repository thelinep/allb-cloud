const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>',{url:'http://allb.local'});
for(const name of ['window','document','HTMLElement','Event','MouseEvent','File','FileReader','localStorage'])global[name]=dom.window[name];
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react');
const {act}=React;
const {createRoot}=require('react-dom/client');
let route='/studio/themes';
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='next/navigation')return {usePathname:()=>route};
 if(request==='next/link')return {__esModule:true,default:({children,prefetch,...props})=>React.createElement('a',props,children)};
 return originalLoad.call(this,request,parent,isMain);
};
for(const ext of ['.ts','.tsx'])Module._extensions[ext]=(module,file)=>{const src=fs.readFileSync(file,'utf8');module._compile(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {DesignProvider,useDesign}=require('../components/design-provider.tsx');
const {DesignStudio}=require('../components/design-studio.tsx');
const {AppShell}=require('../components/app-shell.tsx');
const Landing=require('../components/allb-landing.tsx').default;
const manifest=require('../public/allb/manifest.json');
const root=createRoot(document.getElementById('root'));
function Probe(){const d=useDesign();return React.createElement('output',{'data-probe':'brand'},d.branding.name);}
async function render(child,newRoute){route=newRoute;await act(async()=>root.render(React.createElement(DesignProvider,null,React.createElement(AppShell,null,child))));}
function control(label,tag='select'){const element=[...document.querySelectorAll('label')].find(l=>l.textContent.startsWith(label));assert(element,'Missing label '+label);const input=element.querySelector(tag);assert(input,'Missing '+tag+' for '+label);return input;}
async function select(label,value){const el=control(label);await act(async()=>{el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));});}
async function input(label,value){const el=control(label,'input');await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});}
async function click(label){const el=[...document.querySelectorAll('button')].find(b=>b.textContent===label);assert(el,'Missing button '+label);await act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));}
(async()=>{
 try{
  await render(React.createElement(DesignStudio,{tab:'theme'}),'/studio/themes');
  await select('Scope','route');await select('Route','/allb/nevo');await select('Preset','NEVO midnight');
  assert.equal(localStorage.getItem('allb.design-studio.active.v1'),null,'Draft changed active settings');
  await click('Save draft');assert(localStorage.getItem('allb.design-studio.v1'));
  await click('Apply locally');
  const active=JSON.parse(localStorage.getItem('allb.design-studio.active.v1'));assert.equal(active.routes['/allb/nevo'].theme.accent,'#e7bcd7');
  const landing=manifest.items.find(x=>x.slug==='nevo');
  await render(React.createElement(Landing,{landing}),'/allb/nevo');
  assert.equal(document.querySelector('.lp-page').style.getPropertyValue('--accent'),'#e7bcd7');
  assert(document.querySelector('.lp-app-handoff a').getAttribute('href')==='/workspace/nevo');
  await render(React.createElement(DesignStudio,{tab:'branding'}),'/studio/branding');
  await select('Scope','route');await select('Route','/allb/nevo');await input('Brand name','NEVO Route Test');await input('Tagline','Luxury In Every Moment.');
  await click('Apply locally');await render(React.createElement(Landing,{landing}),'/allb/nevo');
  assert.equal(document.querySelector('.lp-wordmark').textContent,'NEVO Route Test');
  assert(document.querySelector('.lp-hero-copy').textContent.includes('Luxury In Every Moment.'));
  await render(React.createElement(Probe),'/workspace/nevo');assert.equal(document.querySelector('[data-probe]').textContent,'NEVO','Exact landing override leaked into workspace');
  await render(React.createElement(DesignStudio,{tab:'branding'}),'/studio/branding');await select('Scope','brand');await select('Brand','nevo');await input('Brand name','NEVO Brand Test');await click('Apply locally');
  await render(React.createElement(Probe),'/workspace/nevo');assert.equal(document.querySelector('[data-probe]').textContent,'NEVO Brand Test');
  await render(React.createElement(Landing,{landing}),'/allb/nevo');assert.equal(document.querySelector('.lp-wordmark').textContent,'NEVO Route Test','Exact override lost priority');
  await act(async()=>{localStorage.setItem('allb.design-studio.active.v1','invalid');window.dispatchEvent(new Event('allb:design-config'));});
  assert(!document.querySelector('.lp-page').classList.contains('lp-configured'),'Corrupt storage did not restore original landing');
  const result={checks:'PASS',coverage:['draft/apply separation','draft persistence','Studio-to-landing theme propagation','route branding and tagline','workspace handoff link','brand workspace inheritance','exact-route isolation','corrupt-storage recovery'],environment:'jsdom DOM simulation; not real browser or visual QA'};
  fs.writeFileSync('design-dom-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }catch(e){console.error(e);process.exitCode=1;}finally{await act(async()=>root.unmount());dom.window.close();Module._load=originalLoad;}
})();
