import type { SceneDocument as AllbScene } from '../../apps/maataa-ui-route-source/lib/contracts.ts';
import type { SceneDocument as NevoScene, SceneQuaternion } from './vendor/scene.ts';
import { validateSceneDocument } from './vendor/scene.ts';
export const UPSTREAM_COMMIT = 'f50af9dd91b987080faa8fa00f2416b73cf8de78';
export class SceneAdapterError extends Error { constructor(message:string){super(message);this.name='SceneAdapterError';} }
const fail=(message:string):never=>{throw new SceneAdapterError(message)};
const vector=(a:unknown):a is [number,number,number]=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const text=(s:unknown)=>typeof s==='string'&&s.trim().length>0;
const counter=(n:number)=>Number.isSafeInteger(n)&&n>=0;
function checkAllb(s:AllbScene){
 if(s.schemaVersion!==1||!counter(s.revision)||!text(s.id))fail('Invalid ALLB schema, revision or identifier');
 if(s.units!=='m'||s.coordinateSystem?.kind!=='local'||s.coordinateSystem.axes!=='Y-up'||!vector(s.coordinateSystem.origin)||s.coordinateSystem.origin.some(n=>n!==0))fail('Only meter local Y-up scenes with zero origin are supported');
 const ids=new Set<string>();for(const n of s.nodes){if(!text(n.id)||ids.has(n.id)||!text(n.name)||![n.position,n.rotation,n.scale].every(vector)||n.scale.some(v=>v<=0)||typeof n.visible!=='boolean'||!/^#[a-f\d]{6}$/i.test(n.color))fail('Invalid ALLB node');ids.add(n.id);}
}
function quaternion([x,y,z]:[number,number,number]):SceneQuaternion{const c1=Math.cos(x/2),c2=Math.cos(y/2),c3=Math.cos(z/2),s1=Math.sin(x/2),s2=Math.sin(y/2),s3=Math.sin(z/2);return{x:s1*c2*c3+c1*s2*s3,y:c1*s2*c3-s1*c2*s3,z:c1*c2*s3+s1*s2*c3,w:c1*c2*c3-s1*s2*s3};}
function euler(q:SceneQuaternion):[number,number,number]{const{x,y,z,w}=q;const m13=2*(x*z+y*w);return Math.abs(m13)<.9999999?[Math.atan2(2*(x*w-y*z),1-2*(x*x+y*y)),Math.asin(Math.max(-1,Math.min(1,m13))),Math.atan2(2*(z*w-x*y),1-2*(y*y+z*z))]:[Math.atan2(2*(x*w+y*z),1-2*(x*x+z*z)),Math.asin(Math.max(-1,Math.min(1,m13))),0];}
const xyz=([x,y,z]:[number,number,number])=>({x,y,z});
export interface ImportContext{eventId:string;organizationId:string;name:string;actorId:string;at:string;eulerConvention:'XYZ-radians';handedness:'right-handed'}
/** Context must come from an authorized server boundary; no tenant authority is inferred from scene data. */
export function toNevo(s:AllbScene,c:ImportContext):NevoScene{
 checkAllb(s);if(c.eulerConvention!=='XYZ-radians'||c.handedness!=='right-handed')fail('Explicit XYZ radians and right-handed interpretation required');
 if(![c.eventId,c.organizationId,c.name,c.actorId].every(text)||!Number.isFinite(Date.parse(c.at)))fail('Explicit tenant, event and provenance required');
 return{id:s.id,schemaVersion:1,version:s.revision,eventId:c.eventId,organizationId:c.organizationId,name:c.name,units:'m',coordinateSystem:'right-handed-y-up',nodes:s.nodes.map(n=>({id:n.id,kind:'asset',name:n.name,transform:{position:xyz(n.position),rotation:quaternion(n.rotation),scale:xyz(n.scale)},metadata:{'allb.visible':n.visible,'allb.color':n.color}})),cameras:[],layers:[],annotations:[],provenance:{createdAt:c.at,createdBy:c.actorId,updatedAt:c.at,updatedBy:c.actorId,source:'import'}};
}
export interface SceneProjection{scene:AllbScene;preserved:NevoScene;limitations:string[]}
/** Flat ALLB previews cannot express hierarchy, camera, annotations, references or NEVO provenance. Preserve them out-of-band. */
export function fromNevo(s:NevoScene):SceneProjection{
 if(s.schemaVersion!==1||!counter(s.version)||!text(s.id)||!text(s.eventId)||!text(s.organizationId))fail('Invalid NEVO schema, version or identifiers');
 if(s.units!=='m'||s.coordinateSystem!=='right-handed-y-up')fail('Feet and Z-up require an explicit future transform adapter');
 if(!Array.isArray(s.nodes)||!Array.isArray(s.cameras)||!Array.isArray(s.layers)||!Array.isArray(s.annotations)||!s.provenance||![s.provenance.createdBy,s.provenance.updatedBy].every(text)||![s.provenance.createdAt,s.provenance.updatedAt].every(t=>Number.isFinite(Date.parse(t)))||!['manual','import','maataa_suggestion'].includes(s.provenance.source))fail('Invalid NEVO provenance or collections');
 if(!validateSceneDocument(s).valid)fail('Invalid NEVO scene graph');
 for(const n of s.nodes){const t=n.transform,q=t.rotation;if(![t.position.x,t.position.y,t.position.z,t.scale.x,t.scale.y,t.scale.z,q.x,q.y,q.z,q.w].every(Number.isFinite)||[t.scale.x,t.scale.y,t.scale.z].some(v=>v<=0)||Math.abs(Math.hypot(q.x,q.y,q.z,q.w)-1)>1e-6)fail('Invalid transform or non-unit quaternion');if(n.parentId)fail('Hierarchy cannot be projected without flattening transforms');}
 const scene:AllbScene={id:s.id,schemaVersion:1,revision:s.version,units:'m',coordinateSystem:{kind:'local',axes:'Y-up',origin:[0,0,0]},nodes:s.nodes.map(n=>({id:n.id,name:n.name,position:[n.transform.position.x,n.transform.position.y,n.transform.position.z],rotation:euler(n.transform.rotation),scale:[n.transform.scale.x,n.transform.scale.y,n.transform.scale.z],visible:typeof n.metadata?.['allb.visible']==='boolean'?n.metadata['allb.visible']:true,color:typeof n.metadata?.['allb.color']==='string'&&/^#[a-f\d]{6}$/i.test(n.metadata['allb.color'])?n.metadata['allb.color']:'#bca36f'}))};
 checkAllb(scene);
 return{scene,preserved:structuredClone(s),limitations:['Projection is a local preview; references are unresolved.','NEVO provenance, semantic kinds, references, layers, cameras and annotations remain in the preservation envelope.','Visibility and color defaults are presentation decisions.']};
}
/** Restores only an unchanged projection; edited previews require a separate explicit merge policy. */
export function restoreNevo(p:SceneProjection):NevoScene{if(JSON.stringify(p.scene)!==JSON.stringify(fromNevo(p.preserved).scene))fail('Edited projection requires explicit merge; refusing version or metadata loss');return structuredClone(p.preserved);}
