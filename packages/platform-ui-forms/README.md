# @platform/ui-forms

Shared form-primitive components, extracted 2026-09-13 as the first step of the centralized
platform-architecture plan (see the "organize" Claude project's
`claude/centralized_platform_architecture_2026-09-13.md`).

## Where this came from

Almost everything here (`Select`, `Checkbox`, `Radio`, `Toggle`, `ToggleGroup`, `FieldShell`,
`Textarea`, `SearchInput`, `Slider`, `FileInput`, `Form`, `FormRow`, `FormSection`,
`ValidationMessage`, `FormActions`, `DatePicker`, `TimePicker`, `DateTimePicker`,
`DateRangePicker`, `CalendarGrid`, `dateUtils`) was moved as-is from `maataa-ui-lib`'s
`src/forms/` — that was the more complete, tested implementation (full test + Storybook
coverage per component) compared to the alternative in `nevo-ui`.

`MultiSelect` and `Label` were ported from `nevo-ui/src/forms/` — `maataa-ui-lib` had no
equivalent component at all, so these are additions, not replacements.

## Known limitation: two styling conventions coexist here

The maataa-ui-lib-derived components use inline styles driven by `./tokens.ts` (color/spacing/
radius design tokens). `MultiSelect` and `Label` (ported from nevo-ui) instead use Tailwind
utility classes and were left exactly as they were on port, to avoid changing their behavior.
Reconciling these two styling systems into one is a deliberate follow-up, not attempted here.

## What was deliberately NOT centralized

- `nevo-ui`'s `Button` component was left in `nevo-ui` rather than added here, because
  `maataa-ui-lib` already exports its own `Button` from a different category (`primitives`,
  not `forms`) — adding a second `Button` here would collide with that name once re-exported
  through `@maataa/ui`'s top-level barrel. Unifying the two `Button` implementations is a
  separate decision, not a forms-package concern.
- `nevo-ui`'s `Checkbox`, `Radio`, `Select`, `Textarea`, `Input`, `FileInput` were **not**
  ports of these components — they had genuinely different APIs (nevo-ui's `Checkbox.onChange`
  passed the native event; this package's takes a boolean, for example) and are Tailwind-based
  rather than token-based. Since nothing in the codebase actually consumed `nevo-ui`'s versions
  yet (verified 2026-09-13: zero real imports from `@nevo/ui` anywhere in
  `nevo-super-platform`, its only declared consumer), `nevo-ui` now re-exports the shared
  components from this package instead of keeping its own separate implementations — see
  `nevo-ui/src/forms/index.ts`.
- `nevo-ui/src/forms/map/` (`AreaInput`, `MultiAreaInput`, `PinInput`, `MultiPinInput`) stayed
  in `nevo-ui` — these are NEVO-specific geo/event form widgets, not generic UI.

## Consumers

- `@maataa/ui` (`maataa-ui-lib`) re-exports everything from here under its `./forms` subpath
  (`maataa-ui-lib/src/forms/index.ts`), so `import { Checkbox } from "@maataa/ui/forms"` keeps
  working unchanged.
- `@nevo/ui` (`nevo-ui`) re-exports the overlapping components from here plus its own
  `Button` and `forms/map/` widgets (`nevo-ui/src/forms/index.ts`).
