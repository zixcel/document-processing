# Source and consumer language boundaries

The Rust and strict TypeScript implementations are canonical. `dist` JavaScript is generated and is not tracked. The pack/install verifier is strict TypeScript, with finite command timeouts and output limits; it checks independently installed archives, public types and runtime refusal without workspace links or inherited registry credentials.

All first-party runtime, verification, tests and runnable examples are TypeScript. Tests still exercise built JavaScript distributions; their own source is strict TypeScript. `check:tooling` rejects any tracked handwritten JavaScript. Generated `dist` is ignored and packaged, not maintained as a second source. Package exports, runtime dependencies, versions and bundled license/NOTICE files are unchanged.

The unreferenced reviewed-npm publisher and configuration were removed. Current owner-local version-tag workflows remain the publication authority. No release, authentication or live resource operation is performed by this maintenance change.
