/** Read-only release assessment. Evidence flags are not approval signatures. */
export const requiredGates=Object.freeze(['staging','database','identity','assets','providers','security','recovery','accessibility','compatibility','performance','visualApproval','businessAcceptance','operationsOwners','rolloutAuthorization']);
export function assessRelease(candidate){
 if(!candidate||candidate.schemaVersion!==1||typeof candidate.commit!=='string'||!candidate.gates||typeof candidate.gates!=='object')throw new TypeError('Invalid release evidence manifest');
 const unknown=Object.keys(candidate.gates).filter(name=>!requiredGates.includes(name));if(unknown.length)throw new TypeError('Unknown release gate');
 const blockers=requiredGates.flatMap(name=>{const gate=candidate.gates[name];if(!gate||gate.status!=='verified'||!Array.isArray(gate.evidence)||!gate.evidence.length||gate.evidence.some(path=>typeof path!=='string'||!path.trim())||gate.scope!=='production-like')return[{gate:name,reason:gate?.reason??'Verified production-like evidence required'}];return[];});
 return{schemaVersion:1,ready:!blockers.length,blockers,mode:'read-only-assessment',authority:'Assessment never provisions, deploys or grants approval.'};
}
