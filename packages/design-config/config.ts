export type Theme = {mode:'light'|'dark';background:string;surface:string;text:string;muted:string;accent:string;border:string;radius:number;density:'comfortable'|'compact';font:'system'|'serif'|'mono'};
export type Brand = {name:string;tagline:string;logo:string;favicon:string;hero:string;heroAlt:string};
export type Override = {theme?:Partial<Theme>;branding?:Partial<Brand>};
export type DesignConfig = {schemaVersion:1;assetReferences?:{assetId:string;revision:number}[];global:{theme:Theme;branding:Brand};brands:Record<string,Override>;routes:Record<string,Override & {brand?:string}>};
export const STORAGE_KEY='allb.design-studio.v1';
export const ACTIVE_KEY='allb.design-studio.active.v1';
export const CHANGE_EVENT='allb:design-config';
export const defaults:DesignConfig={schemaVersion:1,global:{theme:{mode:'dark',background:'#111817',surface:'#1c2624',text:'#eeeadd',muted:'#b7c0b7',accent:'#d3ec75',border:'#3b4842',radius:12,density:'comfortable',font:'system'},branding:{name:'MAATAA UI',tagline:'Shared foundations for ALLB',logo:'',favicon:'',hero:'',heroAlt:''}},brands:{"allb":{"branding":{"name":"ALLB ecosystem","tagline":""}},"siddham":{"branding":{"name":"Siddham Semiconductor","tagline":""}},"kharoshti":{"branding":{"name":"Kharoshti Edge","tagline":""}},"brahmi":{"branding":{"name":"Brahmi Communications","tagline":""}},"maataa-ui":{"branding":{"name":"MAATAA UI","tagline":""}},"maataa":{"branding":{"name":"MAATAA Platform","tagline":""}},"maataa-auth":{"branding":{"name":"MAATAA Auth","tagline":""}},"maataa-os":{"branding":{"name":"MAATAA OS","tagline":""}},"core-aham":{"branding":{"name":"Core and AHAM","tagline":""}},"maataa-desktop":{"branding":{"name":"MAATAA Desktop","tagline":""}},"developer-tools":{"branding":{"name":"Developer Tools","tagline":""}},"data-services":{"branding":{"name":"Data Services","tagline":""}},"operations":{"branding":{"name":"Operations","tagline":""}},"maataa-db-studio":{"branding":{"name":"MAATAA DB Studio","tagline":""}},"governance":{"branding":{"name":"Governance","tagline":""}},"commerce":{"branding":{"name":"Commerce","tagline":""}},"tlps":{"branding":{"name":"TLPS","tagline":""}},"nevo":{"branding":{"name":"NEVO","tagline":""}},"hardware":{"branding":{"name":"Hardware Overview","tagline":""}},"shree":{"branding":{"name":"SHREE","tagline":""}},"applications":{"branding":{"name":"Applications Overview","tagline":""}},"samwat":{"branding":{"name":"SAMWAT","tagline":""}},"observatory":{"branding":{"name":"SAMWAT Observatory","tagline":""}},"hemant-clock":{"branding":{"name":"Hemant Clock","tagline":""}},"games":{"branding":{"name":"Games","tagline":""}},"panchanga":{"branding":{"name":"Panchanga","tagline":""}},"apps":{"branding":{"name":"Apps","tagline":""}},"sankranti":{"branding":{"name":"Sankranti","tagline":""}},"product-directory":{"branding":{"name":"Product Directory","tagline":""}},"simulation-timeline":{"branding":{"name":"Simulation Timeline","tagline":""}},"production":{"branding":{"name":"Production Overview","tagline":""}},"developer-ecosystem":{"branding":{"name":"Developer Ecosystem","tagline":""}},"nevo-workflow":{"branding":{"name":"NEVO Workflow Demo","tagline":""}},"roadmap":{"branding":{"name":"Roadmap","tagline":""}},"tlps-workflow":{"branding":{"name":"TLPS Workflow Demo","tagline":""}},"samwat-research":{"branding":{"name":"SAMWAT Research","tagline":""}}},routes:{"/allb/allb":{"brand":"allb"},"/allb/siddham":{"brand":"siddham"},"/allb/kharoshti":{"brand":"kharoshti"},"/allb/brahmi":{"brand":"brahmi"},"/allb/maataa-ui":{"brand":"maataa-ui"},"/allb/maataa":{"brand":"maataa"},"/allb/maataa-auth":{"brand":"maataa-auth"},"/allb/maataa-os":{"brand":"maataa-os"},"/allb/core-aham":{"brand":"core-aham"},"/allb/maataa-desktop":{"brand":"maataa-desktop"},"/allb/developer-tools":{"brand":"developer-tools"},"/allb/data-services":{"brand":"data-services"},"/allb/operations":{"brand":"operations"},"/allb/maataa-db-studio":{"brand":"maataa-db-studio"},"/allb/governance":{"brand":"governance"},"/allb/commerce":{"brand":"commerce"},"/allb/tlps":{"brand":"tlps"},"/allb/nevo":{"brand":"nevo"},"/allb/hardware":{"brand":"hardware"},"/allb/shree":{"brand":"shree"},"/allb/applications":{"brand":"applications"},"/allb/samwat":{"brand":"samwat"},"/allb/observatory":{"brand":"observatory"},"/allb/hemant-clock":{"brand":"hemant-clock"},"/allb/games":{"brand":"games"},"/allb/panchanga":{"brand":"panchanga"},"/allb/apps":{"brand":"apps"},"/allb/sankranti":{"brand":"sankranti"},"/allb/product-directory":{"brand":"product-directory"},"/allb/simulation-timeline":{"brand":"simulation-timeline"},"/allb/production":{"brand":"production"},"/allb/developer-ecosystem":{"brand":"developer-ecosystem"},"/allb/nevo-workflow":{"brand":"nevo-workflow"},"/allb/roadmap":{"brand":"roadmap"},"/allb/tlps-workflow":{"brand":"tlps-workflow"},"/allb/samwat-research":{"brand":"samwat-research"}}};
export const presets:Record<string,Theme>={
 'Forest dark':defaults.global.theme,
 'Pearl light':{...defaults.global.theme,mode:'light',background:'#faf7f2',surface:'#ffffff',text:'#25262a',muted:'#585a62',accent:'#755213',border:'#cec7ba'},
 'NEVO midnight':{...defaults.global.theme,background:'#151016',surface:'#261c28',text:'#f8edf4',muted:'#c3aebe',accent:'#e7bcd7',border:'#514352',font:'serif'},
 'Science blue':{...defaults.global.theme,background:'#081423',surface:'#11263b',text:'#edf6ff',muted:'#abc0d6',accent:'#78cefa',border:'#304f6d'}
};
const keys=['mode','background','surface','text','muted','accent','border','radius','density','font'];
const brandKeys=['name','tagline','logo','favicon','hero','heroAlt'];
function object(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value);}
export function safeAsset(value:string){return value===''||(/^\/(?!\/)/.test(value)&&!/[\\\s]/.test(value))||(/^https:\/\//.test(value)&&(()=>{try{return new URL(value).protocol==='https:';}catch{return false;}})());}
function validateTheme(v:unknown,partial=false):v is Theme{
 if(!object(v)||Object.keys(v).some(k=>!keys.includes(k)))return false;
 if(!partial&&keys.some(k=>!(k in v)))return false;
 return Object.entries(v).every(([k,x])=>k==='mode'?typeof x==='string'&&['light','dark'].includes(x):k==='density'?typeof x==='string'&&['comfortable','compact'].includes(x):k==='font'?typeof x==='string'&&['system','serif','mono'].includes(x):k==='radius'?typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=40:typeof x==='string'&&/^#[0-9a-fA-F]{6}$/.test(x));
}
function validateBrand(v:unknown,partial=false):v is Brand{
 if(!object(v)||Object.keys(v).some(k=>!brandKeys.includes(k)))return false;
 if(!partial&&brandKeys.some(k=>!(k in v)))return false;
 return Object.entries(v).every(([k,x])=>typeof x==='string'&&x.length<=2048&&(['logo','favicon','hero'].includes(k)?safeAsset(x):true));
}
export function validRoute(path:string){return /^\/[a-zA-Z0-9/_.*-]*$/.test(path)&&!path.includes('..')&&!path.includes('//')&&(!path.includes('*')||path.endsWith('/*')&&path.indexOf('*')===path.length-1);}
export function validBrandId(id:string){return /^[a-z0-9][a-z0-9-]{0,79}$/.test(id)&&!['constructor','prototype','__proto__'].includes(id);}
export function parseConfig(value:unknown):DesignConfig{
 if(!object(value)||value.schemaVersion!==1||!object(value.global)||!validateTheme(value.global.theme)||!validateBrand(value.global.branding)||!object(value.brands)||!object(value.routes))throw Error('Invalid design configuration or unsupported schema version.');
 if(value.assetReferences!==undefined&&(!Array.isArray(value.assetReferences)||value.assetReferences.length>100||value.assetReferences.some((r:any)=>!object(r)||typeof r.assetId!=='string'||!/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(r.assetId)||!Number.isInteger(r.revision)||Number(r.revision)<1)))throw Error('Invalid asset references.');
 if(Object.keys(value.brands).length>200||Object.keys(value.routes).length>2000)throw Error('Configuration exceeds supported limits.');
 for(const [id,v] of Object.entries(value.brands)){
  if(!validBrandId(id)||!object(v)||Object.keys(v).some(k=>!['theme','branding'].includes(k))||v.theme!==undefined&&!validateTheme(v.theme,true)||v.branding!==undefined&&!validateBrand(v.branding,true))throw Error('Invalid brand: '+id);
 }
 for(const [path,v] of Object.entries(value.routes)){
  if(!validRoute(path)||!object(v)||Object.keys(v).some(k=>!['theme','branding','brand'].includes(k))||v.theme!==undefined&&!validateTheme(v.theme,true)||v.branding!==undefined&&!validateBrand(v.branding,true)||v.brand!==undefined&&(typeof v.brand!=='string'||!validBrandId(v.brand)||!Object.hasOwn(value.brands,v.brand)))throw Error('Invalid route configuration: '+path);
 }
 return JSON.parse(JSON.stringify(value)) as DesignConfig;
}
export function resolveDesign(config:DesignConfig,path:string,brandId?:string):{theme:Theme;branding:Brand;brand?:string}{
 const matches=Object.keys(config.routes).filter(k=>k.endsWith('/*')&&(path===k.slice(0,-2)||path.startsWith(k.slice(0,-1)))).sort((a,b)=>a.length-b.length);
 const overrides=[...matches.map(k=>config.routes[k]),...(Object.hasOwn(config.routes,path)?[config.routes[path]]:[])];
 const workspaceBrand=path.match(/^\/workspace\/([a-z0-9-]+)(?:\/|$)/)?.[1];
 const assigned=overrides.reduce((id,v)=>v.brand??id,brandId??workspaceBrand);
 const brand=assigned&&Object.hasOwn(config.brands,assigned)?config.brands[assigned]:{};
 let theme={...config.global.theme,...brand.theme};let branding={...config.global.branding,...brand.branding};
 for(const v of overrides){theme={...theme,...v.theme};branding={...branding,...v.branding};}
 return {theme,branding,brand:assigned};
}
export const fontFamily=(font:Theme['font'])=>font==='serif'?'Georgia, serif':font==='mono'?'ui-monospace, monospace':'system-ui, sans-serif';
export function themeVariables(theme:Theme):Record<string,string>{
 return {'--bg':theme.background,'--surface':theme.surface,'--text':theme.text,'--muted':theme.muted,'--accent':theme.accent,'--line':theme.border,'--radius':theme.radius+'px','--space':theme.density==='compact'?'14px':'22px','--font':fontFamily(theme.font)};
}
export function landingVariables(theme:Theme):Record<string,string>{
 return {...themeVariables(theme),'--lp-bg':theme.background,'--lp-dark':theme.background,'--lp-light':theme.surface,'--lp-surface':theme.surface,'--lp-text':theme.text,'--lp-ink':theme.text,'--lp-muted':theme.muted,'--lp-accent':theme.accent,'--lp-line':theme.border};
}
export function contrast(a:string,b:string){const lum=(s:string)=>{const c=[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
