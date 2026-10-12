export function authEnvironment(env=process.env){
 const origin=env.ALLB_AUTH_ORIGIN;let url;
 try{url=new URL(origin);}catch{throw Error('ALLB_AUTH_ORIGIN must be an explicit origin');}
 if(url.origin!==origin||url.username||url.password)throw Error('ALLB_AUTH_ORIGIN must not contain paths or credentials');
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&local&&env.ALLB_LOCAL_DATABASE_DIR))throw Error('HTTPS authentication origin required');
 const value=env.ALLB_TOTP_KEY_HEX,keyVersion=env.ALLB_TOTP_KEY_VERSION;
 if(!value&&!keyVersion)return {origin,key:undefined,keyVersion:undefined};
 if(!value||!/^([a-f0-9]{64})$/i.test(value)||!keyVersion||!/^[a-zA-Z0-9_-]{1,80}$/.test(keyVersion))throw Error('Valid AES-256 key and explicit key version required');
 return {origin,key:Buffer.from(value,'hex'),keyVersion};
}
