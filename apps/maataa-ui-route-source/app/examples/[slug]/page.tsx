import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
const slugs=["identity", "production", "spatial", "scene", "theme"];
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/examples/${slug}`,group:'Examples',title:slug.replaceAll('-',' '),mode:({identity:'auth',production:'workflow',spatial:'spatial',scene:'scene',theme:'tokens'} as Record<string,string>)[slug],description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamic='force-dynamic';
