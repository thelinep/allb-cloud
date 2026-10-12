import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',timeout:45000,fullyParallel:true,workers:2,retries:0,
 reporter:[['list'],['json',{outputFile:'../../artifacts/cloudflare-native/worker-browser.json'}]],
 use:{baseURL:'http://127.0.0.1:8892',trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:process.env.ALLB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ALLB_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}:undefined},
 webServer:{command:'node node_modules/wrangler/bin/wrangler.js dev --local --config wrangler.integration.jsonc --ip 127.0.0.1 --port 8892',url:'http://127.0.0.1:8892/allb',reuseExistingServer:false,timeout:120000,env:{WRANGLER_SEND_METRICS:'false'}},
 projects:[{name:'worker-desktop-chromium',use:{viewport:{width:1440,height:1000}}},{name:'worker-mobile-chromium',use:{...devices['Pixel 7']}}]
});
