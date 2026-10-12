import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = path.join(root, 'apps/maataa-ui-route-source');
const requireHost = createRequire(path.join(host, 'package.json'));
const { chromium } = requireHost('@playwright/test');
const port = Number(process.env.ALLB_BROWSER_PORT || 3187);
const output = process.env.ALLB_BROWSER_OUTPUT || path.join(root, 'artifacts/nevo-ui-browser');
const executablePath = process.env.ALLB_CHROMIUM_PATH;
const server = spawn(process.execPath, [requireHost.resolve('next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], { cwd: host, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = ''; server.stdout.on('data', b => { logs += b; process.stdout.write(b); }); server.stderr.on('data', b => { logs += b; process.stderr.write(b); });
const checks = [], errors = [], results = [];
let browser;
try {
  await mkdir(output, { recursive: true });
  let ready = false;
  for (let i = 0; i < 20; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/integration/ui`, { signal: AbortSignal.timeout(2000) }); if (r.ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 250)); }
  assert(ready, `Production server failed to start: ${logs}`);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--no-zygote', '--disable-dev-shm-usage', '--disable-gpu'] });
  const anonymous = await fetch(`http://127.0.0.1:${port}/api/integration/nevo/context`);
  assert.equal(anonymous.status, 401); assert.equal((await anonymous.json()).error, 'UNAUTHENTICATED');
  checks.push('NEVO context rejects unauthenticated HTTP request');
  const unavailable = await fetch(`http://127.0.0.1:${port}/api/integration/nevo/context?organizationId=foreign&workspaceId=foreign`, { headers: { cookie: `__Host-maataa-session=${'a'.repeat(43)}` } });
  assert.equal(unavailable.status, 503); assert.equal((await unavailable.json()).error, 'NEVO_DATABASE_UNAVAILABLE');
  checks.push('NEVO context fails closed without configured database');
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport }); const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['/integration/ui', '/integration/nevo', '/enterprise/kanban']) {
      const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' }); assert.equal(response.status(), 200);
      if (route.endsWith('kanban')) await page.getByRole('status').filter({ hasText: 'matching tasks' }).waitFor();
      assert(await page.locator('h1').isVisible());
      const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth + 1, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).length }));
      assert(!layout.overflow, `${route} horizontal overflow ${viewport.width}`); assert.equal(layout.brokenImages, 0);
      await page.addScriptTag({ path: requireHost.resolve('axe-core/axe.min.js') });
      const axe = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })) })));
      const name = `${route.replaceAll('/', '-').slice(1)}-${viewport.width}`;
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      results.push({ route, width: viewport.width, layout, accessibilityViolations: axe });
      if (route === '/integration/ui') {
        await page.getByRole('button', { name: 'Preview brief', exact: true }).click(); assert.equal(await page.getByRole('heading', { name: 'Local result', exact: true }).count(), 0);
        assert.equal(await page.locator('#maataa-name').evaluate(e => e.validity.valueMissing), true); checks.push(`required form ${viewport.width}`);
        await page.getByLabel('Project name').fill('NEVO integration preview'); await page.getByLabel('Description').fill('Browser verified local brief');
        const fieldContrast = await page.evaluate(async () => (await window.axe.run(document.querySelector('.maataa-ui__form-builder'), { runOnly: { type: 'rule', values: ['color-contrast'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
        results.push({ route: '/integration/ui#filled-form', width: viewport.width, accessibilityViolations: fieldContrast });
        await page.getByRole('button', { name: 'Preview brief', exact: true }).click(); await page.getByRole('heading', { name: 'NEVO integration preview', exact: true }).waitFor(); checks.push(`preview ${viewport.width}`);
        await page.getByRole('button', { name: 'Reset preview', exact: true }).click(); assert.equal(await page.getByLabel('Project name').inputValue(), ''); assert.equal(await page.getByRole('heading', { name: 'Local result', exact: true }).count(), 0); checks.push(`reset ${viewport.width}`);
      }
      if (route === '/integration/nevo') { await page.getByRole('link', { name: 'Open shared UI form' }).click(); await page.waitForURL('**/integration/ui'); checks.push(`integration link ${viewport.width}`); }
      if (route === '/enterprise/kanban') {
        await page.getByLabel('Search tasks').fill('nonexistent-matching-task'); await page.getByRole('status').filter({ hasText: '0 matching tasks' }).waitFor();
        await page.getByLabel('Search tasks').fill(''); await page.getByRole('combobox').selectOption('1'); await page.getByRole('button', { name: 'Refresh status' }).click(); checks.push(`Kanban filters and refresh ${viewport.width}`);
      }
    }
    await context.close();
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ results, checks, pageErrors: errors }, null, 2));
  assert.equal(results.reduce((count, item) => count + item.accessibilityViolations.length, 0), 0, 'Accessibility violations: inspect results.json');
  console.log(JSON.stringify({ pages: results.length, interactions: checks.length, pageErrors: errors, output }));
} finally { await browser?.close(); server.kill('SIGTERM'); }
