import Link from 'next/link';
import {notFound} from 'next/navigation';
import {allbLandings,getAllbLanding} from '../../../lib/allb-landings';
import {toolsFor} from '../../../lib/launchers';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{brand:string}>}){const {brand}=await params;const item=getAllbLanding(brand);return {title:item?item.title+' workspace':'Unknown workspace'};}
export default async function Page({params}:{params:Promise<{brand:string}>}){const {brand}=await params;const item=getAllbLanding(brand);if(!item)notFound();return <main><p className="eyebrow">{item.category} / local workspace</p><h1>{item.title}</h1><p className="lead">{item.description}</p><div className="controls"><Link href={'/allb/'+brand}>View landing →</Link><Link href="/workspace">All workspaces</Link></div><section><h2>Open shared tools</h2><div className="cards">{toolsFor(item.category).map(tool=><Link className="card" href={tool.path} key={tool.path}><small>OPEN →</small><h3>{tool.title}</h3><p>{tool.description}</p></Link>)}</div></section><p className="notice">This hub connects existing MAATAA local tools. It does not create a separate production application for each brand. Tools retain their own route configuration; brand identity is inherited on this workspace route.</p></main>;}
