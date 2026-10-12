import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
const packages=Object.entries(lock.packages).filter(([path,p])=>path.includes('node_modules/')&&!p.link).map(([path,p])=>({path,name:path.split('node_modules/').at(-1),version:p.version,license:p.license??'UNDECLARED',integrityPresent:typeof p.integrity==='string',resolvedProtocol:p.resolved?.split(':')[0]??null}));
const audit=spawnSync('npm',['audit','--json'],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:60000});
let parsed;try{parsed=JSON.parse(audit.stdout);}catch{parsed={error:{message:'audit did not return JSON'}};}
const report={schemaVersion:1,generatedAt:new Date().toISOString(),scope:'root npm workspace lockfile, not unrelated archived nested locks',packages,licenseSummary:Object.fromEntries([...new Set(packages.map(p=>p.license))].sort().map(license=>[license,packages.filter(p=>p.license===license).length])),audit:{exitCode:audit.status,signal:audit.signal,metadata:parsed.metadata??null,vulnerabilities:parsed.vulnerabilities??{},error:parsed.error??null},reviewLimitations:['License fields are declared metadata, not a legal approval.','No upstream source/content review or package-install sandbox analysis is claimed.','Npm audit is advisory-database coverage at execution time, not absence of all vulnerabilities.','Original imported platform package source manifests remain covered by byte-exact archive provenance.']};
writeFileSync(new URL('../artifacts/hardening/dependency-review.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({packages:packages.length,licenses:report.licenseSummary,audit:report.audit.metadata?.vulnerabilities,error:report.audit.error,exitCode:audit.status}));
if(audit.error||report.audit.error)process.exitCode=2;else if(audit.status)process.exitCode=1;
