# UI and workflow recovery evidence

Scope: E02.08/E02.10/E02.11 and UI portions of E09.05. Date: 2026-10-10.

## Implementation

- Existing App Router loading, segment error/reset and not-found/home recovery remain in place. Added a root `global-error.tsx` independent of failed providers/styles, with retry and home navigation, no exception detail disclosure.
- Workflow requests have a 20-second deadline. The pending operation is visibly announced and marks the workflow busy; existing mutation buttons are disabled while pending.
- Failed saves preserve form input. Explicit recovery reloads the latest saved event/evidence and asks the user to review before another submission. It does not automatically replay a failed mutation, silently overwrite a competing revision or claim a success.
- Workflow stage tabs retain arrow navigation and Home/End; skip link and navigation/browser controls have existing keyboard coverage.

## Qualification

`tests/nevo-ui-recovery-browser.mjs` exercises production Next rendering, real unknown-route HTTP404/home navigation, desktop/mobile overflow, axe and keyboard tabs. Conflict/pending API responses in this particular test are explicitly intercepted UI failure injection; they do not certify backend concurrency or authorization.

The actual authenticated/persisted browser workflow is independently exercised by `tests/nevo-workflow-browser.mjs`. All-route desktop/mobile checks are in `apps/maataa-ui-route-source/tests/browser/enterprise-ui.spec.ts` using route-manifest.json.

No external booking, bank settlement, payment provider, SMTP dispatch, financial user acceptance or physical-device certification is inferred from local browser checks. Global-error is implemented but a real root exception is not intentionally introduced into production routes to exercise it; no production fault route is shipped.

Current commands/results must be reconciled after the combined-source serialized build; older reports remain historical evidence.

## Current browser results

- Combined-source production Next build supplied by root, Chromium installed binary. Full enterprise browser matrix: **548 unique cases** (264 routes at two viewports plus 20 interaction cases). Initial run: 544 passed and four failed. The four failures were two ambiguous Studio status locators introduced by a second status region and two `networkidle` navigation timeouts on a rendered workflow page. Scoped status locators and load/font readiness corrected the test assumptions; affected rerun **4/4 passed**. No application source changed between these runs.
- Includes all **36 landing routes** at desktop/mobile widths, visible image loading, heading, stylesheet, overflow and automated axe checks.
- Focused recovery runner: **8 checks passed**, with explicit UI failure-injection fixture (no claim of backend conflict certification).
- Representative screenshot rerun: **2/2 passed**, retaining gallery, NEVO landing, workspace and Theme Studio captures for both viewports. Visual inspection of desktop/mobile NEVO and Theme Studio plus desktop gallery showed readable wrapping, aligned content and no visible clipping. Screenshot copies and initial/affected machine reports: `artifacts/ui-workflow-regression/`.
- `node --check tests/nevo-ui-recovery-browser.mjs` and `git diff --check` passed.

E02.11 remains partly unverified: actual root/segment exception injection and framework retry dispatch were not exercised. Existing HTTP404/home recovery and visible pending/failed save recovery were exercised; do not promote those to a root exception test. Physical devices and manual screen-reader certification also remain separate gates.

## Subsequent E02.11 actual framework boundary validation

The earlier root/segment injection limitation above was addressed by `tests/next-boundary-browser.mjs`: a temporary isolated Next16.3.8 **production** application copies the shipped loading/error/global-error files byte-for-byte and records SHA-256. Only that disposable app has flag-triggered server faults; no fault route is shipped in ALLB.

The first actual test found a defect: segment `reset()` alone left the server exception cached after the underlying fault cleared. Segment retry now uses `router.refresh()` plus reset under a React transition. Root/global retry performs a full page reload and does not depend on the failed provider/router tree. Five current checks passed: isolated production build; streamed loading announcement and completion; actual segment server exception and recovery; actual root-layout exception and full-page retry; error-to-home navigation. Secret exception marker strings were absent from user-visible content.

Fixture builds use Webpack because Turbopack refuses a temporary symlink pointing outside its project filesystem root. This affects fixture packaging, not the Next error dispatch runtime under test. The host production build remains separately validated by root. Artifact: `artifacts/next-boundary-browser/results.json` and build log. E02.11 has actual framework failure/retry evidence now; E12 manual AT/physical devices and baseline approval remain open.

The fixture was subsequently rerun with `CI=true`, which makes Next fail rather than auto-install missing TypeScript dependencies. Its final run used the host's restored TypeScript5.9.3 and Next16.3.8; all five boundary checks passed again. An initial missing-dependency auto-install through the shared temporary symlink changed local binary shims; this was corrected without installing packages, and the fixture now explicitly disables that installer. No repository manifests/locks were changed by this repair.
