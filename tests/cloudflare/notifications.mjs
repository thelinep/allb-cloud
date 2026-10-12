import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {sendCloudflareEmail} from '../../packages/cloudflare-foundation/notifications.mjs';
const input={from:'sender@example.com',to:'recipient@example.com',subject:'Local qualification',text:'Synthetic notification fixture',consentRecorded:true};
const checks=[];async function check(name,fn){await fn();checks.push({name,pass:true});}
await check('missing binding fails closed',()=>assert.rejects(sendCloudflareEmail(null,input),/UNCONFIGURED/));
await check('missing durable consent refuses send',()=>assert.rejects(sendCloudflareEmail({send(){throw Error('must not call');}},{...input,consentRecorded:false}),/CONSENT/));
await check('header injection and multiple recipients refused',async()=>{await assert.rejects(sendCloudflareEmail({send(){}},{...input,subject:'subject\r\nBcc: outsider@example.com'}),/INVALID/);await assert.rejects(sendCloudflareEmail({send(){}},{...input,to:'a@example.com,b@example.com'}),/INVALID/);});
await check('native structured binding contract records acceptance not delivery',async()=>{let calls=0;const result=await sendCloudflareEmail({send:async message=>{calls++;assert.deepEqual(Object.keys(message).sort(),['from','subject','text','to']);return {messageId:'synthetic-fixture'};}},input);assert.equal(calls,1);assert.equal(result.status,'accepted');assert.equal(result.delivered,false);});
await check('unknown timeout redacted and never automatically resent',async()=>{let calls=0;await assert.rejects(sendCloudflareEmail({send:()=>{calls++;return new Promise(()=>{});}},input,{timeoutMs:5}),e=>e.code==='EMAIL_OUTCOME_UNKNOWN'&&e.retrySafe===false&&e.reconciliationRequired===true);assert.equal(calls,1);});
await check('provider error details not leaked',()=>assert.rejects(sendCloudflareEmail({send:async()=>{throw Error('private recipient and secret');}},input),e=>e.message==='EMAIL_OUTCOME_UNKNOWN'));
await check('unverified sender rejected without delivery claim',()=>assert.rejects(sendCloudflareEmail({send:async()=>{const e=Error('private address');e.code='E_SENDER_NOT_VERIFIED';throw e;}},input),/EMAIL_SEND_REJECTED/));
await mkdir(new URL('../../artifacts/cloudflare-native/',import.meta.url),{recursive:true});await writeFile(new URL('../../artifacts/cloudflare-native/notifications.json',import.meta.url),JSON.stringify({externalWrites:false,transport:'mocked native EMAIL binding',productionCertified:false,checks},null,2)+'\n');console.log(checks.length+' notification checks passed; no email sent');
