import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["sign-in", "invitation", "mfa", "recovery", "workspace-switcher", "permissions", "sessions"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/patterns/identity/${slug}`,group:'Identity',title:slug.replaceAll('-',' '),mode:'auth',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;
