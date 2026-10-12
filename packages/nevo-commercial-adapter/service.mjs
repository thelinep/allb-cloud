import {transition} from '../nevo-workflow/workflow.mjs';
import {mapHandoff,createHandoffPolicy,decimalToMinor,CommercialAdapterError} from './adapter.mjs';
import {eventRecords} from '../nevo-records/repository.mjs';

export const settledPaymentPolicy=createHandoffPolicy({id:'allb-local-settlement-evidence',version:1,paymentGate:'settled_payment',currency:'INR'});
const commands=Object.freeze({layout:{action:'design.edit',role:'planner',allowed:['ADMIN','SUPER_ADMIN','PRODUCER']},quote:{action:'design.edit',role:'commercial',allowed:['ADMIN','SUPER_ADMIN','PRODUCER']},review:{action:'design.review',role:'commercial_reviewer',allowed:['ADMIN','SUPER_ADMIN','FINANCE']},decide:{action:'design.read',role:'client',allowed:['CLIENT']},booking:{action:'design.edit',role:'commercial',allowed:['ADMIN','SUPER_ADMIN','PRODUCER']},payment:{action:'design.review',role:'finance',allowed:['ADMIN','SUPER_ADMIN','FINANCE']},handoff:{action:'design.edit',role:'production',allowed:['ADMIN','SUPER_ADMIN','PRODUCER']}});
const fail=code=>{throw new CommercialAdapterError(code);};
const text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=300;
export function commercialPermission(type){if(!Object.hasOwn(commands,type))fail('INVALID_COMMAND');return commands[type].action;}
export function commercialActor(context,type){const spec=commands[type];if(!spec||!spec.allowed.includes(context.nevoRole))fail('ROLE_DENIED');return{id:context.userId,organizationId:context.organizationId,workspaceId:context.workspaceId,roles:[spec.role]};}
/** Local evidence is an authenticated assertion, never a provider settlement verification. */
export function commercialTransition(record,command,actor,{at=new Date().toISOString()}={}){
 const type=command?.type,p=command?.payload??{};
 if(!Object.hasOwn(commands,type))fail('INVALID_COMMAND');
 if(actor.organizationId!==record.organizationId||actor.workspaceId!==record.workspaceId||!actor.roles.includes(commands[type].role))fail('SCOPE_OR_ROLE_DENIED');
 if(type==='handoff'&&record.handoff?.policy){const result=mapHandoff({record,booking:record.booking,payment:record.paymentEvidence,policy:settledPaymentPolicy,actor,at,existing:record.handoff});return{state:record,replay:result.replay};}
 if(record.status==='handed_off')fail('RECORD_FROZEN');
 if(['layout','quote','review','decide'].includes(type)){const next=JSON.parse(JSON.stringify(transition(record,command,actor,{expectedRevision:record.revision,at})));if(['layout','quote'].includes(type)){next.booking=null;next.paymentEvidence=null;}return{state:next,replay:false};}
 const next=JSON.parse(JSON.stringify(record));
 const quote=record.quotes?.at(-1);
 if(type==='booking'){
  if(record.status!=='approved'||!quote||!text(p.id)||record.booking)fail('INVALID_BOOKING');
  next.booking={id:p.id,eventId:record.id,organizationId:record.organizationId,workspaceId:record.workspaceId,quoteId:quote.id,quoteVersion:quote.version,quoteStatus:'ACCEPTED',status:'CONFIRMED',source:'local_confirmation',confirmedBy:actor.id,confirmedAt:at};
 }else if(type==='payment'){
  if(record.status!=='approved'||!record.booking||record.paymentEvidence||!text(p.id)||!text(p.evidenceReference)||p.currency!==settledPaymentPolicy.currency)fail('INVALID_PAYMENT_EVIDENCE');
  const amountMinor=decimalToMinor(p.amount);if(BigInt(amountMinor)<=0n)fail('POSITIVE_SETTLEMENT_REQUIRED');
  next.paymentEvidence={id:p.id,bookingId:record.booking.id,organizationId:record.organizationId,workspaceId:record.workspaceId,status:'SUCCEEDED',currency:p.currency,amount:p.amount,source:'local_recorded_evidence',providerVerified:false,evidenceReference:p.evidenceReference,recordedBy:actor.id,recordedAt:at};
 }else{
  const result=mapHandoff({record,booking:record.booking,payment:record.paymentEvidence,policy:settledPaymentPolicy,actor,at});
  next.handoff={...result.handoff,evidenceMode:'local_recorded_evidence',providerVerified:false};next.status='handed_off';
 }
 next.revision+=1;next.audit.push({revision:next.revision,action:type,actorId:actor.id,at});return{state:next,replay:false};
}
/** Row lock, optimistic revision and immutable append all share the caller's authorized transaction. */
export async function mutateCommercial(tx,context,eventId,{expectedRevision,command}){
 const actor=commercialActor(context,command?.type);
 const row=await eventRecords.read(tx,context,eventId,{lock:true});if(!row)fail('NOT_FOUND');
 if(expectedRevision!==row.revision)fail('STALE_REVISION');
 const result=commercialTransition(row.state,command,actor);
 if(command.type==='layout')await eventRecords.saveScene(tx,context,{eventId,sceneId:command.payload.scene.id,expectedRevision:command.payload.expectedSceneRevision??command.payload.scene.revision,document:command.payload.scene});
 return{event:result.replay?row:await eventRecords.save(tx,context,{id:eventId,expectedRevision,state:result.state}),replay:result.replay,evidenceMode:'local_recorded_evidence',providerVerified:false};
}
