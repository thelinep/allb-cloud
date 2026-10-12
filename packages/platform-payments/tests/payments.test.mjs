import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { LocalPaymentProvider, isPaymentIdempotencyConflict } from '../dist/index.js';
import { DirectUpiPaymentProvider } from '../dist/upi/direct-integration.js';
import * as razorpay from '../dist/razorpay.js';
const config = {bankApiBaseUrl:'https://bank.example/base',bankApiKey:'test-key',merchantVpa:'merchant@bank',webhookSecret:'secret',terminalId:'terminal'};
const hmac = (body, secret='secret') => createHmac('sha256',secret).update(body).digest('hex');

test('local reference bytes and pending-only refund/intent results stay unchanged', async () => {
 const p=new LocalPaymentProvider();
 assert.deepEqual(await p.createIntent({idempotencyKey:'a / नमस्ते'}),{providerReference:'local-payment-a / नमस्ते',status:'PENDING'});
 assert.deepEqual(await p.refund({providerReference:'ref/x'}),{providerReference:'local-refund-ref/x',status:'PENDING'});
});
test('local verifier retains missing, bad, valid and malformed signature behavior', async () => {
 const p=new LocalPaymentProvider();const payload='{"a":1}';
 assert.equal(await p.verifyWebhook({payload}),false);
 assert.equal(await p.verifyWebhook({payload,secret:'secret',signature:hmac(payload)}),true);
 assert.equal(await p.verifyWebhook({payload,secret:'secret',signature:'sha256='+hmac(payload)}),true);
 assert.equal(await p.verifyWebhook({payload:'changed',secret:'secret',signature:hmac(payload)}),false);
 await assert.rejects(p.verifyWebhook({payload,secret:'secret',signature:'z'.repeat(64)}),{code:'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH'});
});
test('UPI HTTP paths, JSON bytes, headers and results are preserved', async t => {
 const calls=[];t.mock.method(globalThis,'fetch',async (...args)=>{calls.push(args);return Response.json({reference:'bank-ref'});});
 const p=new DirectUpiPaymentProvider(config);
 assert.deepEqual(await p.createIntent({amount:123,currency:'INR',idempotencyKey:'key'}),{providerReference:'bank-ref',status:'PENDING'});
 assert.equal(calls[0][0],'https://bank.example/payments/intents');
 assert.equal(calls[0][1].body,'{"amount":123,"currency":"INR","payeeVpa":"merchant@bank","terminalId":"terminal","idempotencyKey":"key"}');
 assert.deepEqual(calls[0][1].headers,{'Content-Type':'application/json',Authorization:'Bearer test-key'});
 assert.ok(calls[0][1].signal instanceof AbortSignal);
 assert.deepEqual(await p.refund({providerReference:'a/b ?',amount:10}),{providerReference:'bank-ref',status:'PENDING'});
 assert.equal(calls[1][0],'https://bank.example/payments/a%2Fb%20%3F/refunds');assert.equal(calls[1][1].body,'{"amount":10}');
});
test('UPI configuration and HTTP failures retain original errors', async t => {
 assert.throws(()=>new DirectUpiPaymentProvider({...config,bankApiBaseUrl:'bad'}),/URL is invalid/);
 assert.throws(()=>new DirectUpiPaymentProvider({...config,bankApiBaseUrl:'http://bank.example'}),/credential-free HTTPS/);
 assert.throws(()=>DirectUpiPaymentProvider.fromEnvironment({}),/configuration is incomplete/);
 t.mock.method(globalThis,'fetch',async()=>new Response('',{status:503}));
 await assert.rejects(new DirectUpiPaymentProvider(config).refund({providerReference:'ref',amount:1}),{message:'Bank UPI API request failed: 503'});
});
test('UPI signature parsing remains distinct from local verifier', async()=>{
 const p=new DirectUpiPaymentProvider(config);const payload='raw\nbody';
 assert.equal(await p.verifyWebhook({payload,signature:hmac(payload)}),true);
 assert.equal(await p.verifyWebhook({payload,signature:'z'.repeat(64)}),false);
 assert.equal(await p.verifyWebhook({payload,signature:hmac(payload,'override'),secret:'override'}),true);
 // Buffer.from(hex) legacy parsing accepts a non-hex suffix after the digest.
 assert.equal(await p.verifyWebhook({payload,signature:hmac(payload)+'zz'}),true);
});
test('idempotency classifier preserves existing shapes without owning DB retries',()=>{
 for(const value of [null,undefined,'P2002',new Error('P2002'),{code:'other'}])assert.equal(isPaymentIdempotencyConflict(value),false);
 assert.equal(isPaymentIdempotencyConflict({code:'P2002'}),true);
});
test('Razorpay request and signature bytes remain unchanged',async t=>{
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='secret';
 const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);return Response.json({id:'order-1'});});
 assert.deepEqual(await razorpay.createRazorpayOrder({amount:101,currency:'',receipt:'receipt',notes:{x:'y'}}),{id:'order-1'});
 assert.equal(calls[0][0],'https://api.razorpay.com/v1/orders');
 assert.equal(calls[0][1].body,'{"amount":101,"currency":"INR","receipt":"receipt","notes":{"x":"y"}}');
 assert.equal(calls[0][1].headers.Authorization,'Basic '+Buffer.from('id:key').toString('base64'));
 assert.equal(razorpay.verifyWebhookSignature('raw',hmac('raw')),true);
 assert.equal(razorpay.verifyWebhookSignature('raw','sha256='+hmac('raw')),false);
 assert.equal(razorpay.verifyPaymentSignature('order','payment',hmac('order|payment','key')),true);
 await razorpay.getPaymentDetails('payment-1');assert.equal(calls[1][0],'https://api.razorpay.com/v1/payments/payment-1');
});
test('Razorpay error messages and configuration gate stay unchanged',async t=>{
 const old={...process.env};t.after(()=>{process.env=old;});
 delete process.env.RAZORPAY_KEY_ID;assert.throws(()=>razorpay.getRazorpayConfig(),{message:'Razorpay credentials not configured'});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='secret';
 t.mock.method(globalThis,'fetch',async()=>Response.json({error:{description:'declined'}},{status:400}));
 await assert.rejects(razorpay.createRazorpayOrder({amount:1,currency:'INR',receipt:'r'}),{message:'Razorpay error: declined'});
 await assert.rejects(razorpay.getPaymentDetails('id'),{message:'Failed to fetch payment details'});
});
test('RazorpayPaymentProvider.createIntent maps to a Razorpay order with a bounded, deterministic receipt', async t => {
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='whsecret';
 const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);return Response.json({id:'order_abc123'});});
 const provider=razorpay.RazorpayPaymentProvider.fromEnvironment();
 const longKey='a'.repeat(120);
 const result=await provider.createIntent({amount:5000,currency:'INR',idempotencyKey:longKey});
 assert.deepEqual(result,{providerReference:'order_abc123',status:'PENDING'});
 const body=JSON.parse(calls[0][1].body);
 assert.equal(body.amount,500000);assert.equal(body.currency,'INR'); // 5000 rupees -> 500000 paise
 assert.ok(body.receipt.length<=40,'receipt must fit Razorpay\'s 40-char limit');
 assert.equal(body.receipt,razorpay.razorpayReceiptFromIdempotencyKey(longKey));
 // Same idempotency key always derives the same receipt (retry-safe, matches NEVO's own idempotency discipline).
 assert.equal(razorpay.razorpayReceiptFromIdempotencyKey(longKey),razorpay.razorpayReceiptFromIdempotencyKey(longKey));
 assert.notEqual(razorpay.razorpayReceiptFromIdempotencyKey('key-a'),razorpay.razorpayReceiptFromIdempotencyKey('key-b'));
});
test('RazorpayPaymentProvider.refund targets the payment id it is given and never invents an amount', async t => {
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='whsecret';
 const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);return Response.json({id:'rfnd_xyz'});});
 const provider=razorpay.RazorpayPaymentProvider.fromEnvironment();
 const result=await provider.refund({providerReference:'pay_captured1',amount:250});
 assert.deepEqual(result,{providerReference:'rfnd_xyz',status:'PENDING'});
 assert.equal(calls[0][0],'https://api.razorpay.com/v1/payments/pay_captured1/refund');
 assert.deepEqual(JSON.parse(calls[0][1].body),{amount:25000}); // 250 rupees -> 25000 paise
});
test('RazorpayPaymentProvider.createIntent/refund round fractional-rupee amounts to whole paise', async t => {
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='whsecret';
 const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);return Response.json({id:'order_1'});});
 const provider=razorpay.RazorpayPaymentProvider.fromEnvironment();
 await provider.createIntent({amount:19.99,currency:'INR',idempotencyKey:'k'});
 assert.equal(JSON.parse(calls[0][1].body).amount,1999); // 19.99 rupees -> 1999 paise, not 1998 (float drift) or 19.99
});
test('RazorpayPaymentProvider.verifyWebhook uses its own configured secret, never a generic input.secret', async t => {
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.RAZORPAY_KEY_ID='id';process.env.RAZORPAY_KEY_SECRET='key';process.env.RAZORPAY_WEBHOOK_SECRET='the-real-razorpay-secret';
 const provider=razorpay.RazorpayPaymentProvider.fromEnvironment();
 const payload='{"event":"payment.captured"}';
 const correctSignature=hmac(payload,'the-real-razorpay-secret');
 assert.equal(await provider.verifyWebhook({payload,signature:correctSignature}),true);
 // A signature computed with some other secret (e.g. NEVO's generic shared webhook token,
 // or another provider's secret) must never verify -- this is the cross-provider spoofing guard.
 assert.equal(await provider.verifyWebhook({payload,signature:hmac(payload,'some-other-secret')}),false);
 // Passing an unrelated "secret" in the input must not be consulted at all.
 assert.equal(await provider.verifyWebhook({payload,signature:correctSignature,secret:'attacker-supplied-secret'}),true);
 assert.equal(await provider.verifyWebhook({payload}),false);
});
test('RazorpayPaymentProvider.fromEnvironment fails closed (throws) on incomplete credentials', () => {
 assert.throws(()=>razorpay.RazorpayPaymentProvider.fromEnvironment({}),/Razorpay credentials not configured/);
 assert.throws(()=>razorpay.RazorpayPaymentProvider.fromEnvironment({RAZORPAY_KEY_ID:'id',RAZORPAY_KEY_SECRET:'key'}),/Razorpay credentials not configured/);
});
test('createRazorpayRefund posts to the payment-scoped refund endpoint and surfaces provider errors verbatim', async t => {
 const config={keyId:'id',keySecret:'key',webhookSecret:'wh'};
 const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);return Response.json({id:'rfnd_1',status:'processed'});});
 const result=await razorpay.createRazorpayRefund('pay_1',{amount:99,notes:{x:'y'}},config);
 assert.deepEqual(result,{id:'rfnd_1',status:'processed'});
 assert.equal(calls[0][0],'https://api.razorpay.com/v1/payments/pay_1/refund');
 assert.equal(calls[0][1].headers.Authorization,'Basic '+Buffer.from('id:key').toString('base64'));
 assert.deepEqual(JSON.parse(calls[0][1].body),{amount:99,notes:{x:'y'}});
 t.mock.method(globalThis,'fetch',async()=>Response.json({error:{description:'refund declined'}},{status:400}));
 await assert.rejects(razorpay.createRazorpayRefund('pay_2',{amount:1},config),{message:'Razorpay refund error: refund declined'});
});
test('verifyWebhookSignature and verifyPaymentSignature keep identical accept/reject outcomes after hardening to constant-time comparison', () => {
 const config={keyId:'id',keySecret:'key',webhookSecret:'secret'};
 // Same true/false outcomes the original `===` implementation produced (see the
 // pre-hardening test above): exact match accepts, prefixed/mismatched/wrong-length reject.
 assert.equal(razorpay.verifyWebhookSignature('raw',hmac('raw','secret'),config),true);
 assert.equal(razorpay.verifyWebhookSignature('raw','sha256='+hmac('raw','secret'),config),false);
 assert.equal(razorpay.verifyWebhookSignature('raw','',config),false);
 assert.equal(razorpay.verifyWebhookSignature('raw','not-hex-at-all-but-same-length-00000000',config),false);
 assert.equal(razorpay.verifyPaymentSignature('order','payment',hmac('order|payment','key'),config),true);
 assert.equal(razorpay.verifyPaymentSignature('order','payment','wrong',config),false);
});
test('a signature computed with one provider secret never verifies against a different provider config (cross-provider spoofing)', () => {
 const nevoUpiStyleSecret='bank-shared-secret';
 const razorpayConfig={keyId:'id',keySecret:'key',webhookSecret:'razorpay-shared-secret'};
 const payload='{"event":"payment.captured","payload":{}}';
 const signedForUpi=hmac(payload,nevoUpiStyleSecret);
 assert.equal(razorpay.verifyWebhookSignature(payload,signedForUpi,razorpayConfig),false);
 assert.equal(razorpay.verifyWebhookSignature(payload,hmac(payload,razorpayConfig.webhookSecret),razorpayConfig),true);
});
