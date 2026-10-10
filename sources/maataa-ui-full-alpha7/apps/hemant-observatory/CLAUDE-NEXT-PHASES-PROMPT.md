# Claude prompt: complete Hemant Samwat Observatory Runtime

Copy the prompt below into Claude Code while its working directory is the MAATAA alpha7 checkout. It directs Claude to carry the Observatory app through the complete scoped implementation, all available verification, and a truthful handoff, rather than stopping after an audit or one phase. Implementation scope is only `apps/hemant-observatory/`; it does not authorize broad disk scans, external uploads, moving or deleting files, changing unrelated products, pushing, deploying, or modifying other repositories.

---

You are continuing the Hemant Samwat Observatory Runtime inside this checkout:

`/Users/vesahe/Downloads/maataa-ui-full-alpha7/apps/hemant-observatory`

Your goal is to complete the Observatory application described below, advancing the current evidence-labelled prototype toward a scientifically reproducible observatory runtime in small, testable increments. Continue through every phase that can be completed within scope; do not stop after the baseline, a plan, or the first implementation slice. When one capability is scientifically or externally blocked, finish all independent work, keep that capability safely marked pending, and continue with the other modules. This is engineering work, not permission to claim scientific validation, operational spacecraft capability, or production readiness without evidence.

## Required first actions

1. Read `README.md`, `PRODUCT.md`, `DESIGN-APPROVAL.md`, `ASTRONOMY-METHODS.md`, and this prompt. Treat those as project context, not proof that a capability is implemented.
2. Inspect the Git root, branch, current commit, and complete working-tree status before editing. The app directory may be untracked and the parent checkout has unrelated local changes. Do not reset, stage, commit, reformat, or edit paths outside this app.
3. Inspect the app source and run the existing Rust and Next checks using what is already installed. Do not install packages or contact a registry unless explicitly authorized. If an existing dependency is unavailable offline, report that and continue with work that does not need it.
4. Record the baseline in a project progress file, including current capabilities, checks, decisions, and known blockers. Then execute all phases below in order. Do not wait for approval between phases or stop after a plan. Ask the product owner only when an irreversible choice or genuinely unavailable domain decision blocks every safe implementation path; first complete independent work and offer a reversible, clearly labelled default when possible.

## Verified starting point

- A standard-library-only Rust workspace provides `hemant-core` and `hemant-shell`.
- The core reads the host wall clock as **unverified**, with unknown synchronization and uncertainty; it formats Unix nanoseconds as Gregorian UTC and converts elapsed duration from the selected Kashi reference using a named traditional-unit convention.
- The selected reference is 14 January 1979, 13:29 IST (07:59 UTC), described as Kashi Makar Sankranti. It is user-selected, minute precision, and not independently verified as the exact astronomical event time.
- Rust JSON carries method identifiers/evidence labels. Astronomy is `pending-method`; Panchanga is `pending-tradition-and-method`.
- A Next.js App Router dashboard consumes the local Rust shell through a fixed-argument API route. It uses authored CSS today; the larger requested stack is not fully installed or implemented.
- The sky diagram is illustrative. Panchanga values, ephemerides, live telemetry, spacecraft navigation, and MAATA OS/QEMU time synchronization are not implemented.
- `ASTRONOMY-METHODS.md` proposes a provenance contract and links primary references: NASA/JPL Horizons, NASA NAIF SPICE time documentation, and IERS time-scale products.
- Recent available checks have passed: 10 Rust tests, Clippy with warnings denied, optimized Rust build, JSON contract smoke check, and Next production build. Re-run them on the current tree before relying on this baseline.

## Engineering principles

- Preserve the Rust-first, dependency-light core. Add no dependency to the core without a concrete need, current documentation review, license/platform review, and a small isolated test.
- Separate physical clock sources, civil time representations, dynamical time scales, monotonic elapsed duration, Hemant calendar units, and traditional Panchanga conventions in types and output. Never label host wall time “verified” merely because it is readable or agrees with another source.
- Every displayed scientific or traditional result must carry its method/ruleset ID and version, inputs, source/data identity, time scale, reference frame or location where relevant, units, validity/coverage, and uncertainty or an explicit unknown value.
- Keep empirical astronomy, simulation, observations, user-selected references, convention-derived output, textual traditions, and illustrative artwork distinguishable. Do not imply they are equivalent or that one validates another.
- Do not fabricate astronomical values, dates, event times, uncertainty, observatory feeds, missions, references, or test results. Pending is an acceptable product state.
- Do not implement real spacecraft control, actuator commands, autonomous clicking, or navigation guidance. Any spacecraft view remains offline simulation-only and clearly labelled.
- Do not add account systems, telemetry upload, analytics, model training, or network collection. Keep the local API narrowly scoped and fail closed.
- Preserve the approved visual direction and accessibility: responsive, keyboard usable, reduced-motion aware, sufficient contrast, and no information conveyed by color/3D alone.

## Complete implementation phases

### Phase 1 — Make the time contract rigorous

Inspect the current Rust clock and timestamp model. Clarify and encode separate values for a host wall-clock snapshot and monotonic elapsed intervals; inject time sources in tests rather than depending on the actual clock. Document the Unix-nanosecond/UTC representation precisely, including leap-second limitations and supported range. Keep verification `unverified` unless the implementation can establish source, freshness, and bounded uncertainty. Keep the selected epoch metadata separate from the clock source. Add edge-case tests for negative timestamps, range boundaries, subsecond precision, and overflow. Do not call local agreement between clocks proof of correctness.

**Acceptance:** deterministic tests cover source labels, range/precision behavior, and monotonic ordering; JSON schema changes are versioned or backward compatible; UI copy accurately states the source and freshness of its snapshot.

### Phase 2 — Build a method registry and reproducible result envelope

Promote the current method labels into a structured, versioned Rust contract. Include evidence class, method/version, inputs, source/data identity, time scale, frame/location when applicable, output units, uncertainty status, and limitations. Keep the current clock, selected epoch, unit convention, pending astronomy, and pending Panchanga as separate records. Add schema tests and document how future output is added without silently changing older interpretation. The dashboard’s Methods & Sources view should be driven by or checked against the same contract, not maintain conflicting prose.

**Acceptance:** a machine-readable schema test checks required provenance fields and pending states; no unsupported measurement is emitted; the method registry page accurately reflects the Rust contract.

### Phase 3 — Establish astronomical time and ephemeris integration design

Before implementing positions, consult the current official NASA/JPL Horizons manual, NASA NAIF SPICE time documentation, and IERS time-scale/Earth-orientation references. Record the supported use case and choose an explicit initial target (for example, offline solar-system positions) and computation boundary. Evaluate data licensing, redistribution, kernel size, platform support, update cadence, offline behavior, leap-second data, TT/TDB conversion, ICRF/frame conventions, geometric versus apparent coordinates, observer definitions, and uncertainty semantics. Prefer a pinned, reproducible ephemeris dataset/interface; do not substitute a hand-written low-precision orbit formula without labelling and bounding it. If a dependency or dataset cannot be installed or verified offline, create a design record and tests for the interface instead of pretending integration succeeded.

**Acceptance:** a decision record names method, dataset/version identity, time-scale handling, frames, supported coverage, known accuracy limits, update and offline behavior, license review, and independent reference test vectors. Until then, astronomical positions remain pending.

### Phase 4 — Select and implement one Panchanga convention

Do not assume one universal Panchanga. Identify the exact textual/calculation tradition and its authoritative rule sources, edition/version, observer location policy, ayanamsha, sunrise and day-boundary rules, and treatment of boundary cases. Ask the product owner for the tradition/location decision only if it cannot be inferred from project records. Keep the calendar convention layered over astronomical inputs and make that dependency explicit. Implement one field at a time with independently sourced test cases; do not show a complete Panchanga until every displayed field has a validated definition and test vectors.

**Acceptance:** the selected ruleset is named/versioned and cited; representative boundary and location cases are tested; the UI discloses the selected location and ruleset; unimplemented fields remain pending.

### Phase 5 — Deliver an end-to-end, reviewable observatory slice

Connect one deterministic path from an explicit input through Rust calculation and provenance-bearing JSON to the Next.js view. Start with an offline time-conversion/method inspection slice; extend to a celestial result only after Phases 3 and 4 gates are met. Use synthetic fixtures for UI tests and distinguish those fixtures from runtime results. Test desktop and mobile layout, keyboard access, API error handling, unavailable Rust binary behavior, stale snapshots, and malformed output. Review dependency/license and security changes. Update README and current status with what was actually built and what remains. Do not deploy the listed domains or create external services; DNS, hosting, certificates, and production operations require a separate explicitly approved task.

**Acceptance:** clean targeted test/build results on the exact final tree; UI/API integration test verifies the same method IDs and evidence status; failure paths are visible and safe; no unrelated files changed.

### Phase 6 — Complete the application’s requested module surfaces

Implement every requested module as a coherent, usable page—not a list of empty links: Landing/overview, Live Clock, Observatory, Panchanga, Sankranti, Brahmi Cosmology, API & Developer Portal, Educational Astronomy, Simulation Timeline, Services, Research, Mobile, Widgets, Observatory Modes, Planetary Analytics, and Universal Ratio Engine. Reuse the approved visual direction and shared components. Connect pages to implemented calculations or documented reference data where supported; elsewhere provide an interactive method/input workspace with explicit pending state, useful explanations, and testable acceptance criteria. Do not populate pages with fake live values, invented services, unbuilt SDK claims, or decorative pseudo-Brahmi. For transliteration or Brahmi script support, use sourced mappings and tested reversible/known-case behavior; otherwise label it planned and do not output fabricated glyphs.

Build the observatory visualization progressively. First make a truthful, accessible 2D view from verified fixture data and label fixtures as such. Only add Three.js/WebGL/R3F where it provides a user-tested benefit and can be installed and verified. Keep scientific state outside rendering code; include text/table equivalents, keyboard navigation, reduced-motion behavior, mobile fallback, and visible data/method controls. Avoid adding cannon-es or physics simulation unless a defined feature needs it.

**Acceptance:** all 15 pages have working navigation, responsive layouts, clear capability status, and meaningful page-specific content. Implemented values trace to their source/method; unavailable domains remain useful and honest workspaces rather than implying completion.

### Phase 7 — Add local records and controlled realtime behavior

Implement only data persistence and streaming that the product actually uses. Keep the default experience local-first. Choose SQLite/libSQL/Prisma only after checking current compatibility, migration strategy, offline operation, data retention, backup/export, and platform support; no database is required for immutable static method metadata. Define versioned records for observations, computation inputs/outputs, method versions, and event history. Use SSE/WebSocket only for a real local producer and show source, timestamp/data age, connection state, and uncertainty; synthetic feeds must be clearly synthetic. Add validation, size/time limits, safe error handling, and tests for stale/disconnected sources. Do not upload observations, prompts, telemetry, or user data.

**Acceptance:** migrations and persistence tests pass if a database is introduced; no client input can invoke arbitrary processes or network destinations; reconnect/stale/error states are tested; no telemetry leaves the machine.

### Phase 8 — Finish qualification and delivery readiness

Add integration tests for Rust → API → UI, method registry consistency, each implemented module’s critical interactions, accessibility, and mobile/desktop layouts. Check keyboard operation, contrast, reduced motion, error and empty states, production build, package boundaries, license notices, and dependency inventory. Update documentation with setup, architecture, reproducibility, data sources, limitations, and a module-by-module status table. Resolve all failures that are within scope; do not weaken tests to turn them green. Verify the final diff and ensure no unrelated paths changed. Prepare a local run/package only if the existing app setup supports it and do not deploy or publish.

**Acceptance:** all feasible scoped gates pass on the final source tree, blocked external/manual gates are listed precisely, and the handoff distinguishes implemented, verified, provisional, and pending capabilities.

## Expected work protocol

- Work on one phase at a time and report phase, files changed, evidence, tests, and blockers.
- Inspect every diff before continuing. Run format, tests, lint, and release build appropriate to the edited parts; rerun Next production build for UI/API changes.
- Do not claim “production-grade”, “scientifically proven”, “real-time”, “verified”, “flight-ready”, or “complete” unless the exact evidence supports that phrase.
- Do not commit or push unless directly asked. Do not move, delete, or archive any files.
- If you need a user choice, ask one focused question only after completing independent work, and explain which implementation is gated by the answer.
- End with a concise handoff stating completed phase(s), exact validation, remaining blockers, and the safest next slice.

Begin now with the required inspection, then complete all eight phases within `apps/hemant-observatory/`. Keep moving through independent work until the whole scoped implementation is complete or only explicitly named external/user-controlled gates remain. At that point, provide a final evidence-based report and the single best next action for any remaining blocker.
