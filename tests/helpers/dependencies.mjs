import {createRequire} from 'node:module';
// Resolve from the application workspace, supporting both hoisted clean installs
// and existing app-local installations.
const require=createRequire(new URL('../../apps/maataa-ui-route-source/package.json',import.meta.url));
export const {PGlite}=require('@electric-sql/pglite');
export const {chromium}=require('@playwright/test');
