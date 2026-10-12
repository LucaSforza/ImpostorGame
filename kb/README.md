# Pocket Circle knowledge base

This folder describes Pocket Circle, a local-first catalog of pass-and-play games. The source of truth remains the code in `src/`; the catalog design is the implementation contract for the multi-game release.

- [Catalog design](catalog-design.md): brand, catalog, games, shared profiles, statistics, and acceptance boundaries.
- [Architecture](architecture.md): application structure, state flow, and deployment.
- [IndexedDB](indexeddb.md): persisted model, logical schema, and local database details.
- [Game rules](game-rules.md): setup, reveal, discussion, and voting.
- [Language](language.md): locale catalog, stable category IDs, and extension contract.
- [Validation](qa.md): automated gates, browser checks, and dated verification evidence.
- [Offline use and itch.io builds](offline.md): Pages caching, update behavior, and portable distribution.

Repository workflows live in [AGENTS.md](../AGENTS.md), with local skills for [navigating this KB](../.agents/skills/pocket-circle-kb/SKILL.md) and [adding a game](../.agents/skills/pocket-circle-new-game/SKILL.md).

The app is a static client: it uses neither an application server nor a remote database. Shared player profiles, settings, statistics, and any active game remain in the user's browser.

Launch evidence and owner decisions: [progress](../docs/launch-readiness.md), [audit](../docs/launch-audit.md), [naming and provenance](../docs/naming-and-provenance.md).
