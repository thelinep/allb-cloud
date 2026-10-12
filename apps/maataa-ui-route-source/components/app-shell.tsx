'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import routes from '../lib/routes.json';
import {BrandMark} from './design-provider';
export function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname();const publicView=path.startsWith('/allb');const sidebar=path!=='/'&&!publicView&&!path.startsWith('/workspace');
 return <><a className="app-skip" href="#content">Skip to content</a><header className="app-header"><Link className="app-brand" href="/"><BrandMark/></Link><nav aria-label="Application"><Link href="/" aria-current={path==='/'?'page':undefined}>Home</Link><Link href="/allb" aria-current={publicView?'page':undefined}>Landings</Link><Link href="/workspace" aria-current={path.startsWith('/workspace')?'page':undefined}>Workspaces</Link><Link href="/ui" aria-current={path==='/ui'?'page':undefined}>MAATAA UI</Link><Link href="/studio/themes">Themes</Link><Link href="/studio/branding">Branding</Link><Link href="/enterprise/kanban">Execution</Link></nav></header>
 <div className={publicView?'public-surface':'ui-surface'}>{sidebar?<div className="shell"><aside><nav aria-label="Documentation">{[...new Set(routes.map(r=>r.group))].map(group=><details key={group} open={['Start','Components','Spatial','3D','Studio','Applications'].includes(group)}><summary>{group}</summary>{routes.filter(r=>r.group===group).map(r=><Link key={r.path} href={r.path} aria-current={path===r.path?'page':undefined}>{r.title}</Link>)}</details>)}</nav></aside><div id="content">{children}</div></div>:<div id="content">{children}</div>}</div>
 <footer className="app-footer">ALLB Cloud · one application · browser-local previews · production backend disconnected. <Link href="/readiness">Integration boundaries</Link></footer></>;
}
