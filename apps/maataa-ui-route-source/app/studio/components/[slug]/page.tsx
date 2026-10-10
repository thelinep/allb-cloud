import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["button", "input", "textarea", "select", "checkbox", "radio", "switch", "tabs", "card", "dialog", "drawer", "accordion", "popover", "tooltip", "alert", "toast", "badge", "progress", "skeleton", "header", "sidebar", "breadcrumbs", "menu", "pagination", "command-palette", "empty-state", "error-state"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/studio/components/${slug}`,group:'Studio',title:slug.replaceAll('-',' '),mode:'component',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;
