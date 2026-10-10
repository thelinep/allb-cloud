import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{themeId:string}>}){const p=await params;const id=p.themeId;if(!["demo-theme"].includes(id))notFound();return <RouteView spec={{path:`/studio/themes/${id}`,group:'Studio',title:id,mode:'tokens',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{themeId:'demo-theme'}]}
