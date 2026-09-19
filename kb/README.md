# Knowledge base

This folder describes Impostor's current behavior. The source of truth remains the code in `src/`.

- [Architecture](architecture.md): application structure, state flow, and deployment.
- [IndexedDB](indexeddb.md): persisted model, logical schema, and local database details.
- [Game rules](game-rules.md): setup, reveal, discussion, and voting.
- [Language](language.md): locale catalog, stable category IDs, and extension contract.

The app is a static client: it uses neither an application server nor a remote database. Players, settings, and any active game remain in the user's browser.
