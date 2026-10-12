import {FoundationError} from './repository.mjs';
const address=/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
// Internal adapter only. The caller must load recipient consent and message from
// durable authorized records; this method is never exposed as a public send API.
export async function sendCloudflareEmail(binding,{from,to,subject,text,consentRecorded},{timeoutMs=10000}={}){
 if(!binding||typeof binding.send!=='function')throw new FoundationError('EMAIL_BINDING_UNCONFIGURED',503);
 if(consentRecorded!==true)throw new FoundationError('CONSENT_REQUIRED',403);
 if(![from,to].every(v=>typeof v==='string'&&v.length<=254&&address.test(v))||typeof subject!=='string'||subject.length<1||subject.length>200||/[\r\n]/.test(subject)||typeof text!=='string'||new TextEncoder().encode(text).length>65536)throw new FoundationError('INVALID_NOTIFICATION');
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw new FoundationError('INVALID_TIMEOUT');
 let timer;
 try{
  const result=await Promise.race([binding.send({from,to,subject,text}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new FoundationError('EMAIL_OUTCOME_UNKNOWN',504)),timeoutMs);})]);
  if(!result||typeof result.messageId!=='string'||!result.messageId.length||result.messageId.length>200)throw new FoundationError('EMAIL_OUTCOME_UNKNOWN',504);
  return {status:'accepted',messageId:result.messageId,delivered:false};
 }catch(error){
  const uncertain=new FoundationError('EMAIL_OUTCOME_UNKNOWN',504);uncertain.reconciliationRequired=true;uncertain.retrySafe=false;
  // No automatic resend: the binding has no cancellation guarantee.
  if(error instanceof FoundationError&&error.code==='EMAIL_OUTCOME_UNKNOWN')throw uncertain;
  if(['E_SENDER_NOT_VERIFIED','E_RECIPIENT_NOT_ALLOWED','E_RECIPIENT_SUPPRESSED','E_VALIDATION_ERROR'].includes(error?.code))throw new FoundationError('EMAIL_SEND_REJECTED',502);
  throw uncertain;
 }finally{clearTimeout(timer);}
}
