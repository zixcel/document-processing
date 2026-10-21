# Source and consumer language boundaries

The Rust and strict TypeScript implementations are canonical. `dist` JavaScript is generated and is not tracked. The pack/install verifier is strict TypeScript, with finite command timeouts and output limits; it checks independently installed archives, public types and runtime refusal without workspace links or inherited registry credentials.

`scripts/plain-consumers.json` classifies the retained plain JavaScript tests and runnable example. These deliberately exercise built distributions without a TypeScript loader and are not runtime implementations. `check:tooling` rejects new unclassified JavaScript and stale exceptions. Package exports, runtime dependencies, versions and bundled license/NOTICE files are unchanged.

The unreferenced reviewed-npm publisher and configuration were removed. Current owner-local version-tag workflows remain the publication authority. No release, authentication or live resource operation is performed by this maintenance change.
