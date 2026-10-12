import {createHash} from 'node:crypto';
const canonical=value=>value instanceof Date?value.toISOString():Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
/** Export-only attestation. Persist its anchor independently; it cannot establish live DB completeness. */
export function attest(records){
 let previous=null;
 const rows=records.map((record,index)=>{const envelope={sequence:index+1,previous,record};const hash=digest(envelope);previous=hash;return {...envelope,hash};});
 return {schemaVersion:1,rows,anchor:{count:rows.length,tail:previous}};
}
export function verify(exported, trustedAnchor){
 if(!trustedAnchor||!Number.isSafeInteger(trustedAnchor.count)||trustedAnchor.count<0||!Array.isArray(exported?.rows)||exported.schemaVersion!==1||exported.rows.length!==trustedAnchor.count)return false;
 let previous=null;
 for(const [index,row] of exported.rows.entries()){
  if(row.sequence!==index+1||row.previous!==previous||row.hash!==digest({sequence:row.sequence,previous:row.previous,record:row.record}))return false;
  previous=row.hash;
 }
 return previous===trustedAnchor.tail;
}
/** Safe default: no automatic deletion of immutable evidence or financial history. */
export function retentionDecision({kind,legalHold=false,expiresAt,now=Date.now()}){
 if(legalHold||['audit','approval','handoff','financial','event-version','scene-version'].includes(kind))return 'retain';
 if(!['cache','temporary-export'].includes(kind))return 'retain';
 const expires=Date.parse(expiresAt);
 return Number.isFinite(expires)&&expires<=now?'eligible_for_review':'retain';
}
