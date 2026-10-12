# NEVO scene bridge

`vendor/scene.ts` is the exact upstream `thelinep/nevoeos` file from commit
`f50af9dd91b987080faa8fa00f2416b73cf8de78`, path `packages/domain/src/scene.ts`,
Git blob `72fc495adb8cfe3a75fe4eb85e0d5268580b9978`. No renderer dependencies.

`toNevo` maps ALLB revision to NEVO version and requires explicit authorized
organization/event context, actor, timestamp, right-handed interpretation and
XYZ Euler radians. These conventions were absent from the original ALLB
contract; requiring them is a new integration decision. Node kind `asset` is
an import presentation decision, not a resolved ProductionAsset reference.

Only meters, right-handed Y-up and zero ALLB origin are supported. Feet, Z-up,
hierarchy, non-unit quaternions and unknown schema versions fail closed.
`fromNevo` is a local flat preview projection with full original preserved in
an envelope. `restoreNevo` returns that original only when the projection is
unchanged. It rejects changed revisions/transforms instead of losing NEVO
references, provenance, annotations, cameras or layers. Editable merges and
unit/frame conversion need separate reviewed policies.

This module grants no tenant authorization, performs no persistence and
resolves no assets. Run `node --test tests/nevo-scene-adapter.test.mjs` with
Node supporting TypeScript stripping (verified Node 24.19.0).
