'use client';
import {createContext,useContext,useEffect,useState,type CSSProperties} from 'react';
import {usePathname} from 'next/navigation';
import {ACTIVE_KEY,CHANGE_EVENT,defaults,parseConfig,resolveDesign,themeVariables,type DesignConfig} from '../../../packages/design-config/config';
const Context=createContext({...resolveDesign(defaults,'/'),configured:false});
export const useDesign=()=>useContext(Context);
export function DesignProvider({children}:{children:React.ReactNode}){
 const [configured,setConfigured]=useState(false);const path=usePathname();const [config,setConfig]=useState<DesignConfig>(defaults);
 useEffect(()=>{const read=()=>{try{const raw=localStorage.getItem(ACTIVE_KEY);setConfig(raw?parseConfig(JSON.parse(raw)):defaults);setConfigured(!!raw);}catch{setConfig(defaults);setConfigured(false);}};read();window.addEventListener('storage',read);window.addEventListener(CHANGE_EVENT,read);return()=>{window.removeEventListener('storage',read);window.removeEventListener(CHANGE_EVENT,read);};},[]);
 const design=resolveDesign(config,path);
 useEffect(()=>{if(!design.branding.favicon)return;const link=document.createElement('link');link.rel='icon';link.href=design.branding.favicon;document.head.appendChild(link);return()=>link.remove();},[design.branding.favicon]);
 return <Context.Provider value={{...design,configured}}><div className="design-runtime" style={{...themeVariables(design.theme),colorScheme:design.theme.mode} as CSSProperties}>{children}</div></Context.Provider>;
}
export function BrandMark(){const {branding}=useDesign();return <>{branding.logo&&<img className="brand-logo" src={branding.logo} alt="" width="36" height="36"/>}<span>{branding.name}</span></>;}
