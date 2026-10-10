import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["dashboard", "asset-browser", "scene-controls", "quote-editor", "client-review", "approval", "handoff"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/patterns/production/${slug}`,group:'Production',title:slug.replaceAll('-',' '),mode:slug==='asset-browser'?'assets':slug==='scene-controls'?'scene':'workflow',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;
