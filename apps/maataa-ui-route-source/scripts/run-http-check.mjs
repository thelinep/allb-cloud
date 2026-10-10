import {spawn} from 'node:child_process';
const port='4327';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',port],{stdio:['ignore','pipe','pipe']});
server.stderr.on('data',x=>process.stderr.write(x));let running=false;
server.stdout.on('data',x=>{if(!running&&x.toString().includes('Ready')){running=true;const test=spawn(process.execPath,['scripts/http-check.mjs'],{stdio:'inherit',env:{...process.env,MAATAA_TEST_BASE:'http://127.0.0.1:'+port}});test.on('exit',c=>{server.kill();process.exitCode=c||0})}});
server.on('exit',c=>{if(!running)process.exitCode=c||1});
