# NEVO MAATAA UI import

Imported unchanged from the pinned NEVO EOS commit recorded in PROVENANCE.json. This is the actual `@maataa/ui` package, not a replacement recreation. The 21 upstream files include 16 source files and two upstream tests.

The `/integration/ui` route imports actual source primitives directly and scoped styles only. It provides required form validation, local preview and reset. It deliberately does not import the upstream global `tokens.css`, which would override ALLB Studio defaults. Icons and wizard are imported in this package but are not wired into every ALLB route.

The 68 theme registry entries are named family/mode records, not 68 fully implemented visual token systems. Do not describe them as verified visual themes. Upstream AppShell has an unconnected Ask MAATAA button; it is not used in the integration showcase. Dynamic list/signer keys incorporate values and need focus-stability review before adopting those components in production.

Install package dependencies with `npm install --prefix packages/maataa-ui-nevo`, then run `npm run build --prefix packages/maataa-ui-nevo` and `node --test packages/maataa-ui-nevo/tests/*.test.mjs`. Package dependency integration into the repository setup is an explicit follow-up: importing individual source primitives works without react-icons in the host app; full icon/wizard consumption requires the package dependency installation.

No package license declaration or LICENSE file exists in the pinned package. Confirm redistribution policy before release. No backend, shared server persistence or identity behavior is added by this UI import.
