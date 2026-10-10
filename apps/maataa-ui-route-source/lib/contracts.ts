export type Vec3=[number,number,number];
export interface SceneNode {id:string;name:string;position:Vec3;rotation:Vec3;scale:Vec3;visible:boolean;color:string}
export interface SceneDocument {id:string;schemaVersion:1;revision:number;units:'m';coordinateSystem:{kind:'local';axes:'Y-up';origin:Vec3};nodes:SceneNode[]}
export const sceneFixture:SceneDocument={id:'demo-scene',schemaVersion:1,revision:0,units:'m',coordinateSystem:{kind:'local',axes:'Y-up',origin:[0,0,0]},nodes:[{id:'stage',name:'Stage',position:[0,0,0],rotation:[0,0,0],scale:[3,1,2],visible:true,color:'#bca36f'},{id:'table',name:'Table',position:[3,0,2],rotation:[0,0,0],scale:[1,1,1],visible:true,color:'#c4dc79'}]};
export type RouteSpec={path:string;group:string;title:string;mode:string;description:string};
