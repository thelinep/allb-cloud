import {notFound} from 'next/navigation';
import {RouteView} from '../../../../../components/route-view';
export default async function Page({params}:{params:Promise<{sceneId:string}>}){const {sceneId}=await params;if(sceneId!=='demo-scene')notFound();return <RouteView spec={{path:'/studio/scenes/demo-scene/review',group:'Studio',title:'Scene review',mode:'workflow',description:'Illustrative review; not an approval signature.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{sceneId:'demo-scene'}]}
