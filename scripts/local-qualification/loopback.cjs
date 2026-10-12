// Test-only managed-container workaround. Never included in Worker or production.
const os=require('node:os');
const original=os.networkInterfaces;
os.networkInterfaces=function(){
 try{return original();}catch(error){
  if(error.code!=='ERR_SYSTEM_ERROR'||error.info?.syscall!=='uv_interface_addresses')throw error;
  return {lo:[{address:'127.0.0.1',netmask:'255.0.0.0',family:'IPv4',mac:'00:00:00:00:00:00',internal:true,cidr:'127.0.0.1/8'}]};
 }
};
