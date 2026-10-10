# Unified ALLB application

## Run from the repository root

    npm run setup
    npm run dev

Production:

    npm run build
    npm start

Use Node 22.6+ for the configuration tests (Node 24 was used for validation).
The canonical executable app is apps/maataa-ui-route-source.
It now serves the ALLB portal, landing gallery, 36 landings, 36 brand workspace hubs,
MAATAA component/docs/playground routes, scene/spatial demos and both design studios.

The original sources/maataa-ui-full-alpha7 snapshot remains available as a reference;
the unified app does not require its incomplete root package, Rust build or Cloudflare tooling to start.

## Route map

| Route | Function |
| --- | --- |
| / | ALLB application portal |
| /allb | Searchable/filterable landing gallery |
| /allb/[slug] | 36 implemented landing experiences |
| /workspace | Brand workspace directory |
| /workspace/[brand] | 36 brand hubs linking to existing local tools |
| /ui | Original MAATAA UI documentation entry |
| /studio/themes | Global/brand/route theme configuration |
| /studio/branding | Global/brand/route brand identity |
| /scene/2d-3d | Existing local scene editor |
| /spatial/map | Existing schematic spatial editor |
| /readiness | Demo and production boundaries |

All previous MAATAA URLs remain available. The former / documentation content is now at /ui;
the root is the unified application portal. There are 82 concrete registry modules and 259
supported fixture/catalogue URLs. Unknown landing and workspace IDs return 404.

## Shared runtime

- One Next.js application, origin, React tree and design provider.
- One application navigation, with a documentation sidebar on MAATAA surfaces.
- Public landing/gallery CSS and MAATAA documentation CSS are scoped separately.
- All 174 imported public ALLB assets are served from the same app under their existing URLs.
- Every landing opens its matching brand workspace; each workspace links back to its landing.
- Brand hubs link to implemented MAATAA local tools. They do not claim to implement a separate production product for each brand.
- Theme/Branding Studio apply through the common provider to landings, gallery, navigation and workspace identity. No manual JSON transfer is needed within this application.
- Branding propagation includes header identity/favicon and landing/gallery tagline/hero. Server SEO metadata is not rewritten.
- Resolution: global → brand → broad route families → specific families → exact route.
- /workspace/[brand] inherits the matching configured brand when no route assignment overrides it.
- Tool routes keep their own configuration; a landing's exact route override does not leak into another tool.
- Without active Studio configuration, public landings retain their original art direction.
- Existing browser-local design snapshots remain readable under schema version 1.
- Draft edits do not update the active appearance until Apply locally. Save before leaving a Studio editor.
- JSON remains available for backup and transfer to another browser.

## Verified checks

    npm run typecheck
    npm run build
    npm run test:config
    npm run test:routes
    npm run test:design-dom
    npm run test:integration

Build, TypeScript and registry checks passed.
HTTP checks passed for all 259 URLs, 5 unknown-route 404s, all 36 landing/workspace pairs,
all 174 asset URLs and all workspace tool targets.
Asset SHA-256 hashes match the preserved source.

jsdom DOM tests passed for draft/apply separation, save persistence, Studio-to-landing theme
and branding updates, route isolation, workspace brand inheritance and corrupt-storage recovery.
These are simulated DOM tests, not a real-browser E2E or visual certification.
Chromium installation previously failed; browser/mobile visual checks remain unverified.

## Boundaries

This completes the UI application consolidation requested for ALLB landings and MAATAA UI.
It is not enterprise backend integration or a production release certification.
Authentication/MFA, durable server configuration, commercial workflows, organization authorization,
asset uploads, shared publishing and deployment are not implemented by this change.
Scene/spatial renderers remain schematic local demonstrations.
The original scientific Observatory service, its Rust/WASM/API execution and Cloudflare deployment
remain in the preserved source snapshot and are not exposed as live services in the unified app.
Links labeled as Observatory runtime in the imported landings were corrected to the actual ALLB home
or readiness page so they do not imply a connected scientific runtime.
