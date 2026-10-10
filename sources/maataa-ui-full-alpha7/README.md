# @maataa/ui

Standalone MAATAA visual UI library for React + TypeScript applications.

New to this repository? Start with [`docs/START-HERE.md`](docs/START-HERE.md) for setup, a folder map, and safe first steps.

## Repository map

```text
src/                         Reusable UI package source
apps/tlp-film/               Standalone local film-producer timeline app
apps/tlps/                   Standalone local production planning workflow app
archives/maataa-ui-source-snapshots/ Historical MAATAA UI generations, hash-indexed
examples/redux-demo/         MAATAA product explorer, Theme Studio, Brahmini and pilot demos
examples/support-center/     Standalone Support Center and Electron desktop shell
tests/                       Unit, accessibility and browser end-to-end tests
stories/                     Storybook examples; generated stories live in stories/generated/
docs/product/                Product guides and UI catalog references
docs/release/                Roadmap, release status, evidence and hotfix history
docs/engineering/            Runtime, composition and implementation contracts
docs/pilots/                  TLPS and NEVO pilot plans and local run records
manifests/                   Generated API, catalogue, demo and release-prep snapshots
scripts/                     Build, validation, packaging and reporting tools
scripts/hotfixes/alpha8.5/    Archived Alpha 8.5 apply, rollback and verification tools
beta/                         Beta budgets and qualification policy
```

The repository root keeps the package manager files and tool configs that the current TypeScript, Vite, Vitest and Playwright commands resolve from there. Product planning lives in [`docs/product/PRODUCT-ROADMAP.md`](docs/product/PRODUCT-ROADMAP.md), enterprise release planning in [`docs/release/ROADMAP.md`](docs/release/ROADMAP.md), and current release-evidence rules in [`docs/release/EVIDENCE.md`](docs/release/EVIDENCE.md). Browse the rest of the docs in [`docs/README.md`](docs/README.md); generated snapshots are indexed in [`manifests/README.md`](manifests/README.md).

For a navigable reconstruction of the product, pilots, Brahmini workbench, authority boundaries and release gates, open the [MAATAA ecosystem knowledge graph](docs/knowledge-graph/).

Historical MAATAA UI package copies have been absorbed into this repository under [`archives/maataa-ui-source-snapshots/`](archives/maataa-ui-source-snapshots/), with source provenance and SHA-256 inventories. The canonical shared package remains `src/`; the absorption and consumer-migration boundaries are documented in the [source absorption report](docs/knowledge-graph/MAATAA_UI_SOURCE_ABSORPTION_2026-10-07.md).

This package contains application-agnostic components only. It does **not** provide authentication, authorization, API clients, databases, business workflows, payments, infrastructure provisioning, or application routing.

## Public / demo surface

`pnpm demo` launches the complete hash-routed local surface with Landing, Live Full Surface Explorer, Playground, Sandbox, Demos, Docs, Help and Support. The explorer includes a visual preview canvas and copy controls. See [the public surface guide](docs/product/PUBLIC-SURFACE.md).

## Icons & symbolic demo identities

Alpha 8 adds **42 provider-free MAATAA core SVG icons** and **15 symbolic demo identities**: Brahmini, Shiv, Parvati, seven Saptarishis and five Panchtatva identities. The demo uses these personas for session identity, workspace ownership, AI agents, activity, approvals and avatar groups. Their software responsibilities are demo metaphors only, not theological claims. See [identities](docs/product/IDENTITIES.md) and [icons](docs/product/ICONS.md).

```tsx
import { IdentityAvatar } from "@maataa/ui/identity/IdentityAvatar";
import { MaataaIcon } from "@maataa/ui/icons/MaataaIcon";
```

## Scope

- Foundation/layout primitives and providers
- Typography
- Buttons and actions
- Forms and field composition
- Navigation and responsive application shell
- Surfaces, overlays, dialogs, drawers, popovers and toasts
- Feedback/status/loading/empty/error states
- Tables, lists, avatars, metrics and trees
- Lightweight SVG data visualization
- Provider-neutral map surface components
- Mobile shell, bottom navigation, drawers, safe areas and adapter-oriented interactions
- Light/dark/system theme support
- RTL-compatible layouts using logical CSS properties
- Reduced-motion support

## Install

```bash
npm install @maataa/ui react react-dom
```

> This ZIP is source-ready. The included `package.json` remains `private: true` to prevent accidental publication. Remove that flag only after your release review.

## Quick start

```tsx
import { UiProvider, AppShell, TopNav, Sidebar, Button } from "@maataa/ui";
import "@maataa/ui/styles.css";

const items = [
  { id: "home", label: "Home", href: "/" },
  { id: "projects", label: "Projects", href: "/projects" },
];

export function App() {
  return (
    <UiProvider theme="system">
      <AppShell
        topNav={<TopNav brand={<strong>MAATAA</strong>} />}
        sidebar={<Sidebar items={items} activeId="home" />}
      >
        <main style={{ padding: 24 }}>
          <h1>Workspace</h1>
          <Button>Create</Button>
        </main>
      </AppShell>
    </UiProvider>
  );
}
```

## Subpath imports

```tsx
import { Button, IconButton } from "@maataa/ui/actions";
import { Input, FormField } from "@maataa/ui/forms";
import { Modal, ToastProvider } from "@maataa/ui/surfaces";
import { DataTable } from "@maataa/ui/data";
import { ThemeProvider } from "@maataa/ui/themes";
```

## Design behavior

The MAATAA gold/focus glare is static at rest and animates/brightens only on hover, keyboard focus, or active interaction. The stylesheet respects `prefers-reduced-motion`.

## Accessibility

The package is designed around semantic HTML, keyboard operability, visible focus, appropriate ARIA semantics, and touch-friendly controls. Automated checks cannot establish complete WCAG conformance; see [the accessibility guide](docs/product/ACCESSIBILITY.md).

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run storybook
npm run storybook:build
npm run api:manifest
npm pack
```

### Standalone TLP and TLPS apps

These are separate local applications that import the shared `@maataa/ui` package source through their Vite configs. They keep independent routes, local-storage keys, and product boundaries.

```bash
pnpm tlp:dev        # http://127.0.0.1:4195
pnpm tlps:dev       # http://127.0.0.1:4196
pnpm products:typecheck
pnpm products:build
pnpm products:e2e  # desktop and mobile Chromium flows
```

Both are browser-local prototypes. TLP policy/funding claims are flagged for verification; TLPS review is preview-only and does not connect to a tenant or production service. See [TLP Film README](apps/tlp-film/README.md) and [TLPS README](apps/tlps/README.md).

For a single desktop entry point, `pnpm maataa:desktop:dev` bundles MAATAA UI, TLP Film, TLPS, the NEVO demo, and Support Center into one Electron shell. Their focused browser dev servers remain available for isolated work; the unified shell is the place to move between them. See [MAATAA Desktop details](examples/support-center/README.md#desktop-app).

## Package boundary

`@maataa/ui` owns visual interaction components. Host applications own routing, data fetching, authentication, authorization and business state.

See [components](docs/product/COMPONENTS.md), [themes](docs/product/THEMING.md), [accessibility](docs/product/ACCESSIBILITY.md), and [migration](docs/product/MIGRATION.md).

## Atomic component contract

Every public UI part is independently importable. Category barrels remain convenience-only. Prefer direct imports when composing new primitives:

```tsx
import { Button } from "@maataa/ui/actions/Button";
import { Input } from "@maataa/ui/forms/Input";
import { DialogHeader, DialogBody, DialogFooter } from "@maataa/ui/atomic";
import { TableHead, TableBody, TableRow, TableCell } from "@maataa/ui/atomic";
```

Compound components must be composed from independently addressable parts. Application/domain state remains outside the package.

## Layout system

The package includes 34 independently importable layout-region atoms and 100 named compositional layout archetypes, including Holy Grail, Master–Detail, Workbench, Studio, Command Center, IDE, Spatial/CAD, Builder, Dashboard, Map Workspace, Kiosk, Control Room and HUD. See [layouts](docs/product/LAYOUTS.md).

```tsx
import { HolyGrailLayout } from "@maataa/ui/layouts/HolyGrailLayout";
import { LayoutSidebar } from "@maataa/ui/layout-atoms/LayoutSidebar";
```

## Alpha 6 — full registry-aware + AI + device architecture

The package models the complete UI composition chain:

```text
Registry Registry
  → Workspace / AI Space
  → Page
  → Layout
  → Region / Slot
  → Generator / Tool / Pattern / Composition
  → Component
  → Atom
```

Current snapshot:

- 500 page types in 41 page groups
- 647 workspace types in 58 workspace groups
- 100 layout archetypes in 18 layout groups
- 208 canonical generators across 21 generator groups
- 491 canonical tools across 19 tool groups
- 112 AI spaces across 7 AI-space groups
- 187 canonical device types across 41 device groups
- 46 viewport classes, 18 input modalities, 14 orientation/folding modes
- 46 device capabilities, 11 safe-area profiles, 25 responsive transformations
- 20 device atoms
- 211 governed registry definitions plus `REGISTRY.REGISTRY`
- 32 AI-specific registry definitions
- 27 page atoms, 24 workspace atoms, 34 layout atoms
- 14 generator atoms, 13 tool atoms, 23 AI-space atoms
- 22 reusable page templates and 39 reusable workspace templates
- 1721 public declarations
- 1572 direct public component imports

Examples:

```tsx
import { PageHeader } from "@maataa/ui/page-atoms/PageHeader";
import { HolyGrailLayout } from "@maataa/ui/layouts/HolyGrailLayout";
import { ComponentGenerator } from "@maataa/ui/generators/ComponentGenerator";
import { AgentBuilder } from "@maataa/ui/tools/AgentBuilder";
import { MAATAAAIStudio } from "@maataa/ui/ai-spaces/MAATAAAIStudio";
import {
  GENERATOR_REGISTRY,
  TOOL_REGISTRY,
  AI_SPACE_REGISTRY,
} from "@maataa/ui/registries";
```

All registry metadata is descriptive UI vocabulary. It does **not** implement authentication, authorization, model execution, agent execution, external tool execution, persistence, APIs, infrastructure, migration execution or deployment authority.

## Alpha 5 · Generators, Tools & AI Spaces

Alpha 5 adds atomic visual/editor surfaces and canonical catalogs for generators, tools and AI-related spaces. Each generator/tool/space has a direct import file, while runtime execution remains host-owned. See [generators](docs/product/GENERATORS.md), [tools](docs/product/TOOLS.md), [AI spaces](docs/product/AI-SPACES.md) and [AI architecture](docs/product/AI-ARCHITECTURE.md).

## Device system

Alpha 6 adds 187 canonical device types across 41 groups plus first-class viewport, input-modality, orientation, device-capability, safe-area and responsive-transformation catalogs. Every canonical device frame has a direct atomic import path under `@maataa/ui/devices/*`. See [devices](docs/product/DEVICES.md).

## Alpha 7 Redux + demo data

Use `@maataa/ui/redux`, `@maataa/ui/types`, `@maataa/ui/static-data`, and `@maataa/ui/demo` for stateful demos. The Redux layer is optional and does not provide backend authority or persistence.

## Alpha 8 actual preview guarantee

- Component selection in Full Surface resolves the selected `@maataa/ui/...` import path to its real source module.
- `ACTUAL EXPORT` means the selected runtime React export itself is mounted in the canvas.
- Non-renderable type/hook exports are labelled `NON-RUNTIME EXPORT`; context-dependent exports show an explicit context/props message.
- No shared generic Button/Input/Tabs specimen is presented as another selected component.
- All 1,572 registered component import paths are source-resolvable in this package revision.

## Alpha 8 depth runtime

```tsx
import { VisualComposer, DEFAULT_COMPOSER_SCENE } from "@maataa/ui/composer";
import { ResponsiveDeviceRuntime } from "@maataa/ui/runtime";
```

Run `pnpm certify` for the installed-dependency type/test/Storybook/demo certification gate. See [Alpha 8 depth](docs/release/ALPHA8-DEPTH.md) and the [release roadmap](docs/release/ROADMAP.md).

## Alpha 8.4 Beta-prep

Alpha 8.4 adds bundle budgets/manual chunking, clean packed-consumer validation, Playwright desktop/mobile browser smoke tests, automated axe accessibility gates, and deterministic beta-prep evidence. The Alpha 8 baseline is certified; Beta still requires the full `pnpm certify:beta` gate plus manual accessibility/representative real-device acceptance.
