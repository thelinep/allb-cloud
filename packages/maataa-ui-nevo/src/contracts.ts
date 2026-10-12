export type Readiness = "ready" | "partial" | "blocked" | "unknown";
export type EvidenceState = "verified" | "review" | "illustrative" | "missing";

export interface MaataaSurfaceFrame {
  identity: { actorId: string; displayName: string };
  tenant: { tenantId: string; name: string };
  workspace: { workspaceId: string; name: string };
  product: { productId: string; name: string };
  route: { pathname: string; title: string };
  authority: { role: string; permissions: readonly string[] };
  evidence: { state: EvidenceState; sourceCount: number };
  runtime: { readiness: Readiness; health?: string };
  locale: { language: string; script: string; direction: "ltr" | "rtl" };
  theme: { themeId: string; density: "comfortable" | "compact" };
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

export interface HudDefinition {
  id: string;
  family: "identity" | "workspace" | "workflow" | "evidence" | "knowledge" | "runtime" | "security" | "risk" | "completion" | "lipi" | "ai";
  label: string;
  readiness: Readiness;
}
