# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Drei, cannon-es, Zustand, Prisma with libSQL/SQLite, next-intl, WebSocket, SSE, and WebGL shaders (as requested; versions and runtime suitability must be validated before release).

## Users

Inferred from the explicit brief because the audience question was unanswered: astronomy learners, researchers, and observatory operators who need to inspect time, sky geometry, calendar calculations, and simulations with their assumptions visible. Ritual/calendar users are a secondary audience named by the requested Panchanga and Sankranti capabilities.

## Product Purpose

Provide a software observatory for exploring astronomical time, sky geometry, Panchanga conventions, and reproducible simulations. Success means that each displayed result can be traced to its time scale, location or observer, coordinate frame, data source, algorithm, and uncertainty.

## Positioning

Combine scientific observatory tools and culturally situated calendar/time presentations in one inspectable runtime. Cultural terminology and ratios are presented as named conventions or research hypotheses unless a source and calculation method establish them.

## Operating Context

The requested experience includes an interactive observatory, live clocks, calendar and Sankranti calculations, simulation timelines, developer APIs, and educational views. The named domains are deployment targets to map later; DNS, certificates, hosting, and API operations are not present in this repository.

## Capabilities and Constraints

- Canonical MAATAA hostname direction: `samwat.allb.xyz`, following the MAATAA/TLPS ownership split in `docs/product/MAATAA-DOMAIN-AUTHORITY-MAP.md`. Earlier requested names (`samwat.vaigyaaniq.online`, `observatory.tlps.in`, `cosmos.tlps.in`, `api.vaigyaaniq.online/hemant`, and `learn.tlps.in/astronomy`) are not configured aliases; domain owners and routes must be resolved before using them.
- Requested modules include live clock, observatory, Panchanga, Sankranti, Brahmi cosmology, API/developer, education, simulation timeline, services, research, mobile, widgets, modes, planetary analytics, and universal ratios.
- Requested engines: Brahmi/transliteration, Panchanga, astronomical calculations, and Dixit-Saankhya ratios. Calendar traditions, epoch/ayanamsha, planetary ephemeris, coordinate frames, uncertainty semantics, and ratio definitions remain open until sourced and tested.
- Realtime IST from a host clock can be displayed with its source labelled. Sidereal time, planetary motion, telemetry, ayana/Sankranti transitions, and calendar fields must not be described as verified until backed by implemented calculations and validated data.
- Telemetry must be distinguishable as synthetic, cached, observed, or live; show provenance, data age, and uncertainty. No real spacecraft, telescope, sensor, or service is connected by this product brief.
- User-requested stack is the target; installed versions, compatibility, packaging, security, and production deployment are not yet established.
- Existing evidence in this checkout is limited to a local Hemant clock/Panchanga preview and an educational two-body spacecraft simulator. Neither is connected to the MAATA OS/QEMU runtime or flight hardware.

## Brand Commitments

The user asked for a sacred-scientific observatory drawing from Jantar Mantar, Indo-Persian instruments, astrolabes, sundials, Brahmi cosmology and Sankranti observatories, with a dark cosmic environment and brass/gold/orange instrumentation. Use Devanagari, Brahmi and transliteration as explicit script layers, not as decorative pseudo-text.

## Evidence on Hand

- The Desktop trial's Hemant display is a fixed-unit conversion from an unverified host clock: `apps/maataa-desktop-tauri/web/app.js`.
- The Panchanga fields in that trial remain pending pending a validated method: `apps/maataa-desktop-tauri/web/index.html`.
- The Spacecraft Nav preview is synthetic Sun-only two-body propagation with no sensor/ephemeris input: `apps/maataa-desktop-tauri/web/spacecraft-model.mjs`.
- These facts support a prototype and its limitations, not a production astronomical runtime.

## Product Principles

1. Show calculation method, provenance, reference frame, time scale, and uncertainty beside results.
2. Keep calendar presentation separate from physical clock sources and astronomical computation.
3. Distinguish observation, validated calculation, prediction, simulation, and illustrative content.
4. Make every simulation reproducible from its inputs and versioned methods.
5. Treat cultural labels and ratios respectfully and source their conventions rather than inventing them.

## Accessibility & Inclusion

Support keyboard and screen-reader operation, reduced motion, responsive mobile use, and parallel Devanagari/Latin labels. Do not make color or 3D motion the sole carrier of telemetry meaning.
