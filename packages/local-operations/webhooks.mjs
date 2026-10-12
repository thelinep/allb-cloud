import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
const fail=code=>{throw Object.assign(Error(code),{code,status:code.includes('SIGNATURE')?401:code.includes('TIMESTAMP')?401:400});};
export function verifyLocalWebhook({bytes,timestamp,signature,secret,now=new Date()}){
 if(!Buffer.isBuffer(bytes)||bytes.length>32768||typeof secret!=='string'||secret.length<32||!/^\d{10}$/.test(timestamp??'')||!/^[a-f0-9]{64}$/.test(signature??''))fail('WEBHOOK_SIGNATURE_INVALID');
 if(Math.abs(now.getTime()-Number(timestamp)*1000)>300000)fail('WEBHOOK_TIMESTAMP_EXPIRED');
 const expected=createHmac('sha256',secret).update(`${timestamp}.`).update(bytes).digest();
 if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))fail('WEBHOOK_SIGNATURE_INVALID');
 let body;try{body=JSON.parse(bytes.toString('utf8'));}catch{fail('WEBHOOK_BODY_INVALID');}
 if(typeof body.eventId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(body.eventId))fail('WEBHOOK_BODY_INVALID');
 return {body,sha256:createHash('sha256').update(bytes).digest('hex')};
}
