# Dependency inventory — 2026-10-09

No dependency was added in this work.

| Component | Version | Licence | Where | Use |
| --- | --- | --- | --- | --- |
| Rust standard library | toolchain (macOS rustc 1.91.0) | MIT/Apache-2.0 | hemant-core, hemant-shell | Everything in Rust; no crates.io dependencies |
| next | 16.3.8 | MIT | symlinked node_modules (`../../.certification/consumer-next`) | App Router UI and route handlers |
| react / react-dom | 19.3.0 | MIT | same | UI |
| typescript | ^5.8 (installed in the symlinked store) | Apache-2.0 | same | Type checking |
| @types/node, @types/react, @types/react-dom | as installed | MIT | same | Types |
| @playwright/test | as installed in the alpha7 root | Apache-2.0 | `../../node_modules` | E2E tests only (not shipped) |

Requested but **not installed** (each needs a use case, current docs review, licence/platform review and a small test before adding): Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Drei, cannon-es, Zustand, Prisma, libSQL/SQLite, next-intl, WebSocket/SSE libraries.

Data files: none bundled. The proposed ephemeris kernel (`de440s.bsp`) and a leap-seconds kernel are not downloaded; their licence/redistribution terms are an open item (ASTRONOMY-DECISION-001).
