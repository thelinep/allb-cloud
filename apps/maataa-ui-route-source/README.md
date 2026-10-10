# MAATAA UI — complete route source

Standalone Next.js App Router / TypeScript application implementing the previously proposed documentation, Studio, playground and identity route catalogue. Not a full enterprise backend or the original 36 ALLB landings. This source does not integrate the actual @maataa/ui package; it is a dependency-light route/demo implementation to be reconciled with that library.

## Run
```bash
npm ci
npm run dev
npm run typecheck
npm run validate:routes
npm run build
npm run start
```
Node 22+ recommended. Dependencies are pinned and package-lock.json is included. Production start defaults to port 3000. No secrets needed. No commit, push or deployment performed.

## Source map
app/: all concrete and dynamic route modules, layout and error states.
components/playground.tsx: directory search, theme controls, forms, data views, identity fixtures, workflow review invalidation and components.
components/scene-editor.tsx: shared scene document, object inspector, transforms, undo/redo and schematic 2D/3D.
components/spatial-editor.tsx: local metric points, layer controls, query and Euclidean segment measurement.
components/auth-reference.tsx: sign-in, workspace, permission, session and audit UI reconstructed from supplied pixels.
lib/: route metadata, catalogue, data contracts and guide boundaries.
route-manifest.json: all 184 supported fixture/catalogue URLs.
FULL-SOURCE.md: complete human-readable source listing, excluding dependency lockfile (included separately).

## Validation
TypeScript: PASS.
Production Next.js build: PASS (185 generated paths includes framework paths).
Route registry: PASS (79 static route modules; 184 public demo/catalogue URLs).
HTTP rendering: PASS (184/184 status 200 and headings present).
Unknown routes: three status-404 checks passed. Next.js emitted Internal: NoFallbackError warnings for unknown dynamic URLs; framework warning remains an open investigation gate.
Browser interaction and mobile/desktop visual qualification: BLOCKED/UNTESTED. Chromium download was empty/truncated. HTTP success is not browser interaction evidence.
Source whitespace diff check: recorded in VALIDATION.json.

## Honest feature boundaries
All state is local React memory and resets on route unmount; no server persistence, SSO, MFA verification, tenancy enforcement or audit storage. Auth callback does not exchange tokens. Use fictional input only.
Spatial is a local coordinate schematic, not GIS. 3D is software-projected SVG, not WebGL. Lighting, terrain, animation and annotation routes share a documented base editor and do not implement full specialized engines. Assets show file metadata only, not uploaded/parsed models.
Popover, menu, command palette and tooltip examples explicitly use disclosure substitutes; not finished ARIA primitives. Foundations share a token preview rather than complete specialized authoring tools.
Reviewed JSON exports are illustrative; no legally binding approval, real quote, price or booking. Changing workflow inputs invalidates prior local review.
Unknown fixture IDs are rejected; dynamic routes accept only declared demo IDs until API integration.

## Next release gates
Replace demo controls with actual MAATAA UI exports. Add specialized spatial/WebGL adapters. Implement and verify tenant-scoped APIs and durable records. Integrate vetted identity provider/MFA. Run browser interaction, accessibility, visual, concurrency and recovery checks.

## Design studios

See ../../docs/design-studios.md for Theme Studio, Branding Studio, scoped configuration, landing adapters and current validation limits. Earlier FULL-SOURCE.md and http-check-results.json preserve the initial imported snapshot.
