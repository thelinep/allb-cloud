import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{sceneId:string}>}){const p=await params;const id=p.sceneId;if(!["demo-scene"].includes(id))notFound();return <RouteView spec={{path:`/studio/scenes/${id}`,group:'Studio',title:id,mode:'scene',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{sceneId:'demo-scene'}]}
