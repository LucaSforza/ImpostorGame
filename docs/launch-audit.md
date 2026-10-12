# Public launch audit — 2026-10-12

Reviewed catalog and all five supported engines (four currently playable plus retired Stessa Onda compatibility), startup/render/event flow, IndexedDB validation/normalization, statistics, bilingual catalogs/content tests, artwork and styles, routing, build/deploy configuration, existing tests and KB. No backend or game-engine rewrite needed. Findings below are evidence-based; priorities refer to launch impact, not hypothetical severity.

| Priority | Finding | Resolution / evidence |
| --- | --- | --- |
| P0 | Startup rewrites supported older Impostore attempt limits, contradicting storage compatibility | Removed setup-limit clamp for validated active sessions. Browser test first observed `3 → 2`; now asserts 3 retained. Schema/name/store/key unchanged. |
| P0 | Exiting a supported retired Stessa Onda session tries to render removed catalog setup | Browser reproduced `Unknown game: same-wave`; Home now selects Impostore while preserving all profiles and historical scores. |
| P0 | README lists three games including retired Stessa Onda; localized catalog claims five | README and English/Italian catalog now list actual four games; preserve retired sessions/stats. |
| P0 | Hide-and-pass leaves current secret in DOM while slow IndexedDB save completes | Conceal transient reveal synchronously before save. Delayed-completion browser test first saw secret remain, then passed. Same policy applies to identity and language transitions. |
| P0 | No reliable offline reopening despite network-free gameplay | Full-build precache, manifest, local icons, safe lifecycle and optional readiness/install guidance. Test actual offline gameplay, not just metadata. |
| P1 | New worker initially misses module cache entries when `Vary: Origin` differs | Real offline reload failed JS/CSS despite complete download. Match only public precached entries with `ignoreVary`; no user state in HTTP caches. |
| P1 | Avatar choice refocuses name; closing dialog and saved selection lose keyboard focus | Stable control/selection capture, opener restoration, safe heading fallback. Regression failed on archived original UI. |
| P1 | Impostore progress label on generic div is prohibited ARIA | Gameplay axe scan reproduced violation; assign progressbar role and numeric bounds. |
| P1 | Category action smaller than 44px | Browser target-size assertion failed; minimum height added. |
| P1 | Game exit arrows lack meaningful accessible names; Bomba selected category lacks pressed state | Localized exit names and aria-pressed. Help/exit also conceal Chi sono? identities. |
| P1 | Duplicate Impostore setup hero adds scrolling and ~1.79 MB transfer | Removed duplicate markup and background CSS; retained shared cover, roster and all settings. No raster re-encoding or new artwork needed. |
| P1 | No intentional sharing or game-specific URLs | Native/copy/manual fallback with localized text; hash links to four setups; active sessions take precedence; no secrets in URLs. |
| P1 | No social metadata, canonical, icons or searchable initial game content | Static OG/Twitter tags, real 1200×630 preview, icons, valid factual JSON-LD, bilingual initial HTML and canonical-only sitemap. Three discovery tests first failed, then passed. |
| P1 | Naming mismatch makes source harder to recognize | Consistent product branding and explicit source/play mapping. Keep old URL; document approval-only future migration. |
| P1 | Dependency audit reports high-severity source-map-js advisory | Patch-only transitive upgrade; no remaining npm audit findings at execution. |
| P2 | No relative-path itch package, PR CI, contribution/issue workflow or release media | Local ZIP packaging and draft instructions; PR validation; real screenshots/video concept; tailored launch drafts. No publication. |
| P2 | Historic media provenance incomplete | Document uncertainty and verified new-media derivation; owner asset ledger remains required. No claim of guaranteed originality. |

No game content IDs, persisted profiles, stats schema or backend architecture changed. Existing engine/migration tests continue to cover ties, adjudication, abandoned sessions, corrupt input and failed writes. Default English and saved Italian remain supported. Bomba keeps its secret deadline and local audio; reduced motion remains respected.

## Discoverability boundaries

One static document serves every hash route. OG metadata exists in returned HTML; per-game fragments do not produce separate HTML/preview cards. Reddit, Discord, WhatsApp, Telegram, iMessage and Facebook may use/cache that shared image according to their own behavior. Actual platform delivery cannot be established before approved deployment and platform checks. No crawler API, dynamic server or extra SEO landing pages added. Protocol reference: [Open Graph](https://ogp.me/). Search rendering guidance: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

A project-level `robots.txt` would not control the origin-root robots policy, so use page-level index/follow metadata. Sitemap lists only the canonical root document; hashes are not separate pages. Structured data names a free game application with no fabricated reviews or ratings; rich-result display is not promised.

## Remaining limits / next priorities

1. Owner: smoke-test installed iOS/Android apps and platform previews after approving deployment. Browser cache eviction and first-ever offline visits cannot be prevented by this static client.
2. Owner: record original asset/content provenance and permissions; correct or replace uncertain assets. Review any future distribution's corresponding source availability.
3. Future: optional user-controlled backup/restore before changing domains; no silent migrations across origins.
4. Future: physical-device and manual screen-reader QA. Automated axe/Chromium checks are evidence, not full WCAG certification.
5. Optional: batch roster entry and local QR sharing if players request them. Current individual profiles, replay and copy/native sharing stay simple.

See [progress and actual tests](launch-readiness.md), [KB QA](../kb/qa.md), and [naming/provenance decision](naming-and-provenance.md).
