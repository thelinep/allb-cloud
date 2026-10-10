'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import routes from '../lib/routes.json';
import manifest from '../route-manifest.json';
import landings from '../lib/landing-routes.json';
import {ACTIVE_KEY,STORAGE_KEY,CHANGE_EVENT,contrast,defaults,fontFamily,parseConfig,presets,resolveDesign,safeAsset,themeVariables,validBrandId,validRoute,type Brand,type DesignConfig,type Theme} from '../../../packages/design-config/config';

export function DesignStudio({tab}:{tab:'theme'|'branding'}){
 const [config,setConfig]=useState<DesignConfig>(defaults);
 const [ready,setReady]=useState(false);const [scope,setScope]=useState<'global'|'brand'|'route'>('global');
 const [target,setTarget]=useState('');const [entry,setEntry]=useState('');const [message,setMessage]=useState('');
 const [query,setQuery]=useState('');const [preview,setPreview]=useState('/');
 useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(ACTIVE_KEY);if(raw)setConfig(parseConfig(JSON.parse(raw)));}catch{setMessage('Saved configuration could not be read. Defaults loaded; save only after review.');}setReady(true);},[]);
 const base=scope==='global'?config.global:scope==='brand'?config.brands[target]:config.routes[target];
 const resolved=scope==='global'?config.global:scope==='brand'?{theme:{...config.global.theme,...config.brands[target]?.theme},branding:{...config.global.branding,...config.brands[target]?.branding}}:resolveDesign(config,target.replace(/\/\*$/,'/preview'));
 const sample=scope==='global'?resolveDesign(config,preview):resolved;
 const selected=scope==='global'||!!base;
 function mutate(fn:(next:DesignConfig)=>void){setConfig(current=>{const next=structuredClone(current);fn(next);return next;});setMessage('Unsaved draft changes.');}
 function patch(kind:'theme'|'branding',key:string,v:unknown){
  if(!selected)return;
  mutate(next=>{const obj=scope==='global'?next.global:scope==='brand'?next.brands[target]:next.routes[target];obj[kind]={...obj[kind],[key]:v} as Theme & Brand;});
 }
 function replaceTheme(theme:Theme){mutate(next=>{const obj=scope==='global'?next.global:scope==='brand'?next.brands[target]:next.routes[target];obj.theme={...theme};});}
 function save(apply=false){try{const checked=parseConfig(config);localStorage.setItem(STORAGE_KEY,JSON.stringify(checked));if(apply){localStorage.setItem(ACTIVE_KEY,JSON.stringify(checked));window.dispatchEvent(new Event(CHANGE_EVENT));}setMessage(apply?'Applied in this browser. No server publication occurred.':'Draft saved in this browser.');}catch(e){setMessage(e instanceof Error?e.message:'Save failed.');}}
 function add(){
  const id=entry.trim();
  if(scope==='brand'&&!validBrandId(id)||scope==='route'&&!validRoute(id)){setMessage(scope==='brand'?'Use a lowercase brand ID, for example nevo.':'Use /path or /family/* for future routes.');return;}
  mutate(next=>{const collection=scope==='brand'?next.brands:next.routes;if(!Object.hasOwn(collection,id))collection[id]={};});setTarget(id);setEntry('');
 }
 function reset(){mutate(next=>{if(scope==='global')next.global=structuredClone(defaults.global);else {const obj=scope==='brand'?next.brands[target]:next.routes[target];if(obj)delete obj[tab==='theme'?'theme':'branding'];}});}
 function download(){try{const checked=parseConfig(config);const url=URL.createObjectURL(new Blob([JSON.stringify(checked,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='allb-design-config.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Configuration exported.');}catch(e){setMessage(String(e));}}
 async function importFile(file?:File){if(!file)return;try{if(file.size>1024*1024)throw Error('Import must be smaller than 1 MB.');const checked=parseConfig(JSON.parse(await file.text()));setConfig(checked);setScope('global');setTarget('');setMessage('Imported as an unsaved draft. Review before applying.');}catch(e){setMessage(e instanceof Error?e.message:'Import failed.');}}
 const options=[...new Set([...manifest.concreteRoutes,...landings.map(r=>r.path),...Object.keys(config.routes)])].filter(p=>p.toLowerCase().includes(query.toLowerCase()));
 const inherited=scope!=='global'&&!base?.[tab==='theme'?'theme':'branding'];
 return <main className="design-studio">
  <p className="eyebrow">MAATAA UI / Design configuration</p><h1>{tab==='theme'?'Theme Studio':'Branding Studio'}</h1>
  <p className="lead">Configure global defaults, brand identities and individual routes. New routes inherit defaults automatically. Adding a route configuration does not create the route itself.</p>
  <nav className="controls" aria-label="Design studios"><a href="/studio/themes" aria-current={tab==='theme'?'page':undefined}>Theme Studio</a><a href="/studio/branding" aria-current={tab==='branding'?'page':undefined}>Branding Studio</a></nav>
  <p className="notice">Browser-local configuration. Landings and workspaces share this active configuration. Use JSON export/import to transfer settings between browsers. No database, access control or server publication is connected.</p>
  <fieldset disabled={!ready}><legend>Configuration scope</legend><div className="controls">
   <label>Scope<select value={scope} onChange={e=>{setScope(e.target.value as typeof scope);setTarget('');}}><option value="global">Global defaults</option><option value="brand">Brand</option><option value="route">Route / landing</option></select></label>
   {scope==='brand'&&<label>Brand<select value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select a brand</option>{Object.keys(config.brands).map(id=><option key={id}>{id}</option>)}</select></label>}
   {scope==='route'&&<><label>Find route<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Route<select value={target} onChange={e=>{const p=e.target.value;setTarget(p);if(p&&!Object.hasOwn(config.routes,p))mutate(n=>{n.routes[p]={};});}}><option value="">Select a route</option>{[...new Set([...options,...(target?[target]:[])])].map(p=><option key={p}>{p}</option>)}</select></label></>}
  </div>
  {scope!=='global'&&<div className="controls"><label>{scope==='brand'?'New brand ID':'New route or wildcard'}<input value={entry} placeholder={scope==='brand'?'nevo':'/allb/nevo or /allb/*'} onChange={e=>setEntry(e.target.value)}/></label><button onClick={add} disabled={!entry.trim()}>Add scope</button></div>}
  {scope==='route'&&selected&&<label>Assigned brand<select value={config.routes[target]?.brand||''} onChange={e=>mutate(n=>{if(e.target.value)n.routes[target].brand=e.target.value;else delete n.routes[target].brand;})}><option value="">Inherit brand assignment</option>{Object.keys(config.brands).map(id=><option key={id}>{id}</option>)}</select></label>}
  </fieldset>
  <div className="studio-grid"><section className="panel"><h2>{tab==='theme'?'Appearance':'Brand identity'}</h2><p>{scope==='global'?'Global defaults':inherited?'Inherited settings; changing a field creates an override.':'Overrides are active for this scope.'}</p>
   <fieldset disabled={!ready||!selected}><legend>{selected?'Edit selected scope':'Select a brand or route to edit'}</legend>
   {tab==='theme'?<><label>Preset<select value="" onChange={e=>{if(e.target.value)replaceTheme(presets[e.target.value]);}}><option value="">Choose a preset</option>{Object.keys(presets).map(k=><option key={k}>{k}</option>)}</select></label>
    <label>Mode<select value={resolved.theme.mode} onChange={e=>patch('theme','mode',e.target.value)}><option>dark</option><option>light</option></select></label>
    <div className="studio-colors">{(['background','surface','text','muted','accent','border'] as const).map(key=><label key={key}>{key}<input type="color" value={resolved.theme[key]} onChange={e=>patch('theme',key,e.target.value)}/><code>{resolved.theme[key]}</code></label>)}</div>
    <label>Corner radius: {resolved.theme.radius}px<input type="range" min="0" max="40" value={resolved.theme.radius} onChange={e=>patch('theme','radius',Number(e.target.value))}/></label>
    <label>Density<select value={resolved.theme.density} onChange={e=>patch('theme','density',e.target.value)}><option>comfortable</option><option>compact</option></select></label>
    <label>Font<select value={resolved.theme.font} onChange={e=>patch('theme','font',e.target.value)}><option>system</option><option>serif</option><option>mono</option></select></label>
   </>:<>{(['name','tagline','logo','favicon','hero','heroAlt'] as const).map(key=><label key={key}>{({name:'Brand name',tagline:'Tagline',logo:'Logo URL',favicon:'Favicon URL',hero:'Hero image URL',heroAlt:'Hero alternative text'})[key]}<input value={resolved.branding[key]} maxLength={2048} placeholder={['logo','favicon','hero'].includes(key)?'/assets/image.webp or https://…':''} onChange={e=>patch('branding',key,e.target.value)}/></label>)}<p>Use an existing same-origin asset path or HTTPS URL. Files are not uploaded by this editor.</p></>}
    <button onClick={reset}>{scope==='global'?'Reset defaults':'Remove '+tab+' overrides'}</button>
   </fieldset></section>
   <section className="panel"><h2>Draft preview</h2>{scope==='global'&&<label>Preview route<select value={preview} onChange={e=>setPreview(e.target.value)}>{[...new Set([...manifest.concreteRoutes,...landings.map(r=>r.path)])].map(p=><option key={p}>{p}</option>)}</select></label>}
    <article className="studio-preview" style={{...themeVariables(sample.theme),background:sample.theme.background,color:sample.theme.text,fontFamily:fontFamily(sample.theme.font),borderRadius:sample.theme.radius,colorScheme:sample.theme.mode} as CSSProperties}>
     {sample.branding.logo&&safeAsset(sample.branding.logo)&&<img className="preview-logo" src={sample.branding.logo} alt={sample.branding.name+' logo'}/>}
     <p className="eyebrow">{sample.branding.name}</p><h3>{sample.branding.tagline||'Your brand, your experience'}</h3>
     {sample.branding.hero&&safeAsset(sample.branding.hero)&&<img className="preview-hero" src={sample.branding.hero} alt={sample.branding.heroAlt||'Hero preview'}/>}
     <div className="card"><p>Inherited design tokens with scoped overrides.</p><a href={scope==='route'&&!target.includes('*')?target:preview}>Inspect route</a><button style={{background:sample.theme.accent,color:sample.theme.background}}>Action preview</button></div>
    </article><p>Text/background contrast: {contrast(sample.theme.text,sample.theme.background).toFixed(2)}:1. Accent/background: {contrast(sample.theme.accent,sample.theme.background).toFixed(2)}:1.</p>
    <p className="notice">{contrast(sample.theme.text,sample.theme.background)<4.5?'Text contrast is below the 4.5:1 normal-text threshold.':'Text contrast meets the 4.5:1 normal-text threshold.'} This is a color check, not full accessibility certification.</p>
    <details><summary>Resolved configuration</summary><pre>{JSON.stringify({scope,target,...resolved},null,2)}</pre></details>
   </section></div>
  <div className="controls"><button disabled={!ready} onClick={()=>save()}>Save draft</button><button disabled={!ready} onClick={()=>save(true)}>Apply locally</button><button disabled={!ready} onClick={download}>Export JSON</button><label>Import JSON<input type="file" accept=".json,application/json" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value='';}}/></label></div>
  <p role="status" aria-live="polite">{message||'Global → brand → route family → exact route. Changes stay in draft until applied.'}</p>
 </main>;
}
