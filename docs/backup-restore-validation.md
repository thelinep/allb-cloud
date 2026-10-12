# Source checkpoint and restore validation

The source archive contains the ALLB source tree, existing local Git history, tracked working-tree patch, untracked source/evidence files and per-file SHA-256 manifest. No new commit was made. Generated builds, dependencies, runtime state and environment credentials are excluded. Original uploaded ZIPs and creative assets outside this repository remain untouched.

Rehearsal: ZIP CRC and all member hashes passed; Git bundle cloned in an independent temporary directory, tracked changes/deletions applied, full source overlaid and every restored source hash verified. Restored tracked diff matched the archived patch exactly; restored git diff --check passed.

The final archive is generated and verified again after this report is saved. Its accompanying verification JSON records the final size, SHA-256 and restore result. These checks validate source restoration, not dependency installation, deployed service configuration or production database restoration.

Reproduce with scripts/create-source-backup.py and scripts/verify-source-backup.py. Full production build validation preceded cache cleanup; build outputs can be regenerated via npm run build. Dependencies are retained in the workspace for continued development. Production services remain unconfigured and untested.
