# Browser, device, assistive technology and visual gates

Date: 2026-10-10. Local automation supports Chromium evidence only; this document does not approve staging or release baselines.

## Executable compatibility matrix

`tests/browser-device-matrix.mjs` uses the supplied installed Chromium executable, checks installed Playwright Firefox/WebKit paths and records unavailable engines as untested. It exercises twelve representative routes spanning the eight landing families, the gallery, Theme Studio and integration workflow/security.

| Profile | CSS viewport | Input/display | Evidence boundary |
| --- | --- | --- | --- |
| Tablet portrait | 768×1024 | Emulated touch/mobile | Chromium; not a physical iPad |
| Tablet landscape | 1024×768 | Emulated touch/mobile | Chromium; not Safari |
| Reduced-motion phone | 390×844 | Emulated touch; reduced motion | Chromium; not a physical Android/iPhone |
| Forced-colors desktop | 1440×1000 | Forced colors active | Browser emulation; not Windows screen-reader certification |

Checks: visible heading, overflow, loaded viewport images, page exceptions, WCAG A/AA axe rules. Candidate NEVO/workflow full-page screenshots record SHA-256 and display profile. Current run results belong in `artifacts/browser-device-matrix/results.json`.

Existing full route matrix covers all 264 routes, including 36 landing concepts, desktop and Pixel7 emulated mobile; see `artifacts/ui-regression-summary.json`. These are historical relative to later source revisions until rerun/reconciled by the release owner.

## Manual assistive-technology gate (E12.04)

Not executed in this headless Linux environment. A human tester must record actual hardware, OS, browser, AT version, scenario, expected announcement, result and issue link. Do not infer manual results from axe or keyboard automation.

Required sessions:

- NVDA + supported Windows browser: skip navigation; gallery search/filter count and empty state; form validation; workflow busy/error/latest revision recovery; stage tabs; authentication/MFA/recovery; immutable handoff evidence.
- VoiceOver + Safari on macOS/iOS: rotor landmarks/headings; navigation and mobile menu; input labels; status/alert announcements; reading order, tab changes and dialogs.
- Keyboard-only without AT: visible focus, escape/close behavior, complete form flows, no trap, focus after a destructive/recovery action. Automated examples exist, but manual coverage of every rendered custom control is not implied.
- Zoom/text resize, high contrast and reduced motion: inspect actual OS/browser at 200% and 400% zoom; verify content reflow and that motion is not the sole meaning carrier.

Each failed scenario blocks its affected flow until fixed and rerun. Automated zero violations do not establish WCAG conformance.

## Visual baseline review gate (E12.05)

Candidate screenshot artifacts are generated, not approved. Record source commit/worktree digest, build ID, browser version, viewport, font/assets, motion setting and capture script. A designated user/reviewer must inspect each family and important workflow state against supplied artwork and accept deviations explicitly.

Approve only after review of desktop/mobile hierarchy, palette, hero composition, card spacing, image crop, readable labels, empty/loading/error/conflict states and long content. Pixel differences across browser engines and device fonts require judgment, not automatic baseline replacement. Do not describe a SHA-256 or successful screenshot capture as visual approval.

Uninstalled Firefox/WebKit, physical devices, manual AT and human baseline approval remain open release gates.

## Forced-colors finding and fix

The first expanded run passed 36 tablet/reduced-motion cases but recorded 12 forced-colors cases as structural-only, with contrast unqualified. Diagnostic captures showed readable native white/black paint and computed black H1 text, while axe reported authored pale colors and decorative gradient backgrounds. Those findings were retained rather than reported as passes.

An explicit forced-colors stylesheet now uses Canvas/CanvasText, LinkText and native field/button colors; removes only known authored decorative gradient backgrounds (actual image assets remain); ensures text opacity and clear system-color focus/selection outlines. A CSS-injection preflight of all twelve forced-color routes passed strict axe including contrast plus meaningful foreground/background and navigation-link system-color ratio assertions. That preflight does **not** certify the production artifact. The final compiled-source expanded runner must pass separately after root rebuild; output identifies preflight vs production evidence.

Initial qualification artifact: `artifacts/browser-device-matrix/initial-forced-colors-unqualified.json`. Candidate screenshots remain unapproved despite local visual inspection.
