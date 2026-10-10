export const tools=[
 {path:'/studio/workspaces/demo-workspace',title:'Workspace preview',description:'Inspect the existing local workspace contract.'},
 {path:'/scene/2d-3d',title:'Scene authoring',description:'Local scene transforms, history and export.'},
 {path:'/spatial/map',title:'Spatial tools',description:'Schematic geometry and measurement previews.'},
 {path:'/data/tables',title:'Data tools',description:'Local table, search and filter examples.'},
 {path:'/components',title:'Component library',description:'Browse reusable interface examples.'},
 {path:'/studio/audit',title:'Review and audit',description:'Inspect illustrative review contracts; no production audit service.'},
 {path:'/studio/themes',title:'Theme Studio',description:'Configure appearance across routes and brands.'},
 {path:'/studio/branding',title:'Branding Studio',description:'Configure identity, logo, favicon and hero.'}
] as const;
export function toolsFor(category:string){const primary=category==='Production'?[1,0,5]:category==='Science'?[2,3,0]:category==='Developers'?[4,3,0]:[0,4,3];return [...new Set([...primary,6,7,1,2,5])].map(i=>tools[i]);}
