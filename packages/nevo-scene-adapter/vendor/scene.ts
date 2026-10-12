// Canonical, renderer-neutral SceneDocument contract (Phase B2A).
//
// This is the one serialized representation of an event scene / PREVIZ
// state. It is deliberately independent of any rendering engine: nothing
// here references Three.js, WebGL, or any other runtime. A future runtime
// adapter (Phase B4: "SceneDocument -> runtime adapter -> Three.js") reads
// this shape and builds renderer objects from it; this module never reads
// or writes a renderer object. Persisting a renderer object instead of this
// shape is exactly the mistake this contract exists to prevent.
//
// Audit performed before writing this file (2026-09-17): no scene/planner/
// 2D/3D/canvas/WebGL/venue-layout code exists anywhere in apps/web, no
// `three`/`@react-three` dependency is declared, and the schema's
// `SeatingTable` model is guest-table metadata (name/capacity/zone), not a
// spatial layout. This contract is genuinely new - there is nothing to
// reuse or extend for the scene shape itself. See
// docs/architecture/SCENE_DOCUMENT_CONTRACTS.md.
//
// Placement: `@nevo/domain` already exists as this repository's package for
// pure, Prisma-free domain contracts (see `booking.ts`'s BOOKING_TRANSITIONS
// in this same package). This file extends it rather than creating a new
// package, consistent with "reuse before adding."

/** Bumped only for a breaking change to the SceneDocument shape itself. */
export const SCENE_DOCUMENT_SCHEMA_VERSION = 1 as const;

/**
 * The axis convention every coordinate in a SceneDocument is expressed in.
 * A runtime adapter is responsible for converting into whatever convention
 * its renderer expects (e.g. Three.js is right-handed, Y-up by default) -
 * this contract does not assume any particular renderer's convention is
 * "the" convention.
 */
export type SceneCoordinateSystem = "right-handed-y-up" | "right-handed-z-up";

/** The real-world length unit every distance/position value is expressed in. */
export type SceneLengthUnit = "m" | "ft";

export interface SceneVector3 {
  x: number;
  y: number;
  z: number;
}

/** Rotation as a unit quaternion - avoids gimbal-lock ambiguity that a stored Euler triple would carry into serialized, diffable state. */
export interface SceneQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface SceneTransform {
  position: SceneVector3;
  rotation: SceneQuaternion;
  scale: SceneVector3;
}

export function identitySceneTransform(): SceneTransform {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

/**
 * What kind of thing a node represents. Semantic, not visual - "stage" is a
 * real category a production plan reasons about; "a mesh with these
 * vertices" is not, and never appears here.
 */
export type SceneNodeKind = "group" | "asset" | "surface" | "seating" | "light" | "annotation_anchor";

/**
 * The seam this contract defines for Phase B2B: a node may reference a real
 * production/commercial object without this package knowing anything about
 * ProductionAsset or Listing's own shape. `kind` says which domain the `id`
 * belongs to; resolving it is the consuming application's job, not this
 * package's.
 *
 * `version` (Phase B2B) optionally pins the reference to a specific
 * `ProductionAsset.version` (see `production-asset.ts`) rather than
 * whichever revision resolving `id` returns today - a scene can freeze
 * against "the truss definition as it was when this layout was drawn."
 * Omitting it means "resolve to the current version." This package still
 * imports nothing from `production-asset.ts`: `version` is just a plain
 * number, so `SceneDocument` remains independent of `ProductionAsset`'s own
 * shape, exactly as `id` already was.
 */
export interface SceneNodeReference {
  kind: "production_asset" | "listing" | "external";
  id: string;
  version?: number;
}

/**
 * A node in the scene graph. Nodes form a tree via `parentId`, but the
 * SceneDocument stores them as a flat, ID-keyed list (`SceneDocument.nodes`)
 * rather than a nested structure - a flat list has exactly one place a given
 * node can be edited or looked up, which a nested tree does not (the same
 * node could otherwise be reachable via two different parent-child paths
 * after a malformed edit). `validateSceneDocument` checks that every
 * `parentId` resolves to a real node and that the resulting parent graph has
 * no cycles.
 */
export interface SceneNode {
  id: string;
  kind: SceneNodeKind;
  name: string;
  transform: SceneTransform;
  parentId?: string;
  reference?: SceneNodeReference;
  layerId?: string;
  /** Forward-compatible extension point for small, additive per-node data that does not warrant a schema-version bump. Values are scalars only, deliberately - this is a tag bag, not a place to smuggle a second shape through the contract. */
  metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface SceneCamera {
  id: string;
  name: string;
  transform: SceneTransform;
  fovDegrees: number;
  isDefault: boolean;
}

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

/** A point note anchored either to a fixed scene position or to a specific node (e.g. "confirm rigging clearance here"). */
export interface SceneAnnotation {
  id: string;
  nodeId?: string;
  position: SceneVector3;
  text: string;
  authorId?: string;
  createdAt: string;
}

/**
 * Who/what last touched this document and how. `source` is restricted to
 * what this repository can actually attest to: a human editing the scene, an
 * import from an external file, or a MAATAA-suggested change a human then
 * accepted. There is deliberately no "maataa_applied" value - MAATAA has no
 * Controlled Apply authority anywhere in this codebase (see
 * docs/architecture/MAATAA_AUTHORITY_POLICY.md §17), so this contract does
 * not provide a provenance value that would misrepresent one existing.
 */
export interface SceneProvenance {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  source: "manual" | "import" | "maataa_suggestion";
}

/**
 * The canonical, serialized representation of one event scene / PREVIZ
 * state. IDs (`id`, and every node/camera/layer/annotation `id`) are always
 * supplied by the caller - this module mints no identifiers itself, the
 * same convention `@maataa/ai-core`'s ProposalEnvelope already uses in this
 * codebase (see packages/maataa-ai-core/src/proposal.ts).
 */
export interface SceneDocument {
  id: string;
  schemaVersion: typeof SCENE_DOCUMENT_SCHEMA_VERSION;
  /** Document revision. Callers increment this on every save; it is a plain counter, not a semantic version. */
  version: number;
  eventId: string;
  organizationId: string;
  name: string;
  coordinateSystem: SceneCoordinateSystem;
  units: SceneLengthUnit;
  nodes: readonly SceneNode[];
  cameras: readonly SceneCamera[];
  layers: readonly SceneLayer[];
  annotations: readonly SceneAnnotation[];
  provenance: SceneProvenance;
}

export type SceneDocumentValidationCode =
  | "duplicate_node_id"
  | "duplicate_camera_id"
  | "duplicate_layer_id"
  | "duplicate_annotation_id"
  | "dangling_parent_id"
  | "parent_cycle"
  | "dangling_layer_id"
  | "dangling_annotation_node_id"
  | "no_default_camera"
  | "multiple_default_cameras"
  | "schema_version_mismatch";

export interface SceneDocumentValidationIssue {
  code: SceneDocumentValidationCode;
  message: string;
  nodeId?: string;
}

export interface SceneDocumentValidationResult {
  valid: boolean;
  issues: readonly SceneDocumentValidationIssue[];
}

/**
 * Structural validation only - referential integrity within the document
 * (unique IDs, resolvable parent/layer/annotation references, no parent
 * cycles, exactly one default camera) and schema-version agreement. This
 * never reaches into `eventId`/`organizationId` authorization (that is
 * `apps/web/lib/access.ts`'s job) and never inspects `reference` targets
 * (resolving a `production_asset`/`listing` id is the consuming
 * application's job, since this package cannot depend on Prisma).
 */
export function validateSceneDocument(doc: SceneDocument): SceneDocumentValidationResult {
  const issues: SceneDocumentValidationIssue[] = [];

  if (doc.schemaVersion !== SCENE_DOCUMENT_SCHEMA_VERSION) {
    issues.push({
      code: "schema_version_mismatch",
      message: `document schemaVersion ${doc.schemaVersion} does not match the contract's current SCENE_DOCUMENT_SCHEMA_VERSION ${SCENE_DOCUMENT_SCHEMA_VERSION}`,
    });
  }

  const nodeIds = new Set<string>();
  for (const node of doc.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({ code: "duplicate_node_id", message: `node id "${node.id}" appears more than once`, nodeId: node.id });
    }
    nodeIds.add(node.id);
  }

  const cameraIds = new Set<string>();
  for (const camera of doc.cameras) {
    if (cameraIds.has(camera.id)) {
      issues.push({ code: "duplicate_camera_id", message: `camera id "${camera.id}" appears more than once` });
    }
    cameraIds.add(camera.id);
  }

  const layerIds = new Set<string>();
  for (const layer of doc.layers) {
    if (layerIds.has(layer.id)) {
      issues.push({ code: "duplicate_layer_id", message: `layer id "${layer.id}" appears more than once` });
    }
    layerIds.add(layer.id);
  }

  const annotationIds = new Set<string>();
  for (const annotation of doc.annotations) {
    if (annotationIds.has(annotation.id)) {
      issues.push({ code: "duplicate_annotation_id", message: `annotation id "${annotation.id}" appears more than once` });
    }
    annotationIds.add(annotation.id);
  }

  const nodeById = new Map(doc.nodes.map((node) => [node.id, node]));
  for (const node of doc.nodes) {
    if (node.parentId !== undefined && !nodeById.has(node.parentId)) {
      issues.push({ code: "dangling_parent_id", message: `node "${node.id}" has parentId "${node.parentId}", which does not exist`, nodeId: node.id });
    }
    if (node.layerId !== undefined && !layerIds.has(node.layerId)) {
      issues.push({ code: "dangling_layer_id", message: `node "${node.id}" has layerId "${node.layerId}", which does not exist`, nodeId: node.id });
    }
  }

  for (const node of doc.nodes) {
    if (hasParentCycle(node.id, nodeById)) {
      issues.push({ code: "parent_cycle", message: `node "${node.id}" is part of a parentId cycle`, nodeId: node.id });
    }
  }

  for (const annotation of doc.annotations) {
    if (annotation.nodeId !== undefined && !nodeById.has(annotation.nodeId)) {
      issues.push({ code: "dangling_annotation_node_id", message: `annotation "${annotation.id}" has nodeId "${annotation.nodeId}", which does not exist` });
    }
  }

  const defaultCameraCount = doc.cameras.filter((camera) => camera.isDefault).length;
  if (doc.cameras.length > 0 && defaultCameraCount === 0) {
    issues.push({ code: "no_default_camera", message: "document has cameras but none is marked isDefault" });
  }
  if (defaultCameraCount > 1) {
    issues.push({ code: "multiple_default_cameras", message: `document has ${defaultCameraCount} cameras marked isDefault; exactly one is allowed` });
  }

  return { valid: issues.length === 0, issues };
}

function hasParentCycle(startId: string, nodeById: Map<string, SceneNode>): boolean {
  const visited = new Set<string>();
  let currentId: string | undefined = startId;
  while (currentId !== undefined) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    currentId = nodeById.get(currentId)?.parentId;
  }
  return false;
}

/**
 * Deterministic serialization: the same SceneDocument value always produces
 * the same string, regardless of the order its object keys happen to have
 * been constructed in. This is what makes a SceneDocument diffable,
 * hashable, and safe to compare for "did anything actually change" without
 * a false positive from key order alone. Array order is preserved as-is -
 * only object-key order is normalized, since array order in `nodes`/
 * `cameras`/`layers`/`annotations` is not semantically significant on its
 * own (identity is by `id`, not position) but reordering the array purely
 * for serialization would make a real diff harder to read, not easier.
 */
export function serializeSceneDocument(doc: SceneDocument): string {
  return JSON.stringify(canonicalizeForSerialization(doc));
}

function canonicalizeForSerialization(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeForSerialization);
  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const result: Record<string, unknown> = {};
    for (const [key, entryValue] of sortedEntries) result[key] = canonicalizeForSerialization(entryValue);
    return result;
  }
  return value;
}

export function deserializeSceneDocument(json: string): SceneDocument {
  return JSON.parse(json) as SceneDocument;
}

