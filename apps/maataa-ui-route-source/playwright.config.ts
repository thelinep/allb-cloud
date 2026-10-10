import {defineConfig,devices} from '@playwright/test';
const port=4330;
export default defineConfig({
 testDir:'./tests/browser',
 timeout:45000,
 fullyParallel:true,
 workers:4,
 retries:0,
 reporter:[['list'],['json',{outputFile:'test-results/enterprise-browser-results.json'}]],
 use:{baseURL:'http://127.0.0.1:'+port,trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:process.env.ALLB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ALLB_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}:undefined},
 webServer:{command:'npm start -- --hostname 127.0.0.1 --port '+port,url:'http://127.0.0.1:'+port,reuseExistingServer:false,timeout:30000},
 projects:[{name:'desktop-chromium',use:{viewport:{width:1440,height:1000}}},{name:'mobile-chromium',use:{...devices['Pixel 7']}}]
});
