import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const [registry,execution]=await Promise.all(['enterprise-task-registry.json','enterprise-execution.json'].map(name=>readFile(new URL('docs/'+name,root),'utf8').then(JSON.parse)));
await writeFile(new URL('apps/maataa-ui-route-source/lib/enterprise-execution-snapshot.json',root),JSON.stringify({registry,execution},null,2)+'\n');
console.log('Execution snapshot synchronized; rebuild deployed app for updated status.');
