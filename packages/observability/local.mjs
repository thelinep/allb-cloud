import {randomBytes} from 'node:crypto';
const registryKey=Symbol.for('allb.local.observability');
const state=()=>globalThis[registryKey]??= {startedAt:Date.now(),requests:0,errors:0,totalMilliseconds:0,buckets:[0,0,0,0,0],channels:{}};
const safeChannel=value=>['design-api','database-local','database-postgres','diagnostics-api'].includes(value)?value:'other';
export function traceContext(request){const parent=request?.headers?.get('traceparent')?.match(/^00-([a-f0-9]{32})-([a-f0-9]{16})-[a-f0-9]{2}$/);return{traceId:parent&& !/^0+$/.test(parent[1])&&!/^0+$/.test(parent[2])?parent[1]:randomBytes(16).toString('hex'),spanId:randomBytes(8).toString('hex')};}
export function record({channel,status,durationMilliseconds,traceId,spanId},write){
 const s=state(),name=safeChannel(channel),duration=Number.isFinite(durationMilliseconds)?Math.max(0,Math.min(durationMilliseconds,3600000)):0,code=Number.isInteger(status)&&status>=100&&status<=599?status:500;
 s.requests++;s.errors+=code>=500?1:0;s.totalMilliseconds+=duration;s.buckets[duration<=10?0:duration<=100?1:duration<=1000?2:duration<=10000?3:4]++;
 const row=s.channels[name]??={requests:0,errors:0};row.requests++;row.errors+=code>=500?1:0;
 const event={schemaVersion:1,event:'operation.completed',channel:name,status:code,durationMilliseconds:Math.round(duration),traceId:/^[a-f0-9]{32}$/.test(traceId??'')?traceId:undefined,spanId:/^[a-f0-9]{16}$/.test(spanId??'')?spanId:undefined};
 if(write)write(JSON.stringify(event));return event;
}
/** @param {string} channel @param {()=>Promise<any>} operation @param {{request?:Request,write?:(line:string)=>void}} [options] */
export async function observe(channel,operation,{request,write=process.env.ALLB_DIAGNOSTICS_LOGS==='1'?line=>console.info(line):undefined}={}){
 const start=performance.now(),trace=traceContext(request);let status=200;
 try{const result=await operation();if(result instanceof Response){status=result.status;result.headers.set('X-Trace-ID',trace.traceId);}return result;}catch(error){status=500;throw error;}finally{record({channel,status,durationMilliseconds:performance.now()-start,...trace},write);}
}
export function snapshot(){const s=state();return{schemaVersion:1,mode:'process-local',startedAt:new Date(s.startedAt).toISOString(),observedAt:new Date().toISOString(),requests:s.requests,errors:s.errors,totalMilliseconds:Math.round(s.totalMilliseconds),latencyBuckets:{boundariesMilliseconds:[10,100,1000,10000],counts:[...s.buckets]},channels:structuredClone(s.channels),limitations:['Counters reset on process restart.','No distributed exporter or alert delivery is connected.','Errors count server failures; business denials retain their HTTP status.']};}
