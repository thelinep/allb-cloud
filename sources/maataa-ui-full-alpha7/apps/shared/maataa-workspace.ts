export interface MaataaRecordLink {
  recordId: string;
  recordVersion: number;
  schema: "maataa.project-record/1.0.0";
}

export interface MaataaWorkspaceProject {
  /** `<product>:workspace` for the single-slot plan entry, or a `prj:<uuid>` record ID. */
  id: "tlps:workspace" | "tlp-film:workspace" | `prj:${string}`;
  product: "tlps" | "tlp-film";
  title: string;
  projectType: string;
  status: "draft" | "example";
  sample: boolean;
  /** Present only for shared project records (Tauri Desktop registry v3). */
  record?: MaataaRecordLink;
}

export const MAATAA_WORKSPACE_PROJECTS_KEY = "maataa.desktop.workspace-projects.v1";

export function readLocalWorkspaceProjects(): MaataaWorkspaceProject[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MAATAA_WORKSPACE_PROJECTS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MaataaWorkspaceProject =>
      typeof item === "object" && item !== null
      && (item as MaataaWorkspaceProject).id === `${(item as MaataaWorkspaceProject).product}:workspace`
      && ["tlps", "tlp-film"].includes((item as MaataaWorkspaceProject).product)
      && typeof (item as MaataaWorkspaceProject).title === "string"
      && (item as MaataaWorkspaceProject).title.length <= 120
      && typeof (item as MaataaWorkspaceProject).projectType === "string"
      && (item as MaataaWorkspaceProject).projectType.length <= 80
      && ["draft", "example"].includes((item as MaataaWorkspaceProject).status)
      && typeof (item as MaataaWorkspaceProject).sample === "boolean",
    );
  } catch {
    return [];
  }
}

type TauriWindow = Window & {
  __TAURI__?: {
    core?: {
      invoke?: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
  };
};

function invokeDesktop(command: string, args?: Record<string, unknown>) {
  return (window as TauriWindow).__TAURI__?.core?.invoke?.(command, args);
}

export async function publishWorkspaceProject(
  project: MaataaWorkspaceProject,
): Promise<boolean> {
  const invoke = invokeDesktop("upsert_workspace_project", { project });
  if (!invoke) {
    // The Electron shell keeps one entry per product and would replace the
    // TLPS plan entry with a record entry, so record links are Tauri-only.
    if (project.record) return false;
    if (window.parent === window) return false;
    window.parent.postMessage({ type: "maataa:desktop:workspace-project", project }, window.location.origin);
    return true;
  }
  await invoke;
  return true;
}

export async function removeWorkspaceProject(product: MaataaWorkspaceProject["product"]): Promise<boolean> {
  const invoke = invokeDesktop("remove_workspace_project", { product });
  if (!invoke) {
    if (window.parent === window) return false;
    window.parent.postMessage({ type: "maataa:desktop:remove-workspace-project", product }, window.location.origin);
    return true;
  }
  await invoke;
  return true;
}

export type ContextHandoffResult = { ok: true } | { ok: false; message: string };

/**
 * Asks the native Tauri Desktop to open a product window on one shared project
 * record (ID + version only). Desktop re-checks both against its registry and
 * refuses unknown or stale versions. Outside Tauri there is no bridge, so the
 * handoff reports that instead of guessing a URL in another app.
 */
export async function openProductWithRecord(
  product: "maataa-ui" | "tlps",
  context: { recordId: string; recordVersion: number },
): Promise<ContextHandoffResult> {
  const invoke = invokeDesktop("open_product_window", { product, recordId: context.recordId, recordVersion: context.recordVersion });
  if (!invoke) return { ok: false, message: "MAATAA Desktop (Tauri) is not available in this window, so the project cannot be handed to another app." };
  try {
    await invoke;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

/** Brings the MAATAA Desktop window forward; it refreshes its project list from the registry. */
export async function returnToDesktop(): Promise<ContextHandoffResult> {
  const invoke = invokeDesktop("focus_desktop_window");
  if (!invoke) return { ok: false, message: "MAATAA Desktop (Tauri) is not available in this window. Switch to it yourself; nothing was lost." };
  try {
    await invoke;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Could not return to MAATAA Desktop: ${error instanceof Error ? error.message : String(error)}` };
  }
}
