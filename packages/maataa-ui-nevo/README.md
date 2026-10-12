# @maataa/ui in NEVO

This package is the extracted Maataa UI foundation: accessible presentation
primitives, theme metadata, navigation and status contracts.

It is intentionally **not** an authority layer. In NEVO:

- authentication, tenant access, roles and permissions remain in NEVO server
  routes and request-scoped Prisma access;
- workflow, booking, payment, evidence and audit mutations remain NEVO domain
  operations;
- `ready`, `partial` and `blocked` UI states must be derived from verified NEVO
  runtime/evidence state and must never certify an external provider by copy.

## Verification

```bash
pnpm --filter @maataa/ui typecheck
pnpm --filter @maataa/ui test
```
