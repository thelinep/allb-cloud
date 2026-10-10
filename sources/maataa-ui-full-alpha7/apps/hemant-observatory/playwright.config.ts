import { defineConfig } from "@playwright/test";

// Uses the alpha7 checkout's existing @playwright/test install (resolved from
// the parent node_modules). Serves the production build (`next start`), so run
// `next build` and `cargo build` first (scripts/check.sh does both) so
// target/debug/hemant-shell exists. Uses port 4211 so it never collides
// with a dev server you already have running on 4210.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "../../test-results/hemant-observatory",
  use: { browserName: "chromium", baseURL: "http://127.0.0.1:4211", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4211",
    url: "http://127.0.0.1:4211/api/methods",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
