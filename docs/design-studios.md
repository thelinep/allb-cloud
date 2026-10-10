> Current application integration: see [Unified ALLB application](unified-app-integration.md). Studio and landings now share one application/origin; manual JSON transfer is only needed for other browsers or separately hosted legacy copies.

# MAATAA Theme Studio and Branding Studio

## Where to open

Run from the repository checkout:

    cd apps/maataa-ui-route-source
    npm ci
    npm run dev

Open /studio/themes for theme configuration and /studio/branding for branding.
The sidebar and Studio directory expose both routes.

## Behavior

- Global defaults apply to every MAATAA route rendered under DesignProvider.
- 36 ALLB identities and their landing route assignments are seeded from the imported landing manifest.
- Brand settings override global settings.
- Route-family patterns such as /allb/* apply from broadest to most specific.
- Exact route settings override family settings.
- Theme and branding overrides are independent; changing one field leaves other fields inherited.
- Future routes inherit automatically. Adding a configuration does not implement the route.
- The route selector includes all 259 supported MAATAA fixture/catalogue URLs and 36 ALLB landing routes. Arbitrary future paths and family patterns can be added.
- Theme: four editable presets, six semantic colors, light/dark color scheme, font, density and radius.
- Branding: name, tagline, existing logo/favicon/hero URLs and hero alternative text.
- Draft preview and text color contrast checks. Preview is illustrative, not a screenshot of the target page.
- Save draft retains the draft in this browser. Apply locally additionally updates the active configuration consumed by renderers.
- Save before navigating between studios; unsaved edits are held in the current editor only.
- Reset restores global defaults or removes the selected scope's theme/branding overrides.
- JSON import validates schema, scopes, assignments, tokens and image URLs before replacing the draft. Export is a portable configuration snapshot.
- HTTPS and same-origin asset paths are accepted. Images are referenced, not uploaded or generated.
- The renderer updates the visible brand identity and favicon; server SEO metadata remains unchanged.

## ALLB landing adapter

The imported Observatory app reads the same active configuration through components/landing-design.tsx.
It applies semantic tokens, brand wordmark/logo, tagline, hero and favicon to /allb/[slug].
Without an active configuration the original landing design remains in place.

localStorage is scoped to an origin. Separate ports/domains do not share it.
For a separately hosted landing application, export JSON from Studio, open the landing's
"Import Studio configuration" section, and import the file there.
"Restore original landing design" clears the active settings in that origin.

New renderers should use packages/design-config/config.ts and consume the active configuration.
CSS must use the shared tokens; embedded artwork, arbitrary hardcoded child styles and third-party viewers do not automatically recolor.

## Verification

- MAATAA UI TypeScript: PASS.
- MAATAA UI production build: PASS.
- Route registry: 82 concrete page modules, 259 supported catalogue/fixture URLs.
- HTTP rendering: /studio/themes, /studio/branding and /studio return 200.
- Shared configuration tests: PASS (inheritance, family specificity, future routes, exact overrides, brand resolution, immutable resolution, validation, asset URL restrictions, contrast and JSON roundtrip).
- Scoped ALLB landing TypeScript: PASS, using the installed route application's Next/React tooling.
- ALLB landing bundling: compiled, then full app typecheck blocked by unavailable @opennextjs/cloudflare in the validation environment. The Observatory's native pinned dependency stack and Rust/Cloudflare release pipeline are not certified.
- Browser interactions/mobile visual checks: UNTESTED. Chromium download returned an invalid/truncated archive.

Run shared tests from the repository root with Node 22.6+ (Node 24 used here):

    node --experimental-strip-types packages/design-config/tests/config.test.mjs

## Production work remaining

Configuration is browser-local, without a server API, database, organization/workspace authority,
asset upload pipeline, shared publishing, approval/version history, SEO updates or cross-device sync.
No deployment occurred. Production publication needs durable storage, authenticated mutation authority,
review/version control, renderer coverage and browser/accessibility verification.
