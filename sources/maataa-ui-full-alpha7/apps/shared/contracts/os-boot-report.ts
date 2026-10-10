/**
 * MAATAA OS boundary, contract `maataa.os-boot-report/1`.
 *
 * Grounded in maataa-os 50fce492 (src/main.rs, src/kernel.rs): under QEMU the
 * Cortex-M kernel prints a boot report over semihosting and exits. It exposes
 * NO time service: the kernel has no SysTick/RTC driver, does not link
 * `hemant-core`, and its "tick N" lines are a scheduler simulation counter.
 *
 * This parser turns that real, OS-originated text into a typed record with
 * provenance supplied by the runner (commit, binary sha256). `time` is always
 * `{ status: "unavailable" }` until the kernel implements a clock service.
 * Simulated ticks are reported as `simulatedSchedulerTicks`, never as time.
 */

export const OS_BOOT_REPORT_SCHEMA = "maataa.os-boot-report/1" as const;

export interface OsBootReport {
  schema: typeof OS_BOOT_REPORT_SCHEMA;
  source: { kind: "qemu-semihosting-stdout"; machine: string; osCommit: string; binarySha256: string };
  booted: boolean;
  exitedCleanly: boolean;
  drivers: { ready: number; total: number };
  storageMounted: boolean;
  manifest: string | null;
  capsulesLoaded: number;
  simulatedSchedulerTicks: number;
  healthNominalTicks: number;
  time: { status: "unavailable"; reason: string };
  limitations: string[];
}

export type ParseResult = { ok: true; report: OsBootReport } | { ok: false; error: string };

const COMMIT = /^[0-9a-f]{40}$/;
const SHA = /^[0-9a-f]{64}$/;
const MACHINE = /^[a-z0-9][a-z0-9-]{1,40}$/;

export function parseQemuBootReport(
  stdout: string,
  provenance: { osCommit: string; binarySha256: string; machine: string },
): ParseResult {
  if (!COMMIT.test(provenance.osCommit)) return { ok: false, error: "osCommit must be a full 40-hex commit" };
  if (!SHA.test(provenance.binarySha256)) return { ok: false, error: "binarySha256 must be 64 hex characters" };
  if (!MACHINE.test(provenance.machine)) return { ok: false, error: "machine name is invalid" };
  if (typeof stdout !== "string" || stdout.length === 0 || stdout.length > 64_000) return { ok: false, error: "empty or oversized boot output" };
  const lines = stdout.split(/\r?\n/).map((line) => line.trim());

  const booted = lines.includes("Starting Maataa OS kernel...");
  if (!booted) return { ok: false, error: "kernel start line not found; not a MAATAA OS boot report" };
  const drivers = /^drivers: (\d+)\/(\d+) ready$/.exec(lines.find((l) => l.startsWith("drivers:")) ?? "");
  if (!drivers) return { ok: false, error: "driver summary missing" };
  const manifestLine = lines.find((l) => l.startsWith("manifest: "));
  const capsules = /^capsules loaded: (\d+)$/.exec(lines.find((l) => l.startsWith("capsules loaded:")) ?? "");
  const ticks = lines.filter((l) => /^tick \d+$/.test(l)).map((l) => Number(l.slice(5)));
  const ordered = ticks.every((t, i) => t === i + 1);
  if (!ordered) return { ok: false, error: "scheduler tick lines are not a contiguous 1..n sequence" };

  return {
    ok: true,
    report: {
      schema: OS_BOOT_REPORT_SCHEMA,
      source: { kind: "qemu-semihosting-stdout", machine: provenance.machine, osCommit: provenance.osCommit, binarySha256: provenance.binarySha256 },
      booted,
      exitedCleanly: lines.includes("Exiting QEMU.") && lines.includes("Maataa OS prototype demo complete."),
      drivers: { ready: Number(drivers[1]), total: Number(drivers[2]) },
      // The boot report line ("storage mounted: true"), not the earlier mount log line.
      storageMounted: lines.includes("storage mounted: true"),
      manifest: manifestLine ? manifestLine.slice("manifest: ".length) : null,
      capsulesLoaded: capsules ? Number(capsules[1]) : 0,
      simulatedSchedulerTicks: ticks.length,
      healthNominalTicks: lines.filter((l) => l === "health: nominal").length,
      time: { status: "unavailable", reason: "maataa-os kernel exposes no clock service (no SysTick/RTC driver; hemant-core not linked into the kernel)" },
      limitations: [
        "Virtual peripherals under QEMU; not hardware.",
        "Boot report is printed once and the emulator exits; there is no request/response channel.",
        "Scheduler ticks are a simulation counter, not elapsed time.",
      ],
    },
  };
}
