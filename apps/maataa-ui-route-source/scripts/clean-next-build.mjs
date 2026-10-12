// Generated output only. Persistent route caches can otherwise retain HTML
// referencing chunks removed by a later Next/OpenNext build.
import {rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(app,'.next');
if(path.basename(app)!=='maataa-ui-route-source'||path.dirname(output)!==app||path.basename(output)!=='.next'){
 throw new Error('Refusing to clean an unexpected build directory.');
}
await rm(output,{recursive:true,force:true});
console.log('Removed generated .next output before coherent production build.');
