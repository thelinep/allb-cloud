import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
export default async function Page({params}:{params:Promise<{token:string}>}){const p=await params;const id=p.token;if(!["demo-invite"].includes(id))notFound();return <RouteView spec={{path:`/invitations/${id}`,group:'Studio',title:id,mode:'auth',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{token:'demo-invite'}]}
