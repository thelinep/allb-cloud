import Link from 'next/link';
import {allbLandings} from '../../lib/allb-landings';
export const metadata={title:'Brand workspaces'};
export default function Page(){return <main><p className="eyebrow">ALLB / applications</p><h1>Brand workspaces</h1><p className="lead">Choose a brand to open its shared MAATAA tools and design configuration.</p><div className="cards">{allbLandings.map(item=><Link className="card" href={'/workspace/'+item.slug} key={item.slug}><small>{item.category}</small><h2>{item.title}</h2><p>{item.description}</p></Link>)}</div></main>;}
