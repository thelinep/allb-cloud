# Hemant Observatory deployment status

## Target and authority

- MAATAA hostname direction: `samwat.allb.xyz`; target platform: Cloudflare Workers.
- Source lives at `apps/hemant-observatory/` in the local MAATAA alpha checkout. Verify the intended Git remote and exact release ref before publishing.
- Wrangler authentication was verified locally without displaying the token. No remote deployment, DNS write, or custom-domain attachment has been performed.

## Worker adapter and evidence

- The deploy path is pinned to stable `@opennextjs/cloudflare` 1.20.9. The Next.js App Router is built with OpenNext; the Worker wrapper serves the Rust/Wasm API and forwards page requests to the generated OpenNext Worker.
- `wrangler.jsonc` is prepared for `samwat.allb.xyz` as a custom domain and disables the `workers.dev` endpoint. This is local deployment configuration only; it has not been applied to Cloudflare.
- `crates/hemant-wasm` compiles the shared Rust core to `wasm32-unknown-unknown`. `scripts/check-workers-wasm.sh` checks Wasm/native parity and contract behavior.
- In an isolated copy of this app, the OpenNext production build and local Cloudflare workerd preview passed for `/`, `/clock`, `/observatory`, and `/api/{health,methods,time,convert}`. Invalid inputs and parameters, unsupported methods, and unknown API routes fail closed.
- Wrangler `deploy --dry-run` successfully bundled the Worker and assets without uploading them. The same source snapshot passed OpenNext build, TypeScript, local workerd preview, and API/UI smoke in an isolated copy.
- A fresh isolated dependency install could not complete because npm registry DNS was unavailable. The successful build/preview used already-installed dependencies matching the pinned lockfile. Repeat a clean install on the frozen release commit when registry access is available.
- The app's existing `node_modules` is a symlink to a certification dependency tree and was preserved; the adapter trial used a separate temporary install.

## Runtime truth and release gates

- `/api/time` uses Worker `Date.now()` at millisecond precision. The timestamp is explicitly **unverified** and its uncertainty is unknown; it is not synced to MAATA OS or a trusted time authority.
- The user-selected 1979 Kashi epoch is minute-precision input; the event time is not independently recomputed.
- Astronomy, planetary positions, Panchanga, and Sankranti remain pending. `/api/health` reports liveness and pending methods, not scientific correctness or production readiness.
- Before release: verify the remote/ref and clean exact commit; run clean dependency install, build, and preview smoke on that commit; review the deployment diff and exact Worker/account/zone target; then attach `samwat.allb.xyz`, verify DNS/TLS/public health and rollback, and add operational ownership and monitoring.

The Cloudflare deployment and public hostname remain untouched. Production publication still needs an explicit final go-ahead after the exact release plan is reviewed.
