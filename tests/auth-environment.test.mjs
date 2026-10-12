import assert from 'node:assert/strict';
import {authEnvironment} from '../packages/auth-core/environment.mjs';
let checks=0;const rejected=env=>{assert.throws(()=>authEnvironment(env));checks++;};
rejected({});rejected({ALLB_AUTH_ORIGIN:'https://app.example.test/path'});rejected({ALLB_AUTH_ORIGIN:'http://app.example.test'});rejected({ALLB_AUTH_ORIGIN:'http://127.0.0.1:3000'});rejected({ALLB_AUTH_ORIGIN:'https://app.example.test',ALLB_TOTP_KEY_HEX:'f'.repeat(64)});rejected({ALLB_AUTH_ORIGIN:'https://app.example.test',ALLB_TOTP_KEY_HEX:'invalid',ALLB_TOTP_KEY_VERSION:'v1'});
assert.equal(authEnvironment({ALLB_AUTH_ORIGIN:'https://app.example.test'}).origin,'https://app.example.test');checks++;
assert.equal(authEnvironment({ALLB_AUTH_ORIGIN:'http://127.0.0.1:3000',ALLB_LOCAL_DATABASE_DIR:'/tmp/explicit-fixture'}).origin,'http://127.0.0.1:3000');checks++;
assert.equal(authEnvironment({ALLB_AUTH_ORIGIN:'https://app.example.test',ALLB_TOTP_KEY_HEX:'f'.repeat(64),ALLB_TOTP_KEY_VERSION:'v1'}).key.length,32);checks++;
console.log(`PASS ${checks} auth environment fail-closed checks`);
