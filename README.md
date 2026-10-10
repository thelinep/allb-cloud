# ALLB Cloud

Master repository for ALLB. The canonical application combines the ALLB public surfaces and MAATAA UI.

## Start

    npm run setup
    npm run dev

Build and run:

    npm run build
    npm start

Open / for the unified portal, /allb for the 36 landings, /workspace for brand workspaces,
and /studio/themes or /studio/branding to configure their appearance and identity.

- 259 supported URLs, including the preserved MAATAA UI routes.
- One application navigation and design provider; shared browser-local configuration.
- 36 landing-to-workspace pairs and 174 preserved artwork/derived assets.
- Build, TypeScript, route, configuration, simulated DOM and HTTP integration checks pass.
- Actual browser/mobile visuals remain unverified.
- Production authentication, server persistence, scientific services and deployment remain separate work.

See [integration and validation](docs/unified-app-integration.md) and [design studios](docs/design-studios.md).

## Source layout

- apps/maataa-ui-route-source/: canonical executable ALLB + MAATAA application.
- packages/design-config/: shared scoped configuration resolver and tests.
- sources/maataa-ui-full-alpha7/: preserved original partial handoff / Observatory reference.

The preserved handoff root package references missing files and is not the command entrypoint.
The unified app retains local-demo boundaries; its brand workspaces do not establish completed
production applications or connected business/scientific services.
