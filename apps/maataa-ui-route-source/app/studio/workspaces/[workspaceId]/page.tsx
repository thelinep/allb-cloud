import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{workspaceId:string}>}){const p=await params;const id=p.workspaceId;if(!["demo-workspace"].includes(id))notFound();return <RouteView spec={{path:`/studio/workspaces/${id}`,group:'Studio',title:id,mode:'members',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamic='force-dynamic';
