"""Verify archive integrity and actually restore Git history plus working tree."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument("archive", type=Path)
args = parser.parse_args()
with tempfile.TemporaryDirectory(prefix="allb-restore-check-") as directory:
    temp = Path(directory)
    with zipfile.ZipFile(args.archive) as archive:
        if archive.testzip() is not None:
            raise SystemExit("ZIP CRC failed")
        manifest = json.loads(archive.read("SHA256SUMS.json"))
        for entry in manifest:
            if hashlib.sha256(archive.read(entry["path"])).hexdigest() != entry["sha256"]:
                raise SystemExit("Archive hash failed")
        for name in archive.namelist():
            target = (temp / name).resolve()
            if not target.is_relative_to(temp.resolve()):
                raise SystemExit("Unsafe archive member")
        archive.extractall(temp)
    restored = temp / "restored"
    subprocess.run(["git", "clone", "--quiet", str(temp / "history.bundle"), str(restored)], check=True, capture_output=True)
    patch = temp / "working-tree.patch"
    if patch.stat().st_size:
        subprocess.run(["git", "apply", "--binary", str(patch)], cwd=restored, check=True, capture_output=True)
    shutil.copytree(temp / "allb-cloud", restored, dirs_exist_ok=True)
    for entry in manifest:
        if entry["path"].startswith("allb-cloud/"):
            path = restored / entry["path"][len("allb-cloud/"):]
            if hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]:
                raise SystemExit("Restored source hash failed")
    diff = subprocess.check_output(["git", "diff", "HEAD", "--binary"], cwd=restored)
    if diff != patch.read_bytes():
        raise SystemExit("Restored tracked changes/deletions differ")
    subprocess.run(["git", "diff", "--check"], cwd=restored, check=True, capture_output=True)
    print(json.dumps({"archive": str(args.archive.resolve()), "files": len(manifest), "crc": "passed", "fileHashes": "passed", "gitClone": "passed", "trackedPatchAndDeletions": "passed", "restoredSourceHashes": "passed", "restoredDiffCheck": "passed", "dependencyInstallAndProductionDatabaseRestore": "not_tested"}))
