# Development, staging and production database boundaries

User decision: start with a disposable development database. The SQL migration currently runs in PGlite under `npm run test:db`; it is not the application database connection. Node/PGlite supports this isolated execution according to https://pglite.dev/docs/. Separate networked PostgreSQL tests are required before staging.

## Environment inputs

| Setting | Development | Staging | Production |
| --- | --- | --- | --- |
| Database | disposable PGlite test; networked instance pending | dedicated PostgreSQL, pending | dedicated PostgreSQL, pending |
| Credentials | test needs none | secret manager/environment only | secret manager/environment only |
| Identity | own MAATAA Auth, server integration pending | separate self-hosted identity configuration | approved self-hosted identity configuration |
| Assets | no uploads connected | separate bucket and service identity | separate bucket and service identity |
| Seed records | two test tenants, no personal data | synthetic tenants only | no development fixtures |

Every environment must have its own database, identity application and bucket. Never copy production credentials/data into development. The app still runs without backend credentials; authenticated backend startup must fail closed when configuration is absent.

## Migration and recovery procedure

1. Review the numbered SQL migration and hash; record the version/hash in a migration ledger before shared-environment operation. No shared migration runner exists yet.
2. Test forward migration on an empty database and a representative sanitized prior schema. Use a single migration owner; application roles cannot own/alter tables.
3. For breaking changes, expand first: add nullable structures and compatible reads/writes. Backfill in bounded, retryable batches. Verify row counts, tenant references and application compatibility.
4. Switch reads/writes after validation; retain old structures throughout the rollback window. Contract only after the older app version is no longer deployed.
5. Before a shared migration, obtain a database snapshot/PITR checkpoint and verify restore to an isolated database. Record recovery point and recovery time evidence. No backup/restore check has been performed yet.
6. Roll back application deployment first when schema is backward compatible. Do not delete committed configuration versions or audit history to simulate rollback; change publication pointers through an audited service.
7. If data recovery is required, pause writes, restore to a separate database, reconcile tenant-scoped changes after the recovery point, verify integrity and then switch traffic under the production runbook.

The baseline tests demonstrate foreign-key tenant scoping, immutable records, unique keys and aborted transaction rollback. They do not demonstrate runtime permission enforcement, multi-session concurrency, network availability, PITR or disaster recovery.
