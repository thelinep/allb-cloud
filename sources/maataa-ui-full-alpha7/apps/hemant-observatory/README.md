# Hemant Samwat Observatory Runtime

A local, inspectable observatory app inside the MAATAA alpha7 checkout: a std-only Rust time core and CLI (`hemant-shell`), a Next.js App Router interface, and a Cloudflare Worker adapter. The Worker can request apparent geocentric Sun/Moon angles from NASA/JPL Horizons and pass instantaneous tithi/paksha/karana angle bins through the Rust Wasm core. These are method-labelled provisional computations, not an independently verified ephemeris or complete traditional Panchanga. The runtime clock remains unverified.

## Run locally (macOS)

```sh
cargo build --workspace --offline          # builds target/debug/hemant-shell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 4210
# or: pnpm dev   (runs the same two steps)
```

All checks: `bash scripts/check.sh` (Rust fmt/test/clippy/build, fixture drift, contract tests, tsc, next build, Playwright desktop + mobile). Logs go to `evidence/`.

## Architecture

| Layer | Files | Notes |
| --- | --- | --- |
| Time core | `crates/hemant-core/src/time.rs` | Injectable `WallClock`; `WallClockSnapshot` (point reading, unverified, uncertainty unknown); `MonotonicInterval`; Unix ns → proleptic Gregorian UTC for 0001–9999; leap seconds not counted. |
| Units | `units.rs` | User-selected Kashi epoch (minute precision) and `hemant-traditional-units-v1`. |
| Method registry | `registry.rs` | `hemant.method-registry/1`, the single source of method provenance. |
| Result envelope | `result.rs` | `hemant.time-result/2` with `reading`, `civil`, `epoch`, `elapsed`, `pending`, `methods_used`. |
| Ephemeris boundary | `astronomy.rs` | `EphemerisProvider` trait; only `NoEphemeris` (always `Pending`). |
| CLI | `crates/hemant-shell` | `--json`, `--unix-nanos N`, `--methods-json`; fails closed on bad arguments. |
| Contract (TS) | `lib/contract.ts` | Strict validators shared by routes, UI and tests. |
| Shell bridge | `lib/shell.ts`, `lib/time-response.ts` | Fixed binary, fixed argument shapes, 2 s timeout, 64 KB output, empty environment. |
| API | `app/api/{time,convert,methods,health}` plus the Worker wrapper | Also serves `/api/astronomy/angles`, `/api/panchanga/instant`, and `/api/sankranti/next`; live astronomy is JPL-backed and uncertainty remains unquantified. |
| UI | `components/observatory.tsx`, `components/modules/*`, `app/[section]` | 15 module pages plus the overview. |

## Module status

| Module | Status | Works now | Pending |
| --- | --- | --- | --- |
| Live clock & converter | Implemented | Host snapshot with age, UTC, IST, Hemant units, input conversion | Trusted time source, TAI/TT/TDB, sidereal time |
| Observatory | Workspace · partial | Illustrative SVG + state-query builder | Wider planetary positions and independent validation |
| Panchanga | Partial | Instant tithi/paksha/karana from JPL apparent angles; up to four assumptions-only profiles compared side by side | Selected ruleset, sunrise/day assignment, remaining fields and computed profile-to-profile differences |
| Sankranti | Partial | JPL solar sign crossing with explicit numeric ayanamsha and minute samples | Named ayanamsha, independent reference validation, local observance |
| Brahmi cosmology | Reference | Evidence layers, Unicode ranges | Sourced transliteration engine |
| API & developer | Implemented | Three local endpoints, CLI, live schema | Hosted API/SDK |
| Educational astronomy | Reference | Time-scale and position-type explanations | Guided exercises |
| Simulation timeline | Partial | Sourced/definitional/user-selected dated items with filters | Computed events |
| Services | Reference | Honest inventory incl. undeployed domains | Any hosted service |
| Methods & sources | Implemented | Registry rendered from Rust | Astronomy/Panchanga methods |
| Mobile | Partial | Device vs snapshot comparison | Offline logging |
| Widgets | Partial | Clock widget with source/age | Published embed |
| Modes | Implemented | Mode switch over identical evidence | — |
| Planetary analytics | Workspace · partial | Sun/Moon geocentric apparent angles available through API | Planetary state vectors and full coordinate set |
| Ratio engine | Workspace · pending | Definition draft + checklist (not stored) | Accepted definitions (none) |

## Limits

- Host time is a point snapshot, **unverified**, uncertainty **unknown**. Agreement with another clock is not verification.
- Unix time skips leap seconds; the elapsed Hemant units are a Unix-time difference.
- The 1979 epoch is user-selected (minute precision); its Sankranti instant is not recomputed.
- The overview sky diagram and the Observatory SVG are illustrative.
- No database, realtime feed, telemetry, account system or network collection exists. `samwat.allb.xyz` is the canonical MAATAA hostname direction, but DNS, origin hosting, TLS and public deployment are not verified.
- Cloudflare Workers is the selected deployment target. The Worker build uses the stable OpenNext Cloudflare adapter and the Rust core compiled to Wasm; the native CLI remains for local Node.js development. The Worker path has passed an isolated local workerd preview and Wrangler upload-free dry run. The checked-in release tree still needs its own reproducible clean install/build and smoke evidence before deployment.

- Scientific method state and reference links: see [`SCIENTIFIC-VALIDATION.md`](./SCIENTIFIC-VALIDATION.md). No deploy or DNS write was made for these calculations.
- Panchanga comparison candidates and open product decisions: see [`PANCHANGA-DECISION.md`](./PANCHANGA-DECISION.md). The UI profiles record assumptions only; they do not calculate competing calendar results.

Design records: `ASTRONOMY-METHODS.md`, `ASTRONOMY-DECISION-001.md`, `PANCHANGA-DECISION.md`, `DEPENDENCIES.md`. Progress: `PROGRESS.md`.
