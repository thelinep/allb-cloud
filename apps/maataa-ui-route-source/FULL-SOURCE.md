# Complete MAATAA UI route source

Generated demo source. See README.md for limitations and validation.

## .env.example

````text
# Local UI demos require no credentials. No identity provider is connected.

````

## .gitignore

````text
node_modules/
.next/
.env*
!.env.example

````

## README.md

````markdown
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
route-manifest.json: all 183 supported fixture/catalogue URLs.
FULL-SOURCE.md: complete human-readable source listing, excluding dependency lockfile (included separately).

## Validation
TypeScript: PASS.
Production Next.js build: PASS (185 generated paths includes framework paths).
Route registry: PASS (78 static route modules; 183 public demo/catalogue URLs).
HTTP rendering: PASS (183/183 status 200 and headings present).
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

````

## VALIDATION.json

````json
{
  "typescript": "PASS",
  "nextBuild": "PASS",
  "routeUrls": 183,
  "httpRender": "183/183 PASS",
  "unknown404": "3/3 PASS",
  "whitespaceDiffCheck": "PASS",
  "browser": "BLOCKED: truncated Chromium download",
  "visual": "UNTESTED",
  "openGate": "Next.js Internal: NoFallbackError warning on unknown dynamic URLs"
}
````

## app/3d/animation/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Animation"};
export default function Page(){return <RouteView spec={{"path": "/3d/animation", "group": "3D", "title": "Animation", "mode": "scene", "description": "Animation contracts, examples and local interaction guidance."}}/>}

````

## app/3d/annotations/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Annotations"};
export default function Page(){return <RouteView spec={{"path": "/3d/annotations", "group": "3D", "title": "Annotations", "mode": "scene", "description": "Annotations contracts, examples and local interaction guidance."}}/>}

````

## app/3d/assets/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Assets"};
export default function Page(){return <RouteView spec={{"path": "/3d/assets", "group": "3D", "title": "Assets", "mode": "scene", "description": "Assets contracts, examples and local interaction guidance."}}/>}

````

## app/3d/cameras/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Cameras"};
export default function Page(){return <RouteView spec={{"path": "/3d/cameras", "group": "3D", "title": "Cameras", "mode": "scene", "description": "Cameras contracts, examples and local interaction guidance."}}/>}

````

## app/3d/lighting/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Lighting"};
export default function Page(){return <RouteView spec={{"path": "/3d/lighting", "group": "3D", "title": "Lighting", "mode": "scene", "description": "Lighting contracts, examples and local interaction guidance."}}/>}

````

## app/3d/materials/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Materials"};
export default function Page(){return <RouteView spec={{"path": "/3d/materials", "group": "3D", "title": "Materials", "mode": "scene", "description": "Materials contracts, examples and local interaction guidance."}}/>}

````

## app/3d/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"3D overview"};
export default function Page(){return <RouteView spec={{"path": "/3d", "group": "3D", "title": "3D overview", "mode": "directory", "description": "3D overview contracts, examples and local interaction guidance."}}/>}

````

## app/3d/scene-tree/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Scene Tree"};
export default function Page(){return <RouteView spec={{"path": "/3d/scene-tree", "group": "3D", "title": "Scene Tree", "mode": "scene", "description": "Scene Tree contracts, examples and local interaction guidance."}}/>}

````

## app/3d/transforms/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Transforms"};
export default function Page(){return <RouteView spec={{"path": "/3d/transforms", "group": "3D", "title": "Transforms", "mode": "scene", "description": "Transforms contracts, examples and local interaction guidance."}}/>}

````

## app/3d/viewport/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Viewport"};
export default function Page(){return <RouteView spec={{"path": "/3d/viewport", "group": "3D", "title": "Viewport", "mode": "scene", "description": "Viewport contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/contrast/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Contrast"};
export default function Page(){return <RouteView spec={{"path": "/accessibility/contrast", "group": "Accessibility", "title": "Contrast", "mode": "docs", "description": "Contrast contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/forms/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Forms"};
export default function Page(){return <RouteView spec={{"path": "/accessibility/forms", "group": "Accessibility", "title": "Forms", "mode": "docs", "description": "Forms contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/keyboard/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Keyboard"};
export default function Page(){return <RouteView spec={{"path": "/accessibility/keyboard", "group": "Accessibility", "title": "Keyboard", "mode": "docs", "description": "Keyboard contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Accessibility"};
export default function Page(){return <RouteView spec={{"path": "/accessibility", "group": "Accessibility", "title": "Accessibility", "mode": "docs", "description": "Accessibility contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/reduced-motion/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Reduced Motion"};
export default function Page(){return <RouteView spec={{"path": "/accessibility/reduced-motion", "group": "Accessibility", "title": "Reduced Motion", "mode": "docs", "description": "Reduced Motion contracts, examples and local interaction guidance."}}/>}

````

## app/accessibility/screen-readers/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Screen Readers"};
export default function Page(){return <RouteView spec={{"path": "/accessibility/screen-readers", "group": "Accessibility", "title": "Screen Readers", "mode": "docs", "description": "Screen Readers contracts, examples and local interaction guidance."}}/>}

````

## app/auth/callback/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Auth Callback"};
export default function Page(){return <RouteView spec={{"path": "/auth/callback", "group": "Identity", "title": "Auth Callback", "mode": "auth", "description": "Auth Callback contracts, examples and local interaction guidance."}}/>}

````

## app/auth/mfa/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Auth Mfa"};
export default function Page(){return <RouteView spec={{"path": "/auth/mfa", "group": "Identity", "title": "Auth Mfa", "mode": "auth", "description": "Auth Mfa contracts, examples and local interaction guidance."}}/>}

````

## app/auth/recovery/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Auth Recovery"};
export default function Page(){return <RouteView spec={{"path": "/auth/recovery", "group": "Identity", "title": "Auth Recovery", "mode": "auth", "description": "Auth Recovery contracts, examples and local interaction guidance."}}/>}

````

## app/changelog/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Changelog"};
export default function Page(){return <RouteView spec={{"path": "/changelog", "group": "Release", "title": "Changelog", "mode": "readiness", "description": "Changelog contracts, examples and local interaction guidance."}}/>}

````

## app/compatibility/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Compatibility"};
export default function Page(){return <RouteView spec={{"path": "/compatibility", "group": "Release", "title": "Compatibility", "mode": "readiness", "description": "Compatibility contracts, examples and local interaction guidance."}}/>}

````

## app/components/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
const slugs=["button", "input", "textarea", "select", "checkbox", "radio", "switch", "tabs", "card", "dialog", "drawer", "accordion", "popover", "tooltip", "alert", "toast", "badge", "progress", "skeleton", "header", "sidebar", "breadcrumbs", "menu", "pagination", "command-palette", "empty-state", "error-state"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/components/${slug}`,group:'Components',title:slug.replaceAll('-',' '),mode:'component',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/components/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Component directory"};
export default function Page(){return <RouteView spec={{"path": "/components", "group": "Components", "title": "Component directory", "mode": "directory", "description": "Component directory contracts, examples and local interaction guidance."}}/>}

````

## app/data/charts/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Charts"};
export default function Page(){return <RouteView spec={{"path": "/data/charts", "group": "Data", "title": "Charts", "mode": "data", "description": "Charts contracts, examples and local interaction guidance."}}/>}

````

## app/data/code-viewer/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Code Viewer"};
export default function Page(){return <RouteView spec={{"path": "/data/code-viewer", "group": "Data", "title": "Code Viewer", "mode": "data", "description": "Code Viewer contracts, examples and local interaction guidance."}}/>}

````

## app/data/filters/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Filters"};
export default function Page(){return <RouteView spec={{"path": "/data/filters", "group": "Data", "title": "Filters", "mode": "data", "description": "Filters contracts, examples and local interaction guidance."}}/>}

````

## app/data/tables/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Tables"};
export default function Page(){return <RouteView spec={{"path": "/data/tables", "group": "Data", "title": "Tables", "mode": "data", "description": "Tables contracts, examples and local interaction guidance."}}/>}

````

## app/data/timeline/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Timeline"};
export default function Page(){return <RouteView spec={{"path": "/data/timeline", "group": "Data", "title": "Timeline", "mode": "data", "description": "Timeline contracts, examples and local interaction guidance."}}/>}

````

## app/data/tree/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Tree"};
export default function Page(){return <RouteView spec={{"path": "/data/tree", "group": "Data", "title": "Tree", "mode": "data", "description": "Tree contracts, examples and local interaction guidance."}}/>}

````

## app/deprecations/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Deprecations"};
export default function Page(){return <RouteView spec={{"path": "/deprecations", "group": "Release", "title": "Deprecations", "mode": "readiness", "description": "Deprecations contracts, examples and local interaction guidance."}}/>}

````

## app/developers/composition/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Composition"};
export default function Page(){return <RouteView spec={{"path": "/developers/composition", "group": "Developers", "title": "Composition", "mode": "code", "description": "Composition contracts, examples and local interaction guidance."}}/>}

````

## app/developers/contracts/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Contracts"};
export default function Page(){return <RouteView spec={{"path": "/developers/contracts", "group": "Developers", "title": "Contracts", "mode": "code", "description": "Contracts contracts, examples and local interaction guidance."}}/>}

````

## app/developers/integration/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Integration"};
export default function Page(){return <RouteView spec={{"path": "/developers/integration", "group": "Developers", "title": "Integration", "mode": "code", "description": "Integration contracts, examples and local interaction guidance."}}/>}

````

## app/developers/migration/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Migration"};
export default function Page(){return <RouteView spec={{"path": "/developers/migration", "group": "Developers", "title": "Migration", "mode": "code", "description": "Migration contracts, examples and local interaction guidance."}}/>}

````

## app/developers/state/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"State"};
export default function Page(){return <RouteView spec={{"path": "/developers/state", "group": "Developers", "title": "State", "mode": "code", "description": "State contracts, examples and local interaction guidance."}}/>}

````

## app/error.tsx

````tsx
'use client';
export default function ErrorView({reset}:{reset:()=>void}){return <main><h1>Unable to render this view</h1><button onClick={reset}>Try again</button></main>}

````

## app/examples/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
const slugs=["identity", "production", "spatial", "scene", "theme"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/examples/${slug}`,group:'Examples',title:slug.replaceAll('-',' '),mode:({identity:'auth',production:'workflow',spatial:'spatial',scene:'scene',theme:'tokens'} as Record<string,string>)[slug],description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/examples/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Examples directory"};
export default function Page(){return <RouteView spec={{"path": "/examples", "group": "Examples", "title": "Examples directory", "mode": "directory", "description": "Examples directory contracts, examples and local interaction guidance."}}/>}

````

## app/forms/file-upload/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"File Upload"};
export default function Page(){return <RouteView spec={{"path": "/forms/file-upload", "group": "Forms", "title": "File Upload", "mode": "form", "description": "File Upload contracts, examples and local interaction guidance."}}/>}

````

## app/forms/multi-step/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Multi Step"};
export default function Page(){return <RouteView spec={{"path": "/forms/multi-step", "group": "Forms", "title": "Multi Step", "mode": "form", "description": "Multi Step contracts, examples and local interaction guidance."}}/>}

````

## app/forms/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Forms"};
export default function Page(){return <RouteView spec={{"path": "/forms", "group": "Forms", "title": "Forms", "mode": "form", "description": "Forms contracts, examples and local interaction guidance."}}/>}

````

## app/forms/validation/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Validation"};
export default function Page(){return <RouteView spec={{"path": "/forms/validation", "group": "Forms", "title": "Validation", "mode": "form", "description": "Validation contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/borders/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Borders"};
export default function Page(){return <RouteView spec={{"path": "/foundations/borders", "group": "Foundations", "title": "Borders", "mode": "tokens", "description": "Borders contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/colors/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Colors"};
export default function Page(){return <RouteView spec={{"path": "/foundations/colors", "group": "Foundations", "title": "Colors", "mode": "tokens", "description": "Colors contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/elevation/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Elevation"};
export default function Page(){return <RouteView spec={{"path": "/foundations/elevation", "group": "Foundations", "title": "Elevation", "mode": "tokens", "description": "Elevation contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/icons/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Icons"};
export default function Page(){return <RouteView spec={{"path": "/foundations/icons", "group": "Foundations", "title": "Icons", "mode": "tokens", "description": "Icons contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/layout/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Layout"};
export default function Page(){return <RouteView spec={{"path": "/foundations/layout", "group": "Foundations", "title": "Layout", "mode": "tokens", "description": "Layout contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/motion/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Motion"};
export default function Page(){return <RouteView spec={{"path": "/foundations/motion", "group": "Foundations", "title": "Motion", "mode": "tokens", "description": "Motion contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/responsive/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Responsive"};
export default function Page(){return <RouteView spec={{"path": "/foundations/responsive", "group": "Foundations", "title": "Responsive", "mode": "tokens", "description": "Responsive contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/spacing/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Spacing"};
export default function Page(){return <RouteView spec={{"path": "/foundations/spacing", "group": "Foundations", "title": "Spacing", "mode": "tokens", "description": "Spacing contracts, examples and local interaction guidance."}}/>}

````

## app/foundations/typography/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Typography"};
export default function Page(){return <RouteView spec={{"path": "/foundations/typography", "group": "Foundations", "title": "Typography", "mode": "tokens", "description": "Typography contracts, examples and local interaction guidance."}}/>}

````

## app/getting-started/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Getting started"};
export default function Page(){return <RouteView spec={{"path": "/getting-started", "group": "Start", "title": "Getting started", "mode": "docs", "description": "Getting started contracts, examples and local interaction guidance."}}/>}

````

## app/globals.css

````css
:root{color-scheme:dark;--bg:#111817;--surface:#1c2624;--text:#eeeadd;--muted:#b7c0b7;--accent:#d3ec75;--line:#3b4842}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,sans-serif}a{color:var(--accent);text-underline-offset:4px}header{display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:22px 32px;border-bottom:1px solid var(--line)}header>a{font-size:24px;text-decoration:none}header span{font-size:12px;color:var(--muted)}header nav{display:flex;gap:20px;margin-left:auto}.shell{display:grid;grid-template-columns:245px minmax(0,1fr)}aside{padding:20px;border-right:1px solid var(--line)}aside a{display:block;padding:6px 10px;font-size:13px}aside summary{padding:10px;cursor:pointer}#content{min-width:0}main{max-width:1180px;padding:48px 5vw;margin:auto}h1{font:400 clamp(34px,4.5vw,64px)/1.15 Georgia,serif}h2{font:400 28px/1.2 Georgia,serif}.eyebrow{font-size:12px;letter-spacing:.15em;color:var(--muted)}.lead{font-size:19px;color:var(--muted)}.notice{border-left:3px solid var(--accent);padding:12px 18px;background:var(--surface);font-size:13px}section{margin:32px 0}label{display:block;margin:12px 0}input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),textarea,select{display:block;width:100%;max-width:520px;padding:10px;background:#101715;color:var(--text);border:1px solid #768578;border-radius:6px;font:inherit}textarea{min-height:120px}input[type=range]{display:block;width:100%}input[type=checkbox],input[type=radio]{accent-color:var(--accent);margin-right:8px}button{font:inherit;border:1px solid #718060;border-radius:6px;padding:8px 14px;background:#283526;color:var(--text);cursor:pointer;margin:4px}button:disabled{opacity:.5;cursor:default}button[aria-selected=true],button[aria-pressed=true]{background:var(--accent);color:#102000}.controls{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.controls label{flex:1;min-width:140px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:16px}.card,.panel{display:block;background:var(--surface);border:1px solid var(--line);padding:22px;border-radius:12px}.card{text-decoration:none;color:var(--text)}.card small{color:var(--accent)}.card code{overflow-wrap:anywhere}.scroll,.table-scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:12px;text-align:left;border-bottom:1px solid var(--line)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0c1210;padding:20px;border-radius:8px;font-size:13px}fieldset{border:1px solid var(--line);padding:18px}summary{cursor:pointer}dialog{background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:12px;max-width:min(90vw,500px)}dialog::backdrop{background:#0009}.drawer{margin-right:0;min-height:100vh}.scene{width:100%;max-height:450px;border:1px solid var(--line);border-radius:12px}.bar{height:18px;background:var(--accent);margin:10px 0}.badge{background:#35412b;padding:5px 12px;border-radius:30px}.skeleton{height:100px;background:linear-gradient(90deg,#29342c,#465446,#29342c);border-radius:8px}.skip{position:absolute;left:12px;top:-80px;padding:10px;background:var(--accent);color:#111}.skip:focus{top:10px;z-index:10}:focus-visible{outline:3px solid var(--accent);outline-offset:4px}footer{padding:24px 32px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}@media(max-width:800px){.shell{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--line)}aside nav{max-height:240px;overflow:auto}main{padding:28px 20px}header{padding:18px}header nav{margin-left:0}table{min-width:420px}.controls label{min-width:120px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

````

## app/installation/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Installation"};
export default function Page(){return <RouteView spec={{"path": "/installation", "group": "Start", "title": "Installation", "mode": "docs", "description": "Installation contracts, examples and local interaction guidance."}}/>}

````

## app/invitations/[token]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
export default async function Page({params}:{params:Promise<{token:string}>}){const p=await params;const id=p.token;if(!["demo-invite"].includes(id))notFound();return <RouteView spec={{path:`/invitations/${id}`,group:'Studio',title:id,mode:'auth',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{token:'demo-invite'}]}

````

## app/layout.tsx

````tsx
import type {Metadata} from 'next';
import Link from 'next/link';
import routes from '../lib/routes.json';
import './globals.css';
export const metadata:Metadata={title:{default:'MAATAA UI · Local scaffold',template:'%s · MAATAA UI'},description:'Documentation and reversible local playgrounds. No enterprise backend connected.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#content">Skip to content</a><header><Link href="/">MAATAA <b>UI</b></Link><span>Local scaffold · backend disconnected</span><nav aria-label="Main"><Link href="/components">Components</Link><Link href="/studio">Studio</Link><Link href="/readiness">Readiness</Link></nav></header><div className="shell"><aside><nav aria-label="Documentation">{[...new Set(routes.map(r=>r.group))].map(group=><details key={group} open={['Start','Components','Spatial','3D','Studio'].includes(group)}><summary>{group}</summary>{routes.filter(r=>r.group===group).map(r=><Link key={r.path} href={r.path}>{r.title}</Link>)}</details>)}</nav></aside><div id="content">{children}</div></div><footer>Reconstructed demonstration source. No original-source, backend or release-certification claim.</footer></body></html>}

````

## app/loading.tsx

````tsx
export default function Loading(){return <p role='status'>Loading view…</p>}

````

## app/not-found.tsx

````tsx
import Link from 'next/link';
export default function NotFound(){return <main><h1>Page or demo record not found</h1><p>Unknown routes and IDs are not silently mapped to a generic demo.</p><Link href='/'>Return to directory</Link></main>}

````

## app/overview/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Overview"};
export default function Page(){return <RouteView spec={{"path": "/overview", "group": "Start", "title": "Overview", "mode": "directory", "description": "Overview contracts, examples and local interaction guidance."}}/>}

````

## app/page.tsx

````tsx
import {RouteView} from '../components/route-view';
export const metadata={title:"MAATAA UI"};
export default function Page(){return <RouteView spec={{"path": "/", "group": "Start", "title": "MAATAA UI", "mode": "directory", "description": "MAATAA UI contracts, examples and local interaction guidance."}}/>}

````

## app/patterns/identity/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["sign-in", "invitation", "mfa", "recovery", "workspace-switcher", "permissions", "sessions"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/patterns/identity/${slug}`,group:'Identity',title:slug.replaceAll('-',' '),mode:'auth',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/patterns/production/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["dashboard", "asset-browser", "scene-controls", "quote-editor", "client-review", "approval", "handoff"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/patterns/production/${slug}`,group:'Production',title:slug.replaceAll('-',' '),mode:slug==='asset-browser'?'assets':slug==='scene-controls'?'scene':'workflow',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/playground/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../components/route-view';
const slugs=["button", "input", "textarea", "select", "checkbox", "radio", "switch", "tabs", "card", "dialog", "drawer", "accordion", "popover", "tooltip", "alert", "toast", "badge", "progress", "skeleton", "header", "sidebar", "breadcrumbs", "menu", "pagination", "command-palette", "empty-state", "error-state"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/playground/${slug}`,group:'Components',title:slug.replaceAll('-',' '),mode:'component',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/quick-start/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Quick start"};
export default function Page(){return <RouteView spec={{"path": "/quick-start", "group": "Start", "title": "Quick start", "mode": "docs", "description": "Quick start contracts, examples and local interaction guidance."}}/>}

````

## app/readiness/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Readiness"};
export default function Page(){return <RouteView spec={{"path": "/readiness", "group": "Release", "title": "Readiness", "mode": "readiness", "description": "Readiness contracts, examples and local interaction guidance."}}/>}

````

## app/scene/2d-3d/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"2D 3D"};
export default function Page(){return <RouteView spec={{"path": "/scene/2d-3d", "group": "Scene", "title": "2D 3D", "mode": "scene", "description": "2D 3D contracts, examples and local interaction guidance."}}/>}

````

## app/scene/history/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"History"};
export default function Page(){return <RouteView spec={{"path": "/scene/history", "group": "Scene", "title": "History", "mode": "scene", "description": "History contracts, examples and local interaction guidance."}}/>}

````

## app/scene/validation/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Validation"};
export default function Page(){return <RouteView spec={{"path": "/scene/validation", "group": "Scene", "title": "Validation", "mode": "scene", "description": "Validation contracts, examples and local interaction guidance."}}/>}

````

## app/sign-in/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Sign In"};
export default function Page(){return <RouteView spec={{"path": "/sign-in", "group": "Identity", "title": "Sign In", "mode": "auth", "description": "Sign In contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/coordinates/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Coordinates"};
export default function Page(){return <RouteView spec={{"path": "/spatial/coordinates", "group": "Spatial", "title": "Coordinates", "mode": "spatial", "description": "Coordinates contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/geometry/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Geometry"};
export default function Page(){return <RouteView spec={{"path": "/spatial/geometry", "group": "Spatial", "title": "Geometry", "mode": "spatial", "description": "Geometry contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/layers/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Layers"};
export default function Page(){return <RouteView spec={{"path": "/spatial/layers", "group": "Spatial", "title": "Layers", "mode": "spatial", "description": "Layers contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/map/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Map"};
export default function Page(){return <RouteView spec={{"path": "/spatial/map", "group": "Spatial", "title": "Map", "mode": "spatial", "description": "Map contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/measurement/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Measurement"};
export default function Page(){return <RouteView spec={{"path": "/spatial/measurement", "group": "Spatial", "title": "Measurement", "mode": "spatial", "description": "Measurement contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Spatial overview"};
export default function Page(){return <RouteView spec={{"path": "/spatial", "group": "Spatial", "title": "Spatial overview", "mode": "directory", "description": "Spatial overview contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/query/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Query"};
export default function Page(){return <RouteView spec={{"path": "/spatial/query", "group": "Spatial", "title": "Query", "mode": "spatial", "description": "Query contracts, examples and local interaction guidance."}}/>}

````

## app/spatial/raster-terrain/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Raster Terrain"};
export default function Page(){return <RouteView spec={{"path": "/spatial/raster-terrain", "group": "Spatial", "title": "Raster Terrain", "mode": "spatial", "description": "Raster Terrain contracts, examples and local interaction guidance."}}/>}

````

## app/studio/assets/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Assets"};
export default function Page(){return <RouteView spec={{"path": "/studio/assets", "group": "Studio", "title": "Studio Assets", "mode": "assets", "description": "Studio Assets contracts, examples and local interaction guidance."}}/>}

````

## app/studio/audit/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Audit"};
export default function Page(){return <RouteView spec={{"path": "/studio/audit", "group": "Studio", "title": "Studio Audit", "mode": "audit", "description": "Studio Audit contracts, examples and local interaction guidance."}}/>}

````

## app/studio/components/[slug]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
const slugs=["button", "input", "textarea", "select", "checkbox", "radio", "switch", "tabs", "card", "dialog", "drawer", "accordion", "popover", "tooltip", "alert", "toast", "badge", "progress", "skeleton", "header", "sidebar", "breadcrumbs", "menu", "pagination", "command-palette", "empty-state", "error-state"];
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!slugs.includes(slug))notFound();return <RouteView spec={{path:`/studio/components/${slug}`,group:'Studio',title:slug.replaceAll('-',' '),mode:'component',description:'Interactive local example; reconstructed behavior.'}}/>}

export const dynamicParams=false;

````

## app/studio/page.tsx

````tsx
import {RouteView} from '../../components/route-view';
export const metadata={title:"Studio"};
export default function Page(){return <RouteView spec={{"path": "/studio", "group": "Studio", "title": "Studio", "mode": "directory", "description": "Studio contracts, examples and local interaction guidance."}}/>}

````

## app/studio/scenes/[sceneId]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{sceneId:string}>}){const p=await params;const id=p.sceneId;if(!["demo-scene"].includes(id))notFound();return <RouteView spec={{path:`/studio/scenes/${id}`,group:'Studio',title:id,mode:'scene',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{sceneId:'demo-scene'}]}

````

## app/studio/scenes/[sceneId]/review/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../../components/route-view';
export default async function Page({params}:{params:Promise<{sceneId:string}>}){const {sceneId}=await params;if(sceneId!=='demo-scene')notFound();return <RouteView spec={{path:'/studio/scenes/demo-scene/review',group:'Studio',title:'Scene review',mode:'workflow',description:'Illustrative review; not an approval signature.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{sceneId:'demo-scene'}]}

````

## app/studio/scenes/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Scenes"};
export default function Page(){return <RouteView spec={{"path": "/studio/scenes", "group": "Studio", "title": "Studio Scenes", "mode": "directory", "description": "Studio Scenes contracts, examples and local interaction guidance."}}/>}

````

## app/studio/settings/members/page.tsx

````tsx
import {RouteView} from '../../../../components/route-view';
export const metadata={title:"Studio Settings Members"};
export default function Page(){return <RouteView spec={{"path": "/studio/settings/members", "group": "Studio", "title": "Studio Settings Members", "mode": "members", "description": "Studio Settings Members contracts, examples and local interaction guidance."}}/>}

````

## app/studio/settings/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Settings"};
export default function Page(){return <RouteView spec={{"path": "/studio/settings", "group": "Studio", "title": "Studio Settings", "mode": "directory", "description": "Studio Settings contracts, examples and local interaction guidance."}}/>}

````

## app/studio/settings/permissions/page.tsx

````tsx
import {RouteView} from '../../../../components/route-view';
export const metadata={title:"Studio Settings Permissions"};
export default function Page(){return <RouteView spec={{"path": "/studio/settings/permissions", "group": "Studio", "title": "Studio Settings Permissions", "mode": "permissions", "description": "Studio Settings Permissions contracts, examples and local interaction guidance."}}/>}

````

## app/studio/settings/security/page.tsx

````tsx
import {RouteView} from '../../../../components/route-view';
export const metadata={title:"Studio Settings Security"};
export default function Page(){return <RouteView spec={{"path": "/studio/settings/security", "group": "Studio", "title": "Studio Settings Security", "mode": "auth", "description": "Studio Settings Security contracts, examples and local interaction guidance."}}/>}

````

## app/studio/settings/sessions/page.tsx

````tsx
import {RouteView} from '../../../../components/route-view';
export const metadata={title:"Studio Settings Sessions"};
export default function Page(){return <RouteView spec={{"path": "/studio/settings/sessions", "group": "Studio", "title": "Studio Settings Sessions", "mode": "sessions", "description": "Studio Settings Sessions contracts, examples and local interaction guidance."}}/>}

````

## app/studio/themes/[themeId]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{themeId:string}>}){const p=await params;const id=p.themeId;if(!["demo-theme"].includes(id))notFound();return <RouteView spec={{path:`/studio/themes/${id}`,group:'Studio',title:id,mode:'tokens',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{themeId:'demo-theme'}]}

````

## app/studio/themes/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Themes"};
export default function Page(){return <RouteView spec={{"path": "/studio/themes", "group": "Studio", "title": "Studio Themes", "mode": "tokens", "description": "Studio Themes contracts, examples and local interaction guidance."}}/>}

````

## app/studio/tokens/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Tokens"};
export default function Page(){return <RouteView spec={{"path": "/studio/tokens", "group": "Studio", "title": "Studio Tokens", "mode": "tokens", "description": "Studio Tokens contracts, examples and local interaction guidance."}}/>}

````

## app/studio/workspaces/[workspaceId]/page.tsx

````tsx
import {notFound} from 'next/navigation';
import {RouteView} from '../../../../components/route-view';
export default async function Page({params}:{params:Promise<{workspaceId:string}>}){const p=await params;const id=p.workspaceId;if(!["demo-workspace"].includes(id))notFound();return <RouteView spec={{path:`/studio/workspaces/${id}`,group:'Studio',title:id,mode:'members',description:'Local fixture. Unknown IDs are rejected.'}}/>}

export const dynamicParams=false;
export function generateStaticParams(){return [{workspaceId:'demo-workspace'}]}

````

## app/studio/workspaces/page.tsx

````tsx
import {RouteView} from '../../../components/route-view';
export const metadata={title:"Studio Workspaces"};
export default function Page(){return <RouteView spec={{"path": "/studio/workspaces", "group": "Studio", "title": "Studio Workspaces", "mode": "directory", "description": "Studio Workspaces contracts, examples and local interaction guidance."}}/>}

````

## components/auth-reference.css

````css
.maataa-auth{--ink:#111413;--cream:#eee7da;--lime:#d4ed6a;--gold:#c9aa72;background:var(--ink);color:var(--cream);font:16px/1.6 Arial,sans-serif}.maataa-auth *{box-sizing:border-box}.maataa-auth h1,.maataa-auth h2{font-family:Georgia,serif;font-weight:400;line-height:1.08;text-wrap:balance}.maataa-auth h1{font-size:clamp(42px,5.5vw,78px)}.maataa-auth h2{font-size:clamp(32px,3.5vw,48px)}.maataa-auth h3{font-size:19px}.maataa-auth em{color:var(--gold);font-style:normal}.maataa-auth a{color:inherit}.auth-nav,.auth-footer{padding:24px max(5vw,20px);display:flex;align-items:center;gap:24px;flex-wrap:wrap}.auth-nav nav,.auth-footer nav{display:flex;gap:22px;flex-wrap:wrap}.auth-nav nav{margin-left:auto}.wordmark{font-size:36px;font-weight:300;text-decoration:none}.auth-section,.auth-hero{padding:72px max(6vw,24px);display:grid;grid-template-columns:1fr 1.15fr;align-items:center;gap:6vw}.auth-hero{min-height:560px;background:radial-gradient(ellipse at 80% 45%,#44392355,transparent 60%)}.light{background:var(--cream);color:var(--ink)}.eyebrow{letter-spacing:.3em;font-size:11px;color:#af976e;font-weight:bold}.light .eyebrow{color:#655533}.panel{background:#181c1b;color:#eee7da;padding:28px;border:1px solid #ffffff20;border-radius:10px;min-width:0}.demo{display:inline-block;color:#d5d4c6;border:1px solid #666;border-radius:20px;padding:2px 10px;font-size:11px}.light>div>.demo{color:#4b493f}.maataa-auth button,.maataa-auth input,.maataa-auth select{font:inherit}.maataa-auth button,.maataa-auth .primary{cursor:pointer;display:inline-block;padding:10px 18px;border-radius:5px;border:1px solid #ffffff30;background:#2c302e;color:#eee;text-decoration:none}.maataa-auth .primary{background:var(--lime);color:#18200b;border:0}.maataa-auth button:disabled{opacity:.6;cursor:default}.maataa-auth label{display:block;font-size:13px;margin:16px 0}.maataa-auth input:not([type=checkbox]),.maataa-auth select{width:100%;padding:10px;background:#252927;color:#fff;border:1px solid #686b65;border-radius:5px}.maataa-auth input[type=checkbox]{accent-color:var(--lime);width:18px;height:18px}.maataa-auth .inline{display:flex;align-items:center;gap:10px}.maataa-auth :focus-visible{outline:3px solid #d4ed6a;outline-offset:4px}.light a:focus-visible{outline-color:#405600}.signin{max-width:420px;margin:auto}.signin>button{width:100%;margin-top:12px}.features{display:flex;gap:28px;list-style:none;padding:25px 0;border-top:1px solid #666}.workspace{width:100%;display:flex!important;text-align:left;justify-content:space-between;gap:16px;margin:10px 0}.workspace small{display:block}.workspace[aria-pressed=true]{border-color:var(--lime)}.table-scroll{overflow-x:auto}.maataa-auth table{border-collapse:collapse;width:100%;font-size:12px;min-width:390px}.maataa-auth th,.maataa-auth td{text-align:left;padding:12px 8px;border-bottom:1px solid #ffffff18}.maataa-auth td button{padding:5px;font-size:11px}.faq{padding:60px max(6vw,24px)}.faq details{padding:16px 0;border-bottom:1px solid #666}.faq summary{cursor:pointer}.orbit-art{position:relative;min-height:350px;isolation:isolate}.planet{position:absolute;width:70%;aspect-ratio:1;left:10%;top:5%;border-radius:50%;background:radial-gradient(circle at 28% 20%,#a99c7e,#343832 32%,#080a09 68%);box-shadow:inset -8px -3px 18px #cbac72,0 0 60px #b08d3e22}.orbit-ring{position:absolute;inset:15% 0 20%;border:2px solid #c9aa72;border-radius:50%;transform:rotate(-28deg);z-index:2}.satellite{position:absolute;width:25%;aspect-ratio:1;right:0;bottom:8%;border-radius:50%;background:radial-gradient(circle at 30% 20%,#e8d4a4,#8e6933 40%,#19180e 80%);z-index:3}.auth-footer{border-top:1px solid #555;font-size:12px}@media(max-width:760px){.auth-section,.auth-hero{grid-template-columns:1fr;gap:32px;padding:44px 22px}.auth-nav nav{margin:0;gap:14px;font-size:13px}.orbit-art{min-height:290px;max-width:420px;width:100%;margin:auto}.panel{padding:18px}.features{gap:18px}.auth-footer{display:block}.auth-footer nav{margin-top:20px}}@media(prefers-reduced-motion:reduce){.maataa-auth *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}

````

## components/auth-reference.tsx

````tsx
'use client';
import {useState, type ReactNode} from 'react';
import './auth-reference.css';
export const workspaces=[{name:'Platform',description:'Core team workspace',members:12},{name:'Research',description:'Exploration and R&D',members:8},{name:'Customer Alpha',description:'Customer environment (illustrative)',members:6},{name:'Agent Lab',description:'Tests and experiments',members:4}];
export const roles=['Viewer','Operator','Editor','Admin'];
export const resources=['Workspaces','People','Agents','Data','Integrations','Audit logs'];
export const permissions=[[true,false,false,true],[false,true,false,true],[false,false,true,true],[false,false,true,true],[false,true,false,true],[true,false,false,true]];
export const sessions=[{identity:'Alex Chen',workspace:'Platform',location:'Singapore',started:'2h ago'},{identity:'Research Agent',workspace:'Research',location:'API',started:'5h ago'},{identity:'Taylor Kim',workspace:'Customer Alpha',location:'London',started:'1d ago'},{identity:'Build Agent',workspace:'Agent Lab',location:'API',started:'3h ago'}];
export const auditEvents=[{time:'Oct 26, 10:14',identity:'Alex Chen',action:'Signed in',details:'from Singapore'},{time:'Oct 26, 09:52',identity:'Build Agent',action:'Accessed data',details:'project/research'},{time:'Oct 26, 08:23',identity:'Taylor Kim',action:'Updated permissions',details:'Customer Alpha'},{time:'Oct 25, 16:11',identity:'Research Agent',action:'Created workspace',details:'Research'},{time:'Oct 25, 14:37',identity:'Alex Chen',action:'Signed out',details:'Platform'}];
export function DemoBadge(){return <small className="demo">Illustrative · local demo</small>}
export function AuthSection({id,eyebrow,title,description,children,light=false}: {id:string;eyebrow:string;title:string;description:string;children:ReactNode;light?:boolean}){return <section id={id} className={`auth-section ${light?'light':''}`}><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p><DemoBadge/></div><div>{children}</div></section>}
export function AuthNavigation(){return <header className="auth-nav"><a href="#hero" className="wordmark">allb</a><nav aria-label="Page navigation"><a href="#workspaces">Workspaces</a><a href="#permissions">Permissions</a><a href="#audit">Audit</a><a href="#signin">Sign in demo</a></nav></header>}
export function OrbitArtwork(){return <div className="orbit-art" role="img" aria-label="Schematic gold orbital spheres; reconstructed artwork"><div className="orbit-ring"/><div className="planet"/><div className="satellite"/></div>}
export function AuthHero(){return <section id="hero" className="auth-hero"><div><p className="eyebrow">MAATAA AUTH</p><h1>Identity with<br/><em>explicit authority</em></h1><p>People, agents and systems in the ALLB ecosystem.</p><p>Reference design reconstruction. No authentication service connected.</p><a className="primary" href="#signin">Explore sign-in demo →</a><ul className="features"><li>Identity</li><li>Authority</li><li>Visibility</li></ul></div><OrbitArtwork/></section>}
export function SignInForm(){const [show,setShow]=useState(false);const [message,setMessage]=useState('');return <form className="panel signin" onSubmit={e=>{e.preventDefault();setMessage('Local validation complete. No credentials sent, no session created.')}}><span className="wordmark">allb</span><h3>Sign in to MAATAA Auth</h3><DemoBadge/><label>Email or identifier<input name="identifier" required autoComplete="off" placeholder="Use a fictional identifier"/></label><label>Demo password<input name="password" type={show?'text':'password'} required minLength={8} autoComplete="off" placeholder="Fictional value only"/></label><label className="inline"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/>Show demo password</label><label className="inline"><input type="checkbox"/>Keep me signed in (demo only)</label><button className="primary" type="submit">Validate locally →</button><button type="button" onClick={()=>setMessage('Passkey illustration only. No WebAuthn request is made.')}>Explore passkey concept</button><p role="status">{message}</p></form>}
export function SignInSection(){return <AuthSection id="signin" eyebrow="SIGN IN" title="A single identity across ALLB" description="Concepts for people, agents and systems, multi-factor authentication, and session-aware access." light><SignInForm/></AuthSection>}
export function WorkspaceBrowser(){const [selected,setSelected]=useState('Platform');return <div className="panel"><h3>Workspaces</h3>{workspaces.map(w=><button key={w.name} className="workspace" aria-pressed={selected===w.name} onClick={()=>setSelected(w.name)}><span><b>{w.name}</b><small>{w.description}</small></span><span>{w.members} members</span></button>)}<p role="status">Selected locally: {selected}</p></div>}
export function WorkspacesSection(){return <AuthSection id="workspaces" eyebrow="WORKSPACES" title="Organize access for real work" description="Create focused spaces for teams, projects, agents and customer environments."><WorkspaceBrowser/></AuthSection>}
export function PermissionsMatrix(){const [values,setValues]=useState(permissions.map(row=>[...row]));return <div className="panel"><h3>Permissions matrix</h3><DemoBadge/><div className="table-scroll"><table><thead><tr><th scope="col">Resource</th>{roles.map(r=><th scope="col" key={r}>{r}</th>)}</tr></thead><tbody>{resources.map((r,i)=><tr key={r}><th scope="row">{r}</th>{roles.map((role,j)=><td key={role}><input type="checkbox" aria-label={`${role}: ${r} (local demo)`} checked={values[i][j]} onChange={()=>setValues(old=>old.map((row,k)=>k===i?row.map((v,l)=>l===j?!v:v):row))}/></td>)}</tr>)}</tbody></table></div><button onClick={()=>setValues(permissions.map(row=>[...row]))}>Reset matrix</button><p>Edits do not grant real access.</p></div>}
export function PermissionsSection(){return <AuthSection id="permissions" eyebrow="PERMISSIONS" title="Explicit, granular authority" description="Illustrative roles and resource permissions. This matrix is not a security policy." light><PermissionsMatrix/></AuthSection>}
export function ActiveSessionsTable(){const [revoked,setRevoked]=useState<string[]>([]);return <div className="panel"><h3>Active sessions</h3><DemoBadge/><div className="table-scroll"><table><thead><tr>{['Identity','Workspace','Location','Started','Actions'].map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{sessions.map(s=><tr key={s.identity}><th scope="row">{s.identity}</th><td>{s.workspace}</td><td>{s.location}</td><td>{s.started}</td><td><button disabled={revoked.includes(s.identity)} onClick={()=>setRevoked(old=>[...old,s.identity])}>{revoked.includes(s.identity)?'Revoked locally':'Revoke demo'}</button></td></tr>)}</tbody></table></div><button onClick={()=>setRevoked([])}>Reset sessions</button><p role="status">{revoked.length} simulated revocations. No real sessions affected.</p></div>}
export function SessionsSection(){return <AuthSection id="sessions" eyebrow="SESSIONS" title="See and control active sessions" description="Illustrative identity, workspace and location records. Revocations are reversible local state."><ActiveSessionsTable/></AuthSection>}
export function AuditLogTable(){const [query,setQuery]=useState('');const [workspace,setWorkspace]=useState('All');const rows=auditEvents.filter(e=>Object.values(e).join(' ').toLowerCase().includes(query.toLowerCase())&&(workspace==='All'||e.details===workspace));return <div className="panel"><h3>Audit log</h3><label>Workspace<select value={workspace} onChange={e=>setWorkspace(e.target.value)}>{['All',...workspaces.map(w=>w.name)].map(w=><option key={w}>{w}</option>)}</select></label><label>Search events<input value={query} onChange={e=>setQuery(e.target.value)} type="search"/></label><div className="table-scroll"><table><thead><tr>{['Time','Identity','Action','Details'].map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(e=><tr key={e.time}><td>{e.time}</td><th scope="row">{e.identity}</th><td>{e.action}</td><td>{e.details}</td></tr>)}</tbody></table></div><p role="status">{rows.length} illustrative records. Workspace filter matches explicit workspace names only; project paths have no inferred workspace mapping.</p></div>}
export function AuditSection(){return <AuthSection id="audit" eyebrow="AUDIT" title="Complete, traceable history" description="Screenshot-derived sample events, not observed telemetry. Dates and identities are illustrative." light><AuditLogTable/></AuthSection>}
export function AuthFAQ(){return <section id="faq" className="faq"><p className="eyebrow">QUESTIONS</p><h2>Questions about MAATAA Auth?</h2>{[['Is sign-in connected?','No. Inputs are validated locally and are never sent to a server.'],['Do permissions change real access?','No. Checkbox changes exist only in component memory.'],['What came from the image?','Section order, headings, tables and approximate palette. Responsive layout and interactive behavior are new design decisions.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
export function AuthCTA(){return <section className="auth-section light"><div><p className="eyebrow">GET STARTED</p><h2>Build with trusted identity today</h2><p>Explore the reference as a local, reversible UI demo.</p><a href="#signin" className="primary">Explore demo →</a></div><OrbitArtwork/></section>}
export function AuthFooter(){return <footer className="auth-footer"><span className="wordmark">allb</span><p>MAATAA Auth · reconstructed concept · no backend integration</p><nav aria-label="Footer"><a href="#hero">Top</a><a href="#faq">FAQs</a><a href="#audit">Audit demo</a></nav></footer>}
export default function MaataaAuth(){return <main className="maataa-auth"><AuthNavigation/><AuthHero/><SignInSection/><WorkspacesSection/><PermissionsSection/><SessionsSection/><AuditSection/><AuthFAQ/><AuthCTA/><AuthFooter/></main>}

````

## components/playground.tsx

````tsx
'use client';
import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import routes from '../lib/routes.json';
import {componentSlugs,patterns,exampleSlugs} from '../lib/catalog';
import type {RouteSpec} from '../lib/contracts';
import {SceneEditor} from './scene-editor';
import {SpatialEditor} from './spatial-editor';
import {SignInForm,PermissionsMatrix,ActiveSessionsTable,AuditLogTable,WorkspaceBrowser} from './auth-reference';
const rows=[{id:'a1',name:'Stage platform',family:'Production',quantity:1,rate:12000},{id:'a2',name:'Dining table',family:'Furniture',quantity:8,rate:1500},{id:'a3',name:'Spotlight',family:'Lighting',quantity:6,rate:2200}];
export function Playground({spec}:{spec:RouteSpec}){
 const mode=spec.mode;
 if(mode==='directory')return <Directory spec={spec}/>;
 if(mode==='tokens')return <TokenEditor/>;
 if(mode==='form')return <FormDemo kind={spec.path.split('/').pop()||'form'}/>;
 if(mode==='data')return <DataDemo kind={spec.path.split('/').pop()||'tables'}/>;
 if(mode==='scene')return <SceneEditor/>;
 if(mode==='spatial')return <SpatialEditor/>;
 if(mode==='auth')return <IdentityDemo kind={spec.path.split('/').pop()||'sign-in'}/>;
 if(mode==='permissions')return <div className="maataa-auth"><PermissionsMatrix/></div>;
 if(mode==='sessions')return <div className="maataa-auth"><ActiveSessionsTable/></div>;
 if(mode==='audit')return <div className="maataa-auth"><AuditLogTable/></div>;
 if(mode==='members')return <MembersDemo/>;
 if(mode==='assets')return <AssetDemo/>;
 if(mode==='workflow')return <WorkflowDemo/>;
 if(mode==='component')return <ComponentDemo kind={spec.path.split('/').pop()||'button'}/>;
 if(mode==='code')return <CodeDemo/>;
 if(mode==='readiness')return <Readiness/>;
 return <DocsDemo spec={spec}/>;
}
function Directory({spec}:{spec:RouteSpec}){const [query,setQuery]=useState('');const [group,setGroup]=useState('All');let links: {path:string;title:string;group:string}[]=routes;
 if(spec.path==='/components')links=componentSlugs.map(slug=>({path:'/components/'+slug,title:slug,group:'Components'}));
 else if(spec.path==='/examples')links=exampleSlugs.map(slug=>({path:'/examples/'+slug,title:slug,group:'Examples'}));
 else if(spec.path.startsWith('/studio'))links=[...routes.filter(r=>r.path.startsWith('/studio')),...[{path:'/studio/workspaces/demo-workspace',title:'Demo workspace',group:'Studio'},{path:'/studio/themes/demo-theme',title:'Demo theme',group:'Studio'},{path:'/studio/scenes/demo-scene',title:'Demo scene',group:'Studio'},{path:'/studio/scenes/demo-scene/review',title:'Demo scene review',group:'Studio'}]];
 else if(spec.path==='/3d'||spec.path==='/spatial')links=routes.filter(r=>r.path.startsWith(spec.path+'/'));
 const filtered=links.filter(r=>(group==='All'||group===r.group)&&`${r.title} ${r.path}`.toLowerCase().includes(query.toLowerCase()));return <section><h2>Explore routes</h2><div className="controls"><label>Search<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Family<select value={group} onChange={e=>setGroup(e.target.value)}>{['All',...new Set(links.map(r=>r.group))].map(g=><option key={g}>{g}</option>)}</select></label></div><p role="status">{filtered.length} routes</p><div className="cards">{filtered.map(r=><Link className="card" key={r.path} href={r.path}><small>{r.group}</small><h3>{r.title}</h3><code>{r.path}</code></Link>)}</div>{!filtered.length&&<button onClick={()=>{setQuery('');setGroup('All')}}>Clear filters</button>}</section>}
function TokenEditor(){const [color,setColor]=useState('#d3ec75');const [radius,setRadius]=useState(12);const [light,setLight]=useState(false);return <section><h2>Theme playground</h2><div className="controls"><label>Accent<input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label><label>Radius {radius}px<input type="range" min="0" max="32" value={radius} onChange={e=>setRadius(+e.target.value)}/></label><label><input type="checkbox" checked={light} onChange={e=>setLight(e.target.checked)}/>Light preview</label></div><div className="panel" style={{background:light?'#f0eadf':'#1b211f',color:light?'#1b211f':'#f0eadf',borderRadius:radius}}><h3>Shared semantic tokens</h3><span style={{background:color,color:'#101510',padding:12,borderRadius:radius}}>Accent sample</span><p>Custom colors are not automatically contrast compliant.</p></div><CodeBlock code={JSON.stringify({accent:color,radius,mode:light?'light':'dark'},null,2)}/><button onClick={()=>{setColor('#d3ec75');setRadius(12);setLight(false)}}>Reset theme</button></section>}
function FormDemo({kind}:{kind:string}){const [step,setStep]=useState(1);const [result,setResult]=useState('');if(kind==='file-upload')return <AssetDemo/>;return <section><h2>{kind} example</h2><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);setResult(JSON.stringify({name:fd.get('name'),email:fd.get('email'),consent:fd.get('consent')==='on',status:'local preview'},null,2))}}><label>Fictional name<input name="name" required minLength={2}/></label><label>Demo email<input name="email" type="email" required placeholder="person@example.test"/></label>{kind==='multi-step'&&<><p>Step {step} of 2</p><button type="button" onClick={()=>setStep(step===1?2:1)}>{step===1?'Show preferences':'Back to details'}</button></>}{(kind!=='multi-step'||step===2)&&<label><input name="consent" type="checkbox" required/>I understand this is a local demo</label>}<button type="submit">Validate and preview</button><button type="reset" onClick={()=>{setResult('');setStep(1)}}>Reset</button></form><pre role="status">{result}</pre></section>}
function DataDemo({kind}:{kind:string}){const [q,setQ]=useState('');const [family,setFamily]=useState('All');const [ascending,setAscending]=useState(true);const filtered=rows.filter(r=>r.name.toLowerCase().includes(q.toLowerCase())&&(family==='All'||r.family===family)).sort((a,b)=>ascending?a.quantity-b.quantity:b.quantity-a.quantity);if(kind==='code-viewer')return <CodeDemo/>;return <section><h2>Illustrative {kind}</h2><div className="controls"><label>Search<input value={q} onChange={e=>setQ(e.target.value)}/></label><label>Family<select value={family} onChange={e=>setFamily(e.target.value)}>{['All',...new Set(rows.map(r=>r.family))].map(f=><option key={f}>{f}</option>)}</select></label><button onClick={()=>setAscending(!ascending)}>Quantity: {ascending?'ascending':'descending'}</button></div>{kind==='charts'?<div>{filtered.map(r=><div key={r.id}><span>{r.name}: {r.quantity}</span><div className="bar" style={{width:`${r.quantity*10}%`}}/></div>)}</div>:kind==='tree'?<ul>{filtered.map(r=><li key={r.id}><details><summary>{r.family} / {r.name}</summary><p>Quantity: {r.quantity}; fixture ID: {r.id}</p></details></li>)}</ul>:kind==='timeline'?<ol>{filtered.map((r,i)=><li key={r.id}><button onClick={()=>setQ(r.name)}>Demo milestone {i+1}: {r.name}</button></li>)}</ol>:<div className="scroll"><table><thead><tr><th scope="col">Item</th><th scope="col">Family</th><th scope="col">Quantity</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><th scope="row">{r.name}</th><td>{r.family}</td><td>{r.quantity}</td></tr>)}</tbody></table></div>}<p role="status">{filtered.length} illustrative records</p><button onClick={()=>{setQ('');setFamily('All')}}>Clear filters</button></section>}
function IdentityDemo({kind}:{kind:string}){const [status,setStatus]=useState('');if(kind==='permissions')return <div className="maataa-auth"><PermissionsMatrix/></div>;if(kind==='sessions')return <div className="maataa-auth"><ActiveSessionsTable/></div>;if(kind==='workspace-switcher')return <div className="maataa-auth"><WorkspaceBrowser/></div>;if(kind==='invitation'||kind==='demo-invite')return <MembersDemo/>;if(kind==='callback')return <section><h2>Identity provider disconnected</h2><p>No authorization code is exchanged, no token is accepted, and no session is created.</p><Link href="/sign-in">Open sign-in demo</Link></section>;if(kind!=='mfa'&&kind!=='recovery'&&kind!=='security')return <div className="maataa-auth"><SignInForm/></div>;return <section><h2>{kind} simulation</h2><p>No factor is verified. Enter fictional six-digit input to test form behavior.</p><form onSubmit={e=>{e.preventDefault();setStatus('Format accepted locally. MFA NOT verified; no access granted.')}}><label>Illustrative code<input inputMode="numeric" pattern="[0-9]{6}" required maxLength={6} autoComplete="off"/></label><button>Preview validation</button><button type="reset" onClick={()=>setStatus('')}>Reset</button></form><p role="status">{status}</p></section>}
function MembersDemo(){const [members,setMembers]=useState(['Producer · owner','Client · viewer']);const [status,setStatus]=useState('');return <section><h2>Workspace members · fixture</h2><ul>{members.map((m,i)=><li key={i}>{m} <button onClick={()=>setMembers(old=>old.filter((_,j)=>i!==j))}>Remove locally</button></li>)}</ul><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);setMembers(old=>[...old,`${String(fd.get('email'))} · ${String(fd.get('role'))}`]);setStatus('Member added to local list. No invitation sent.');e.currentTarget.reset()}}><label>Fictional email<input name="email" type="email" required/></label><label>Role<select name="role"><option>viewer</option><option>editor</option></select></label><button>Add locally</button></form><button onClick={()=>setMembers(['Producer · owner','Client · viewer'])}>Reset members</button><p role="status">{status}</p><Link href="/invitations/demo-invite">Open invitation fixture</Link></section>}
function AssetDemo(){const [files,setFiles]=useState<{name:string;size:number;type:string}[]>([]);return <section><h2>Local asset metadata</h2><label>Select files<input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files||[]).map(f=>({name:f.name,size:f.size,type:f.type||'unknown'})))}/></label><p>No upload, model parsing or conversion occurs.</p><ul>{files.map((f,i)=><li key={i}>{f.name} — {f.size} bytes — {f.type}</li>)}</ul><button onClick={()=>setFiles([])}>Clear metadata</button></section>}
function WorkflowDemo(){const [step,setStep]=useState(0);const [quantity,setQuantity]=useState(8);const [revision,setRevision]=useState(0);const [reviewed,setReviewed]=useState<number|null>(null);const steps=['Brief','Scene','Quote','Review','Handoff'];const data={kind:'illustrative-handoff',revision,quantity,unitRate:1500,currency:'INR',total:quantity*1500,reviewedRevision:reviewed};return <section><h2>Production workflow · local simulation</h2><div role="tablist" aria-label="Workflow">{steps.map((s,i)=><button key={s} role="tab" id={`step-${i}`} aria-controls="workflow-panel" aria-selected={step===i} tabIndex={step===i?0:-1} onClick={()=>setStep(i)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(step+(e.key==='ArrowRight'?1:-1)+steps.length)%steps.length;setStep(next);document.getElementById(`step-${next}`)?.focus()}}}>{s}</button>)}</div><div id="workflow-panel" role="tabpanel" aria-labelledby={`step-${step}`}><h3>{steps[step]}</h3><label>Table quantity<input type="range" min="1" max="20" value={quantity} onChange={e=>{setQuantity(+e.target.value);setRevision(r=>r+1);setReviewed(null)}}/></label><p>{quantity} × illustrative INR 1,500 = INR {quantity*1500}. Taxes, vendors and availability excluded.</p>{step===3&&<button onClick={()=>setReviewed(revision)}>Mark this demo revision reviewed</button>}{step===4&&<button disabled={reviewed!==revision} onClick={()=>download('demo-handoff.json',data)}>Download reviewed local handoff</button>}<p role="status">Revision {revision}; {reviewed===revision?'reviewed locally':'review required'}</p></div><button onClick={()=>{setQuantity(8);setRevision(0);setReviewed(null);setStep(0)}}>Reset workflow</button></section>}
export function download(name:string,value:unknown){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function CodeBlock({code}:{code:string}){const [status,setStatus]=useState('');return <div><pre><code>{code}</code></pre><button onClick={async()=>{try{await navigator.clipboard.writeText(code);setStatus('Copied')}catch{setStatus('Clipboard unavailable; select and copy the code manually.')}}}>Copy code</button><p role="status">{status}</p></div>}
function CodeDemo(){const [tab,setTab]=useState('React');const examples:Record<string,string>={React:'<Button onClick={() => setOpen(true)}>Open</Button>',Contract:'type Action = { resourceId: string; action: "read" | "update" };',Server:'// Server must validate identity, tenant membership and authorization.\n// No backend is implemented in this scaffold.'};return <section><h2>Integration examples</h2><label>Example<select value={tab} onChange={e=>setTab(e.target.value)}>{Object.keys(examples).map(t=><option key={t}>{t}</option>)}</select></label><CodeBlock code={examples[tab]}/></section>}
function Readiness(){const [q,setQ]=useState('');return <section><h2>Readiness evidence</h2><label>Filter<input value={q} onChange={e=>setQ(e.target.value)}/></label><div className="scroll"><table><thead><tr><th scope="col">Capability</th><th scope="col">Status</th></tr></thead><tbody>{['UI routes','Spatial schematic','3D schematic','MFA','Tenant isolation','Server persistence','Browser qualification'].filter(s=>s.toLowerCase().includes(q.toLowerCase())).map(s=><tr key={s}><th scope="row">{s}</th><td>{s==='UI routes'?'Generated source':s.includes('schematic')?'Local demo':'Not implemented / untested'}</td></tr>)}</tbody></table></div></section>}
function DocsDemo({spec}:{spec:RouteSpec}){return <section><h2>{spec.title} guide</h2><p>Use the route catalogue to inspect local examples and implementation boundaries.</p><Link href="/components">Component directory</Link><CodeBlock code={'npm install\nnpm run dev\nnpm run typecheck\nnpm run build\nnpm run validate:routes'}/></section>}
function ComponentDemo({kind}:{kind:string}){const [value,setValue]=useState('');const [checked,setChecked]=useState(false);const [active,setActive]=useState(0);const [open,setOpen]=useState(false);const [count,setCount]=useState(0);const [toast,setToast]=useState('');const style:CSSProperties={padding:20};let demo;
 if(['input','textarea','select'].includes(kind))demo=<label>Example {kind}{kind==='textarea'?<textarea value={value} onChange={e=>setValue(e.target.value)}/>:kind==='select'?<select value={value} onChange={e=>setValue(e.target.value)}><option value="">Choose</option><option>Producer</option><option>Client</option></select>:<input value={value} onChange={e=>setValue(e.target.value)}/>}<p role="status">Current value: {value||'empty'}</p></label>;
 else if(['checkbox','switch','radio'].includes(kind))demo=kind==='radio'?<fieldset><legend>Role</legend>{['Producer','Client'].map(r=><label key={r}><input name="demo-role" type="radio" checked={value===r} onChange={()=>setValue(r)}/>{r}</label>)}</fieldset>:<label><input type="checkbox" role={kind==='switch'?'switch':undefined} checked={checked} onChange={e=>setChecked(e.target.checked)}/>Enable local preview</label>;
 else if(kind==='tabs')demo=<><div role="tablist" aria-label="Example tabs">{['Overview','Props','Example'].map((t,i)=><button id={`tab-${i}`} key={t} role="tab" aria-controls={`panel-${i}`} tabIndex={active===i?0:-1} aria-selected={active===i} onClick={()=>setActive(i)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(active+(e.key==='ArrowRight'?1:-1)+3)%3;setActive(n);document.getElementById(`tab-${n}`)?.focus()}}}>{t}</button>)}</div><div id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`}>Selected panel: {['Overview','Props','Example'][active]}</div></>;
 else if(['dialog','drawer'].includes(kind))demo=<><button onClick={()=>{const d=document.getElementById('demo-dialog') as HTMLDialogElement|null;d?.showModal()}}>Open {kind}</button><dialog id="demo-dialog" className={kind==='drawer'?'drawer':''}><h3>Local {kind}</h3><p>Native dialog handles modal focus and Escape.</p><form method="dialog"><button>Close</button></form></dialog></>;
 else if(['accordion','popover','menu','command-palette','tooltip'].includes(kind))demo=<details><summary>{kind==='tooltip'?'Show help':`Open ${kind}`}</summary><p>This uses a disclosure pattern, not a fully implemented ARIA {kind} primitive.</p><Link href="/components">Browse components</Link></details>;
 else if(kind==='pagination')demo=<><button disabled={count===0} onClick={()=>setCount(Math.max(0,count-1))}>Previous</button><span>Page {count+1} of 3</span><button disabled={count===2} onClick={()=>setCount(Math.min(2,count+1))}>Next</button></>;
 else if(kind==='progress')demo=<label>Progress: {count}%<progress max={100} value={count}/><input type="range" min={0} max={100} value={count} onChange={e=>setCount(+e.target.value)}/></label>;
 else if(kind==='toast')demo=<><button onClick={()=>setToast('Local notification')}>Notify</button><p role="status">{toast}</p><button onClick={()=>setToast('')}>Dismiss</button></>;
 else if(kind==='alert'||kind==='error-state')demo=<div role="alert">Illustrative {kind}: no request has failed.<button onClick={()=>setToast('Retry simulated')}>Simulate retry</button><span role="status">{toast}</span></div>;
 else if(kind==='empty-state')demo=<><p>No local items.</p><button onClick={()=>setCount(count+1)}>Add sample item</button><p>{count} sample items</p></>;
 else if(kind==='skeleton')demo=<><label><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>Show loading state</label>{checked?<div className="skeleton" aria-label="Illustrative loading placeholder"/>:<p>Loaded sample content</p>}</>;
 else if(kind==='badge')demo=<span className="badge">Local demo</span>;
 else if(['header','sidebar','breadcrumbs'].includes(kind))demo=<nav aria-label={`${kind} example`}><Link href="/">Home</Link> / <Link href="/components">Components</Link> / <span aria-current="page">{kind}</span></nav>;
 else if(kind==='card')demo=<article className="card"><h3>Production workspace</h3><p>Sample card composition.</p><Link href="/examples/production">Explore local example</Link></article>;
 else demo=<><button onClick={()=>setCount(count+1)}>Increment locally</button><button disabled>Disabled</button><p role="status">Clicked {count} times</p></>;
 return <section><h2>{kind} playground</h2><div className="panel" style={style}>{demo}</div><button onClick={()=>{setValue('');setChecked(false);setActive(0);setCount(0);setOpen(false);setToast('')}}>Reset example</button><Link href={`/playground/${kind}`}>Direct playground route</Link></section>}

````

## components/route-view.tsx

````tsx
import routes from '../lib/routes.json';
import {guidance} from '../lib/guides';
import type {RouteSpec} from '../lib/contracts';
import {Playground} from './playground';
export function RouteView({spec}:{spec:RouteSpec}){return <main><p className="eyebrow">{spec.group} / local scaffold</p><h1>{spec.title}</h1><p className="lead">{spec.description}</p><p className="notice">Documentation and illustrative local state. No real authentication, storage or telemetry.</p><Playground spec={spec}/><section><h2>Implementation boundaries</h2><ul>{(guidance[spec.group]||guidance.Components).map(item=><li key={item}>{item}</li>)}</ul></section><details><summary>Route contract</summary><pre>{JSON.stringify(spec,null,2)}</pre></details></main>}
export function lookup(path:string){return routes.find(r=>r.path===path)}

````

## components/scene-editor.tsx

````tsx
'use client';
import {useState} from 'react';
import {sceneFixture,type SceneDocument,type SceneNode} from '../lib/contracts';
function clone():SceneDocument{return JSON.parse(JSON.stringify(sceneFixture)) as SceneDocument}
export function SceneEditor(){const [doc,setDoc]=useState<SceneDocument>(clone);const [past,setPast]=useState<SceneDocument[]>([]);const [future,setFuture]=useState<SceneDocument[]>([]);const [selected,setSelected]=useState('stage');const [view,setView]=useState('3D');const [yaw,setYaw]=useState(35);const [zoom,setZoom]=useState(30);const [review,setReview]=useState<number|null>(null);const node=doc.nodes.find(n=>n.id===selected)||doc.nodes[0];
function edit(fn:(d:SceneDocument)=>SceneDocument){setPast(p=>[...p,doc]);setFuture([]);setDoc(d=>({...fn(d),revision:d.revision+1}));setReview(null)}
function update(change:Partial<SceneNode>){edit(d=>({...d,nodes:d.nodes.map(n=>n.id===node.id?{...n,...change}:n)}))}
function undo(){if(!past.length)return;setFuture(f=>[doc,...f]);setDoc(past[past.length-1]);setPast(p=>p.slice(0,-1));setReview(null)}
function redo(){if(!future.length)return;setPast(p=>[...p,doc]);setDoc(future[0]);setFuture(f=>f.slice(1));setReview(null)}
const a=yaw*Math.PI/180;
function project(x:number,y:number,z:number){if(view==='2D')return [320+x*zoom,200+z*zoom];return [320+(x*Math.cos(a)-z*Math.sin(a))*zoom,240-y*zoom+(x*Math.sin(a)+z*Math.cos(a))*zoom*.35]}
const issues=doc.nodes.filter(n=>n.scale.some(v=>v<=0)||n.position.some(v=>!Number.isFinite(v)));
return <section><h2>Shared scene editor</h2><p>Local meters · Y-up · software-projected schematic. No WebGL or geographic adapter.</p><div className="controls"><label>View<select value={view} onChange={e=>setView(e.target.value)}><option>3D</option><option>2D</option></select></label><label>Yaw {yaw}°<input type="range" min="0" max="360" value={yaw} onChange={e=>setYaw(+e.target.value)}/></label><label>Zoom<input type="range" min="15" max="55" value={zoom} onChange={e=>setZoom(+e.target.value)}/></label></div><svg className="scene" viewBox="0 0 640 400" role="img" aria-label={`${view} schematic of the shared scene`}><rect width="640" height="400" fill="#111b1b"/>{Array.from({length:11},(_,i)=>i-5).map(i=>{const p=project(i,0,-5),q=project(i,0,5),r=project(-5,0,i),s=project(5,0,i);return <g key={i} stroke="#354844"><line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]}/><line x1={r[0]} y1={r[1]} x2={s[0]} y2={s[1]}/></g>})}{doc.nodes.filter(n=>n.visible).map(n=>{const [x,y,z]=n.position,[sx,sy,sz]=n.scale;const points=[[-sx/2,0,-sz/2],[sx/2,0,-sz/2],[sx/2,0,sz/2],[-sx/2,0,sz/2]].map(([dx,dy,dz])=>{const theta=n.rotation[1]*Math.PI/180;return project(x+dx*Math.cos(theta)-dz*Math.sin(theta),y+(view==='3D'?sy:0)+dy,z+dx*Math.sin(theta)+dz*Math.cos(theta)).join(',')}).join(' ');const p=project(x,y+sy,z);return <g key={n.id}><polygon points={points} fill={n.color} stroke={selected===n.id?'#fff':'#666'} strokeWidth={selected===n.id?3:1}/><text x={p[0]} y={p[1]-12} fill="#fff" textAnchor="middle">{n.name}</text></g>})}</svg><div className="controls"><label>Scene object<select value={selected} onChange={e=>setSelected(e.target.value)}>{doc.nodes.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}</select></label><label>Visible<input type="checkbox" checked={node.visible} onChange={e=>update({visible:e.target.checked})}/></label><label>Material color<input type="color" value={node.color} onChange={e=>update({color:e.target.value})}/></label></div><fieldset><legend>{node.name} transform · m / degrees</legend>{(['position','scale'] as const).map(prop=><div className="controls" key={prop}>{['X','Y','Z'].map((axis,i)=><label key={axis}>{prop} {axis}<input type="number" step="0.5" min={prop==='scale'?0.5:undefined} value={node[prop][i]} onChange={e=>{const v=Number(e.target.value);if(!Number.isFinite(v)||(prop==='scale'&&v<=0))return;const next=[...node[prop]] as [number,number,number];next[i]=v;update({[prop]:next})}}/></label>)}</div>)}<label>Y rotation<input type="range" min="0" max="360" value={node.rotation[1]} onChange={e=>update({rotation:[0,+e.target.value,0]})}/></label></fieldset><div className="controls"><button disabled={!past.length} onClick={undo}>Undo</button><button disabled={!future.length} onClick={redo}>Redo</button><button onClick={()=>{setDoc(clone());setPast([]);setFuture([]);setReview(null)}}>Reset scene</button><button onClick={()=>setReview(doc.revision)}>Review local revision</button></div><p role="status">Revision {doc.revision}; {issues.length} structural issues; {review===doc.revision?'reviewed locally':'not reviewed'}. This does not validate production safety.</p><details><summary>Scene document</summary><pre>{JSON.stringify(doc,null,2)}</pre></details></section>}

````

## components/spatial-editor.tsx

````tsx
'use client';
import {useState} from 'react';
type Point={x:number;y:number};
export function SpatialEditor(){const [points,setPoints]=useState<Point[]>([{x:0,y:0},{x:4,y:3}]);const [grid,setGrid]=useState(true);const [geometry,setGeometry]=useState(true);const [query,setQuery]=useState('');const [x,setX]=useState(2);const [y,setY]=useState(2);const [scale,setScale]=useState(30);const [height,setHeight]=useState(0);const distance=points.length>=2?Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y):null;const visible=points.map((p,i)=>({...p,id:i})).filter(p=>`point ${p.id} ${p.x} ${p.y}`.includes(query.toLowerCase()));return <section><h2>Local spatial playground</h2><p>Planar meters; no basemap, geographic CRS, DEM or geodesic calculation.</p><div className="controls"><label><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/>Grid layer</label><label><input type="checkbox" checked={geometry} onChange={e=>setGeometry(e.target.checked)}/>Geometry layer</label><label>Zoom<input type="range" min="15" max="40" value={scale} onChange={e=>setScale(+e.target.value)}/></label><label>Illustrative elevation<input type="range" min="0" max="20" value={height} onChange={e=>setHeight(+e.target.value)}/></label></div><svg className="scene" viewBox="0 0 640 400" role="img" aria-label="Local coordinate grid and sample points"><rect width="640" height="400" fill="#101c1d"/>{grid&&Array.from({length:21},(_,i)=>i-10).map(i=><g key={i} stroke="#354846"><line x1={320+i*scale} y1="0" x2={320+i*scale} y2="400"/><line x1="0" y1={200+i*scale} x2="640" y2={200+i*scale}/></g>)}{geometry&&<><polyline points={points.map(p=>`${320+p.x*scale},${200-p.y*scale}`).join(' ')} fill="none" stroke="#c4dc79" strokeWidth="2"/>{visible.map(p=><g key={p.id}><circle cx={320+p.x*scale} cy={200-p.y*scale} r="6" fill="#d3ec75"/><text x={330+p.x*scale} y={190-p.y*scale} fill="#fff">P{p.id}</text></g>)}</>}</svg><form onSubmit={e=>{e.preventDefault();if(Number.isFinite(x)&&Number.isFinite(y))setPoints(p=>[...p,{x,y}])}}><div className="controls"><label>X meters<input type="number" min="-7" max="7" step="0.1" value={x} onChange={e=>setX(+e.target.value)}/></label><label>Y meters<input type="number" min="-4" max="4" step="0.1" value={y} onChange={e=>setY(+e.target.value)}/></label><button>Add point locally</button></div></form><label>Query points<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="point 0"/></label><p role="status">First segment: {distance===null?'not available':distance.toFixed(2)+' m'}; schematic elevation: {height} m; {visible.length} query matches.</p><ul>{visible.map(p=><li key={p.id}>P{p.id}: ({p.x}, {p.y}) <button onClick={()=>setPoints(old=>old.filter((_,i)=>i!==p.id))}>Remove locally</button></li>)}</ul><button onClick={()=>{setPoints([{x:0,y:0},{x:4,y:3}]);setQuery('');setHeight(0);setScale(30);setGrid(true);setGeometry(true)}}>Reset spatial demo</button></section>}

````

## http-check-results.json

````json
{
  "checked": 183,
  "passed": 183,
  "unknownRoute404Checks": 3,
  "errors": [],
  "browserInteractions": "UNTESTED",
  "mobileVisualQA": "UNTESTED"
}
````

## lib/catalog.ts

````typescript
export const componentSlugs=["button", "input", "textarea", "select", "checkbox", "radio", "switch", "tabs", "card", "dialog", "drawer", "accordion", "popover", "tooltip", "alert", "toast", "badge", "progress", "skeleton", "header", "sidebar", "breadcrumbs", "menu", "pagination", "command-palette", "empty-state", "error-state"] as const;
export const patterns={"identity": ["sign-in", "invitation", "mfa", "recovery", "workspace-switcher", "permissions", "sessions"], "production": ["dashboard", "asset-browser", "scene-controls", "quote-editor", "client-review", "approval", "handoff"]} as const;
export const exampleSlugs=["identity", "production", "spatial", "scene", "theme"] as const;

````

## lib/contracts.ts

````typescript
export type Vec3=[number,number,number];
export interface SceneNode {id:string;name:string;position:Vec3;rotation:Vec3;scale:Vec3;visible:boolean;color:string}
export interface SceneDocument {id:string;schemaVersion:1;revision:number;units:'m';coordinateSystem:{kind:'local';axes:'Y-up';origin:Vec3};nodes:SceneNode[]}
export const sceneFixture:SceneDocument={id:'demo-scene',schemaVersion:1,revision:0,units:'m',coordinateSystem:{kind:'local',axes:'Y-up',origin:[0,0,0]},nodes:[{id:'stage',name:'Stage',position:[0,0,0],rotation:[0,0,0],scale:[3,1,2],visible:true,color:'#bca36f'},{id:'table',name:'Table',position:[3,0,2],rotation:[0,0,0],scale:[1,1,1],visible:true,color:'#c4dc79'}]};
export type RouteSpec={path:string;group:string;title:string;mode:string;description:string};

````

## lib/guides.ts

````typescript
export const guidance:Record<string,string[]>={
Start:['Install dependencies using npm install; then npm run dev.','This source is a standalone demo; it does not contain the real @maataa/ui package.','Run npm run typecheck, npm run build and npm run validate:routes before integrating.'],
Foundations:['Tokens use CSS custom properties and can be overridden per application.','Keep semantic foreground/background pairs rather than changing isolated colors.','Visual changes here are local and do not constitute contrast certification.'],
Components:['Use native semantics, typed props and controlled state.','Every interactive component needs keyboard, focus, disabled and error behavior.','Do not equate visual readiness with accessibility or production certification.'],
Forms:['Validate on the server as well as the client in a real application.','Associate labels and errors with fields; never silently submit invalid data.','Demo input is not transmitted. Do not enter private information.'],
Data:['The records shown are illustrative, not production telemetry.','Preserve stable row IDs while filtering, sorting and paginating.','Empty results should explain how to clear filters.'],
Spatial:['The drawing uses a local metric coordinate plane, not geographic coordinates.','A geographic adapter must explicitly validate CRS, axis order and transformations.','Distances are local Euclidean demo values; no geodesic or terrain accuracy is claimed.'],
'3D':['The supplied viewport is a software-projected schematic; no WebGL renderer is bundled.','Scene units are meters with a local Y-up frame.','Replace the renderer through the scene contract without giving it server authority.'],
Scene:['2D and schematic 3D views read one SceneDocument.','Edits increment revisions; undo and redo are held in component memory.','Local export is not server persistence, collaboration or immutable approval evidence.'],
Developers:['Shared types do not validate untrusted input at runtime.','UI events produce proposals or commands; server endpoints must validate and authorize them.','Generated contracts should be versioned and reviewed before backend integration.'],
Accessibility:['Native controls reduce, but do not eliminate, accessibility risks.','Verify keyboard order, visible focus, screen-reader labels and contrast in a browser.','Reduced-motion preferences must apply to renderer animation as well as CSS.'],
Release:['Every feature is local demo or documentation; none is enterprise certified.','Compatibility and performance remain untested until measured.','Do not present planned milestones as completed releases.'],
Studio:['State is held in browser memory and resets when the route unmounts.','Tenant IDs and roles here are sample selectors, not authorization evidence.','A real Studio must load records through authenticated, tenant-scoped APIs.'],
Identity:['No authentication provider, MFA verifier or session service is connected.','Use fictional input only. Demo validation never creates identity or access.','Real sessions, policies, recovery and audit must be server enforced.']};

````

## lib/routes.json

````json
[
  {
    "path": "/",
    "group": "Start",
    "title": "MAATAA UI",
    "mode": "directory",
    "description": "MAATAA UI contracts, examples and local interaction guidance."
  },
  {
    "path": "/overview",
    "group": "Start",
    "title": "Overview",
    "mode": "directory",
    "description": "Overview contracts, examples and local interaction guidance."
  },
  {
    "path": "/getting-started",
    "group": "Start",
    "title": "Getting started",
    "mode": "docs",
    "description": "Getting started contracts, examples and local interaction guidance."
  },
  {
    "path": "/installation",
    "group": "Start",
    "title": "Installation",
    "mode": "docs",
    "description": "Installation contracts, examples and local interaction guidance."
  },
  {
    "path": "/quick-start",
    "group": "Start",
    "title": "Quick start",
    "mode": "docs",
    "description": "Quick start contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/colors",
    "group": "Foundations",
    "title": "Colors",
    "mode": "tokens",
    "description": "Colors contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/typography",
    "group": "Foundations",
    "title": "Typography",
    "mode": "tokens",
    "description": "Typography contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/spacing",
    "group": "Foundations",
    "title": "Spacing",
    "mode": "tokens",
    "description": "Spacing contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/layout",
    "group": "Foundations",
    "title": "Layout",
    "mode": "tokens",
    "description": "Layout contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/icons",
    "group": "Foundations",
    "title": "Icons",
    "mode": "tokens",
    "description": "Icons contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/elevation",
    "group": "Foundations",
    "title": "Elevation",
    "mode": "tokens",
    "description": "Elevation contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/borders",
    "group": "Foundations",
    "title": "Borders",
    "mode": "tokens",
    "description": "Borders contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/motion",
    "group": "Foundations",
    "title": "Motion",
    "mode": "tokens",
    "description": "Motion contracts, examples and local interaction guidance."
  },
  {
    "path": "/foundations/responsive",
    "group": "Foundations",
    "title": "Responsive",
    "mode": "tokens",
    "description": "Responsive contracts, examples and local interaction guidance."
  },
  {
    "path": "/components",
    "group": "Components",
    "title": "Component directory",
    "mode": "directory",
    "description": "Component directory contracts, examples and local interaction guidance."
  },
  {
    "path": "/forms/validation",
    "group": "Forms",
    "title": "Validation",
    "mode": "form",
    "description": "Validation contracts, examples and local interaction guidance."
  },
  {
    "path": "/forms/multi-step",
    "group": "Forms",
    "title": "Multi Step",
    "mode": "form",
    "description": "Multi Step contracts, examples and local interaction guidance."
  },
  {
    "path": "/forms/file-upload",
    "group": "Forms",
    "title": "File Upload",
    "mode": "form",
    "description": "File Upload contracts, examples and local interaction guidance."
  },
  {
    "path": "/forms",
    "group": "Forms",
    "title": "Forms",
    "mode": "form",
    "description": "Forms contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/tables",
    "group": "Data",
    "title": "Tables",
    "mode": "data",
    "description": "Tables contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/filters",
    "group": "Data",
    "title": "Filters",
    "mode": "data",
    "description": "Filters contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/charts",
    "group": "Data",
    "title": "Charts",
    "mode": "data",
    "description": "Charts contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/tree",
    "group": "Data",
    "title": "Tree",
    "mode": "data",
    "description": "Tree contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/timeline",
    "group": "Data",
    "title": "Timeline",
    "mode": "data",
    "description": "Timeline contracts, examples and local interaction guidance."
  },
  {
    "path": "/data/code-viewer",
    "group": "Data",
    "title": "Code Viewer",
    "mode": "data",
    "description": "Code Viewer contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial",
    "group": "Spatial",
    "title": "Spatial overview",
    "mode": "directory",
    "description": "Spatial overview contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/map",
    "group": "Spatial",
    "title": "Map",
    "mode": "spatial",
    "description": "Map contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/layers",
    "group": "Spatial",
    "title": "Layers",
    "mode": "spatial",
    "description": "Layers contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/coordinates",
    "group": "Spatial",
    "title": "Coordinates",
    "mode": "spatial",
    "description": "Coordinates contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/geometry",
    "group": "Spatial",
    "title": "Geometry",
    "mode": "spatial",
    "description": "Geometry contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/measurement",
    "group": "Spatial",
    "title": "Measurement",
    "mode": "spatial",
    "description": "Measurement contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/raster-terrain",
    "group": "Spatial",
    "title": "Raster Terrain",
    "mode": "spatial",
    "description": "Raster Terrain contracts, examples and local interaction guidance."
  },
  {
    "path": "/spatial/query",
    "group": "Spatial",
    "title": "Query",
    "mode": "spatial",
    "description": "Query contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d",
    "group": "3D",
    "title": "3D overview",
    "mode": "directory",
    "description": "3D overview contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/viewport",
    "group": "3D",
    "title": "Viewport",
    "mode": "scene",
    "description": "Viewport contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/scene-tree",
    "group": "3D",
    "title": "Scene Tree",
    "mode": "scene",
    "description": "Scene Tree contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/transforms",
    "group": "3D",
    "title": "Transforms",
    "mode": "scene",
    "description": "Transforms contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/assets",
    "group": "3D",
    "title": "Assets",
    "mode": "scene",
    "description": "Assets contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/materials",
    "group": "3D",
    "title": "Materials",
    "mode": "scene",
    "description": "Materials contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/lighting",
    "group": "3D",
    "title": "Lighting",
    "mode": "scene",
    "description": "Lighting contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/cameras",
    "group": "3D",
    "title": "Cameras",
    "mode": "scene",
    "description": "Cameras contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/animation",
    "group": "3D",
    "title": "Animation",
    "mode": "scene",
    "description": "Animation contracts, examples and local interaction guidance."
  },
  {
    "path": "/3d/annotations",
    "group": "3D",
    "title": "Annotations",
    "mode": "scene",
    "description": "Annotations contracts, examples and local interaction guidance."
  },
  {
    "path": "/scene/2d-3d",
    "group": "Scene",
    "title": "2D 3D",
    "mode": "scene",
    "description": "2D 3D contracts, examples and local interaction guidance."
  },
  {
    "path": "/scene/history",
    "group": "Scene",
    "title": "History",
    "mode": "scene",
    "description": "History contracts, examples and local interaction guidance."
  },
  {
    "path": "/scene/validation",
    "group": "Scene",
    "title": "Validation",
    "mode": "scene",
    "description": "Validation contracts, examples and local interaction guidance."
  },
  {
    "path": "/examples",
    "group": "Examples",
    "title": "Examples directory",
    "mode": "directory",
    "description": "Examples directory contracts, examples and local interaction guidance."
  },
  {
    "path": "/developers/contracts",
    "group": "Developers",
    "title": "Contracts",
    "mode": "code",
    "description": "Contracts contracts, examples and local interaction guidance."
  },
  {
    "path": "/developers/integration",
    "group": "Developers",
    "title": "Integration",
    "mode": "code",
    "description": "Integration contracts, examples and local interaction guidance."
  },
  {
    "path": "/developers/composition",
    "group": "Developers",
    "title": "Composition",
    "mode": "code",
    "description": "Composition contracts, examples and local interaction guidance."
  },
  {
    "path": "/developers/state",
    "group": "Developers",
    "title": "State",
    "mode": "code",
    "description": "State contracts, examples and local interaction guidance."
  },
  {
    "path": "/developers/migration",
    "group": "Developers",
    "title": "Migration",
    "mode": "code",
    "description": "Migration contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility",
    "group": "Accessibility",
    "title": "Accessibility",
    "mode": "docs",
    "description": "Accessibility contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility/keyboard",
    "group": "Accessibility",
    "title": "Keyboard",
    "mode": "docs",
    "description": "Keyboard contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility/screen-readers",
    "group": "Accessibility",
    "title": "Screen Readers",
    "mode": "docs",
    "description": "Screen Readers contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility/contrast",
    "group": "Accessibility",
    "title": "Contrast",
    "mode": "docs",
    "description": "Contrast contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility/forms",
    "group": "Accessibility",
    "title": "Forms",
    "mode": "docs",
    "description": "Forms contracts, examples and local interaction guidance."
  },
  {
    "path": "/accessibility/reduced-motion",
    "group": "Accessibility",
    "title": "Reduced Motion",
    "mode": "docs",
    "description": "Reduced Motion contracts, examples and local interaction guidance."
  },
  {
    "path": "/readiness",
    "group": "Release",
    "title": "Readiness",
    "mode": "readiness",
    "description": "Readiness contracts, examples and local interaction guidance."
  },
  {
    "path": "/changelog",
    "group": "Release",
    "title": "Changelog",
    "mode": "readiness",
    "description": "Changelog contracts, examples and local interaction guidance."
  },
  {
    "path": "/deprecations",
    "group": "Release",
    "title": "Deprecations",
    "mode": "readiness",
    "description": "Deprecations contracts, examples and local interaction guidance."
  },
  {
    "path": "/compatibility",
    "group": "Release",
    "title": "Compatibility",
    "mode": "readiness",
    "description": "Compatibility contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio",
    "group": "Studio",
    "title": "Studio",
    "mode": "directory",
    "description": "Studio contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/workspaces",
    "group": "Studio",
    "title": "Studio Workspaces",
    "mode": "directory",
    "description": "Studio Workspaces contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/themes",
    "group": "Studio",
    "title": "Studio Themes",
    "mode": "tokens",
    "description": "Studio Themes contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/tokens",
    "group": "Studio",
    "title": "Studio Tokens",
    "mode": "tokens",
    "description": "Studio Tokens contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/assets",
    "group": "Studio",
    "title": "Studio Assets",
    "mode": "assets",
    "description": "Studio Assets contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/scenes",
    "group": "Studio",
    "title": "Studio Scenes",
    "mode": "directory",
    "description": "Studio Scenes contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/settings",
    "group": "Studio",
    "title": "Studio Settings",
    "mode": "directory",
    "description": "Studio Settings contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/settings/members",
    "group": "Studio",
    "title": "Studio Settings Members",
    "mode": "members",
    "description": "Studio Settings Members contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/settings/permissions",
    "group": "Studio",
    "title": "Studio Settings Permissions",
    "mode": "permissions",
    "description": "Studio Settings Permissions contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/settings/security",
    "group": "Studio",
    "title": "Studio Settings Security",
    "mode": "auth",
    "description": "Studio Settings Security contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/settings/sessions",
    "group": "Studio",
    "title": "Studio Settings Sessions",
    "mode": "sessions",
    "description": "Studio Settings Sessions contracts, examples and local interaction guidance."
  },
  {
    "path": "/studio/audit",
    "group": "Studio",
    "title": "Studio Audit",
    "mode": "audit",
    "description": "Studio Audit contracts, examples and local interaction guidance."
  },
  {
    "path": "/sign-in",
    "group": "Identity",
    "title": "Sign In",
    "mode": "auth",
    "description": "Sign In contracts, examples and local interaction guidance."
  },
  {
    "path": "/auth/callback",
    "group": "Identity",
    "title": "Auth Callback",
    "mode": "auth",
    "description": "Auth Callback contracts, examples and local interaction guidance."
  },
  {
    "path": "/auth/mfa",
    "group": "Identity",
    "title": "Auth Mfa",
    "mode": "auth",
    "description": "Auth Mfa contracts, examples and local interaction guidance."
  },
  {
    "path": "/auth/recovery",
    "group": "Identity",
    "title": "Auth Recovery",
    "mode": "auth",
    "description": "Auth Recovery contracts, examples and local interaction guidance."
  }
]
````

## next-env.d.ts

````typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

````

## next.config.ts

````typescript
import type {NextConfig} from "next";
const config:NextConfig={};
export default config;

````

## package.json

````json
{
  "name": "maataa-ui-route-source",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "validate:routes": "node scripts/validate-routes.mjs"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3"
  }
}
````

## route-manifest.json

````json
{
  "status": "generated local source",
  "concreteRoutes": [
    "/",
    "/overview",
    "/getting-started",
    "/installation",
    "/quick-start",
    "/foundations/colors",
    "/foundations/typography",
    "/foundations/spacing",
    "/foundations/layout",
    "/foundations/icons",
    "/foundations/elevation",
    "/foundations/borders",
    "/foundations/motion",
    "/foundations/responsive",
    "/components",
    "/forms/validation",
    "/forms/multi-step",
    "/forms/file-upload",
    "/forms",
    "/data/tables",
    "/data/filters",
    "/data/charts",
    "/data/tree",
    "/data/timeline",
    "/data/code-viewer",
    "/spatial",
    "/spatial/map",
    "/spatial/layers",
    "/spatial/coordinates",
    "/spatial/geometry",
    "/spatial/measurement",
    "/spatial/raster-terrain",
    "/spatial/query",
    "/3d",
    "/3d/viewport",
    "/3d/scene-tree",
    "/3d/transforms",
    "/3d/assets",
    "/3d/materials",
    "/3d/lighting",
    "/3d/cameras",
    "/3d/animation",
    "/3d/annotations",
    "/scene/2d-3d",
    "/scene/history",
    "/scene/validation",
    "/examples",
    "/developers/contracts",
    "/developers/integration",
    "/developers/composition",
    "/developers/state",
    "/developers/migration",
    "/accessibility",
    "/accessibility/keyboard",
    "/accessibility/screen-readers",
    "/accessibility/contrast",
    "/accessibility/forms",
    "/accessibility/reduced-motion",
    "/readiness",
    "/changelog",
    "/deprecations",
    "/compatibility",
    "/studio",
    "/studio/workspaces",
    "/studio/themes",
    "/studio/tokens",
    "/studio/assets",
    "/studio/scenes",
    "/studio/settings",
    "/studio/settings/members",
    "/studio/settings/permissions",
    "/studio/settings/security",
    "/studio/settings/sessions",
    "/studio/audit",
    "/sign-in",
    "/auth/callback",
    "/auth/mfa",
    "/auth/recovery",
    "/components/button",
    "/components/input",
    "/components/textarea",
    "/components/select",
    "/components/checkbox",
    "/components/radio",
    "/components/switch",
    "/components/tabs",
    "/components/card",
    "/components/dialog",
    "/components/drawer",
    "/components/accordion",
    "/components/popover",
    "/components/tooltip",
    "/components/alert",
    "/components/toast",
    "/components/badge",
    "/components/progress",
    "/components/skeleton",
    "/components/header",
    "/components/sidebar",
    "/components/breadcrumbs",
    "/components/menu",
    "/components/pagination",
    "/components/command-palette",
    "/components/empty-state",
    "/components/error-state",
    "/playground/button",
    "/playground/input",
    "/playground/textarea",
    "/playground/select",
    "/playground/checkbox",
    "/playground/radio",
    "/playground/switch",
    "/playground/tabs",
    "/playground/card",
    "/playground/dialog",
    "/playground/drawer",
    "/playground/accordion",
    "/playground/popover",
    "/playground/tooltip",
    "/playground/alert",
    "/playground/toast",
    "/playground/badge",
    "/playground/progress",
    "/playground/skeleton",
    "/playground/header",
    "/playground/sidebar",
    "/playground/breadcrumbs",
    "/playground/menu",
    "/playground/pagination",
    "/playground/command-palette",
    "/playground/empty-state",
    "/playground/error-state",
    "/studio/components/button",
    "/studio/components/input",
    "/studio/components/textarea",
    "/studio/components/select",
    "/studio/components/checkbox",
    "/studio/components/radio",
    "/studio/components/switch",
    "/studio/components/tabs",
    "/studio/components/card",
    "/studio/components/dialog",
    "/studio/components/drawer",
    "/studio/components/accordion",
    "/studio/components/popover",
    "/studio/components/tooltip",
    "/studio/components/alert",
    "/studio/components/toast",
    "/studio/components/badge",
    "/studio/components/progress",
    "/studio/components/skeleton",
    "/studio/components/header",
    "/studio/components/sidebar",
    "/studio/components/breadcrumbs",
    "/studio/components/menu",
    "/studio/components/pagination",
    "/studio/components/command-palette",
    "/studio/components/empty-state",
    "/studio/components/error-state",
    "/patterns/identity/sign-in",
    "/patterns/identity/invitation",
    "/patterns/identity/mfa",
    "/patterns/identity/recovery",
    "/patterns/identity/workspace-switcher",
    "/patterns/identity/permissions",
    "/patterns/identity/sessions",
    "/patterns/production/dashboard",
    "/patterns/production/asset-browser",
    "/patterns/production/scene-controls",
    "/patterns/production/quote-editor",
    "/patterns/production/client-review",
    "/patterns/production/approval",
    "/patterns/production/handoff",
    "/examples/identity",
    "/examples/production",
    "/examples/spatial",
    "/examples/scene",
    "/examples/theme",
    "/studio/workspaces/demo-workspace",
    "/studio/themes/demo-theme",
    "/studio/scenes/demo-scene",
    "/studio/scenes/demo-scene/review",
    "/invitations/demo-invite"
  ],
  "routeCount": 183
}
````

## scripts/http-check.mjs

````javascript
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.MAATAA_TEST_BASE||'http://127.0.0.1:4310';
const manifest=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
let passed=0;const errors=[];
for(const path of manifest.concreteRoutes){try{const response=await fetch(base+path);const text=await response.text();assert.equal(response.status,200,path);assert.ok(text.includes('<h1'),path);assert.ok(!text.includes('Unable to render this view'),path);passed++}catch(e){errors.push(String(e))}}
for(const path of ['/components/not-real','/studio/scenes/not-real','/not-a-route']){const response=await fetch(base+path);assert.equal(response.status,404,path)}
const result={checked:manifest.routeCount,passed,unknownRoute404Checks:3,errors,browserInteractions:'UNTESTED',mobileVisualQA:'UNTESTED'};
fs.writeFileSync('http-check-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;

````

## scripts/run-http-check.mjs

````javascript
import {spawn} from 'node:child_process';
const port='4327';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',port],{stdio:['ignore','pipe','pipe']});
server.stderr.on('data',x=>process.stderr.write(x));let running=false;
server.stdout.on('data',x=>{if(!running&&x.toString().includes('Ready')){running=true;const test=spawn(process.execPath,['scripts/http-check.mjs'],{stdio:'inherit',env:{...process.env,MAATAA_TEST_BASE:'http://127.0.0.1:'+port}});test.on('exit',c=>{server.kill();process.exitCode=c||0})}});
server.on('exit',c=>{if(!running)process.exitCode=c||1});

````

## scripts/validate-routes.mjs

````javascript
import fs from 'node:fs';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('route-manifest.json','utf8'));
assert.equal(new Set(manifest.concreteRoutes).size,manifest.routeCount);
const routes=JSON.parse(fs.readFileSync('lib/routes.json','utf8'));
for(const r of routes){const p='app'+(r.path==='/'?'':r.path)+'/page.tsx';assert.ok(fs.existsSync(p),p)}
const modes=new Set(['directory','tokens','form','data','scene','spatial','auth','permissions','sessions','audit','members','assets','workflow','component','code','readiness','docs']);
for(const r of routes)assert.ok(modes.has(r.mode),r.path);
console.log(`PASS: ${routes.length} concrete page modules; ${manifest.routeCount} supported fixture/catalogue URLs`);

````

## tsconfig.json

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "allowJs": true,
    "incremental": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

````
