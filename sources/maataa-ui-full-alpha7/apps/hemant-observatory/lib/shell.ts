// Server-only bridge to the local hemant-shell binary. Fixed binary path,
// fixed argument shapes, bounded time and output. Never takes a command.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export type ShellArgs = ["--json"] | ["--methods-json"] | ["--unix-nanos", string, "--json"];
export type ShellOutcome = { ok: true; json: unknown } | { ok: false; status: number; error: string };

export function shellBinary(root = process.cwd()): string | null {
  const suffix = process.platform === "win32" ? ".exe" : "";
  const candidates = [join(root, "target", "release", `hemant-shell${suffix}`), join(root, "target", "debug", `hemant-shell${suffix}`)];
  return candidates.find(existsSync) ?? null;
}

export function runShell(args: ShellArgs, binary = shellBinary()): ShellOutcome {
  if (!binary) return { ok: false, status: 503, error: "Rust time shell is not built (run cargo build)" };
  const result = spawnSync(binary, args, { encoding: "utf8", timeout: 2_000, windowsHide: true, maxBuffer: 64 * 1024, env: {} as NodeJS.ProcessEnv });
  if (result.error) return { ok: false, status: 503, error: "Rust time shell could not run" };
  if (result.status !== 0) return { ok: false, status: 422, error: (result.stderr || "Rust time shell rejected the input").trim().slice(0, 300) };
  try {
    return { ok: true, json: JSON.parse(result.stdout) };
  } catch {
    return { ok: false, status: 502, error: "Rust time shell returned invalid data" };
  }
}

export const noStore = { "Cache-Control": "no-store" } as const;
