'use client';
import {useEffect,useState} from 'react';
import {ACTIVE_KEY,CHANGE_EVENT,parseConfig,resolveDesign,type DesignConfig} from '../../../../../packages/design-config/config';
export function useLandingDesign(path:string){
 const [config,setConfig]=useState<DesignConfig|null>(null);
 useEffect(()=>{const read=()=>{try{const raw=localStorage.getItem(ACTIVE_KEY);setConfig(raw?parseConfig(JSON.parse(raw)):null);}catch{setConfig(null);}};read();window.addEventListener('storage',read);window.addEventListener(CHANGE_EVENT,read);return()=>{window.removeEventListener('storage',read);window.removeEventListener(CHANGE_EVENT,read);};},[]);
 const design=config?resolveDesign(config,path):null;
 useEffect(()=>{if(!design?.branding.favicon)return;const link=document.createElement('link');link.rel='icon';link.href=design.branding.favicon;document.head.appendChild(link);return()=>link.remove();},[design?.branding.favicon]);
 return design;
}
export function LandingDesignImport(){
 const [message,setMessage]=useState('');
 return <details className="lp-design-import"><summary>Import Studio configuration</summary><p>For a separately hosted Studio, export its JSON and import it here. Settings apply only in this browser.</p><label>Design configuration JSON<input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>1024*1024)throw Error('File must be smaller than 1 MB.');const config=parseConfig(JSON.parse(await file.text()));localStorage.setItem(ACTIVE_KEY,JSON.stringify(config));window.dispatchEvent(new Event(CHANGE_EVENT));setMessage('Configuration applied locally.');}catch(error){setMessage(error instanceof Error?error.message:'Import failed.');}}}/></label><button onClick={()=>{try{localStorage.removeItem(ACTIVE_KEY);window.dispatchEvent(new Event(CHANGE_EVENT));setMessage('Original landing design restored in this browser.');}catch{setMessage('Browser storage is unavailable.');}}}>Restore original landing design</button><p role="status">{message}</p></details>;
}
