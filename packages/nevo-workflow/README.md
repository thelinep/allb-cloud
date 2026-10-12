# NEVO workflow domain foundation

Pure, immutable contracts for inquiry → venue/layout draft → versioned quote → internal commercial review → client decision → team planning handoff. Run `node --test tests/nevo-workflow.test.mjs` from the repository root.

The layout accepts the existing MAATAA `SceneDocument` schema without altering it: schema version 1, local meters, Y-up, nodes and transforms. Geometry is structurally checked, not certified for capacity, engineering, accessibility or production safety. Quantity is explicit commercial input; dimensions do not imply quantities. Every quote line references a scene node, SKU and price version. Amounts use integer minor units; taxes, discount, availability, contracts and payment remain uncalculated/unconnected.

Actor organization/workspace and role checks protect domain transitions, but actors must come from server-authorized membership. This module is not authentication or a substitute for database tenant constraints. Revision checking is pure optimistic concurrency; a database adapter must atomically compare and write the revision. Audit entries need durable append-only storage. Snapshot SHA-256 is an integrity digest, not an electronic signature.

Roles: planner creates inquiry/venue-layout, commercial produces quotes, commercial_reviewer approves the exact quote version internally, client then approves or requests changes, production creates planning handoff. Before handoff, layout edits or a new quote invalidate both approvals and require the review sequence again. After handoff the record is frozen; later changes need a separate change-order contract. Handoff freezes the exact layout, quote, internal commercial approval and client decision and explicitly does **not** confirm a booking.

Acceptance: invalid transitions, stale revisions, cross-scope actors, mismatched role, stale quote approval, unsafe money and malformed scenes fail; previous revisions stay unchanged. Layout edits invalidate prior quote eligibility. Each approval refers to the latest quote ID/version and exact layout digest. Client approval before internal commercial approval is rejected; handoff requires both. Roles are distinct; separate human identities for the two approvals are not imposed by this domain policy.

Task evidence: E09.02 lifecycle/roles/acceptance defined; E09.06 two sequential approval stages and output foundation only, following the confirmed internal commercial → client approval policy. E09.03–E09.05 database/API/forms, E09.08 persisted end-to-end workflow, E09.09 durable audit/isolation and E09.10 business UAT remain incomplete.

Business inputs still needed before production: contract/booking definition, tax jurisdiction and currency policy, SKU and vendor price ownership, quantity/duration/labour rules, client approval identity/delegation, cancellation/change-order rules, production team membership and venue safety criteria. No invented rates or event facts are supplied by this module.
