"""Export source, uncommitted work and local Git history; omit regenerable outputs."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("output", type=Path)
args = parser.parse_args()
output = args.output.resolve()
if output.is_relative_to(root):
    raise SystemExit("Backup output must be outside the source repository")
output.parent.mkdir(parents=True, exist_ok=True)
excluded = {"node_modules", ".git", ".next", ".open-next", ".wrangler", "dist", "test-results", "playwright-report", "__pycache__"}
manifest = []
with tempfile.TemporaryDirectory(prefix="allb-backup-") as directory:
    temp = Path(directory)
    subprocess.run(["git", "bundle", "create", str(temp / "history.bundle"), "--all"], cwd=root, check=True)
    subprocess.run(["git", "bundle", "verify", str(temp / "history.bundle")], cwd=root, check=True, capture_output=True)
    (temp / "working-tree.patch").write_bytes(subprocess.check_output(["git", "diff", "HEAD", "--binary"], cwd=root))
    (temp / "working-tree-status.txt").write_bytes(subprocess.check_output(["git", "status", "--short"], cwd=root))
    (temp / "RESTORE.md").write_text("""# Restore ALLB local source checkpoint

The allb-cloud directory is the final source tree, including uncommitted files.
history.bundle preserves existing local commits and refs. No new commit was made.
working-tree.patch records tracked changes/deletions; untracked files are in the tree.

For a Git checkout: clone history.bundle to a new directory, apply
working-tree.patch with git apply --binary, then overlay allb-cloud.
Applying the patch first preserves tracked deletions; the overlay adds untracked files.
Alternatively use the exported source tree directly without Git.

Run npm run setup to install locked dependencies and build shared packages.
Run npm run build, npm run typecheck and the documented validation commands.
Browser verification needs Chromium via ALLB_CHROMIUM_PATH.
The workflow fixture is disposable and created only by its test runner.
Production configuration, credentials, databases and live service state are absent.
Dependencies, generated builds, caches and environment files were omitted.
SHA256SUMS.json records every included file except itself; ZIP CRC is also verified.
""", encoding="utf-8")
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        def add(path, name):
            data = path.read_bytes()
            archive.writestr(name, data)
            manifest.append({"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
        for current, directories, files in os.walk(root):
            directories[:] = sorted(d for d in directories if d not in excluded and not (Path(current) / d).is_symlink())
            for name in sorted(files):
                path = Path(current) / name
                if path.is_symlink() or name.endswith(".tsbuildinfo") or (name.startswith(".env") and name not in {".env.example", ".env.sample"}):
                    continue
                add(path, "allb-cloud/" + path.relative_to(root).as_posix())
        for path in sorted(temp.iterdir()):
            add(path, path.name)
        archive.writestr("SHA256SUMS.json", json.dumps(manifest, indent=2) + "\n")
with zipfile.ZipFile(output) as archive:
    if archive.testzip() is not None:
        raise SystemExit("ZIP integrity failed")
    for entry in manifest:
        if hashlib.sha256(archive.read(entry["path"])).hexdigest() != entry["sha256"]:
            raise SystemExit("Backup digest verification failed")
print(json.dumps({"path": str(output), "files": len(manifest), "bytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "crcAndDigests": "passed"}))
