/** Shared contracts only; no branch creates its own authentication authority. */
export const sharedContracts=Object.freeze({identity:1,tenancy:1,design:1,assets:1,event:1,commercial:1});
export const mandatoryReleaseGates=Object.freeze(['workflow-implemented','isolation-verified','domain-acceptance','operations-verified','staging-signoff','publication-authorized']);
export function compatibility(required,available=sharedContracts){
 if(!required||typeof required!=='object'||Array.isArray(required)||Object.keys(required).length===0)return {compatible:false,reasons:['EMPTY_CONTRACT_REQUIREMENTS']};
 const reasons=Object.entries(required).flatMap(([key,major])=>!Number.isSafeInteger(major)||major<1||available[key]!==major?[`INCOMPATIBLE:${key}`]:[]);
 return {compatible:reasons.length===0,reasons};
}
export function canPublish(entry,{gates=[],available=sharedContracts}={}){
 return entry?.authority==='shared-maataa'&&compatibility(entry.requiredContracts,available).compatible&&mandatoryReleaseGates.every(gate=>gates.includes(gate));
}
