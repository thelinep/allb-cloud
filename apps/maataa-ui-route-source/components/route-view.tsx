import routes from '../lib/routes.json';
import {guidance} from '../lib/guides';
import type {RouteSpec} from '../lib/contracts';
import {Playground} from './playground';
export function RouteView({spec}:{spec:RouteSpec}){return <main><p className="eyebrow">{spec.group} / local scaffold</p><h1>{spec.title}</h1><p className="lead">{spec.description}</p><p className="notice">Documentation and illustrative local state. No real authentication, storage or telemetry.</p><Playground spec={spec}/><section><h2>Implementation boundaries</h2><ul>{(guidance[spec.group]||guidance.Components).map(item=><li key={item}>{item}</li>)}</ul></section><details><summary>Route contract</summary><pre>{JSON.stringify(spec,null,2)}</pre></details></main>}
export function lookup(path:string){return routes.find(r=>r.path===path)}
