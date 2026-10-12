# Pocket Circle launch readiness

## Recovery checkpoint — 2026-10-12

Working branch: `codex/public-launch`, based on `543c00b` (also current local `main` and `improvements`). Clean working tree before this mission; all current launch changes belong to this task. No stashes, additional worktrees, or attached PRs found during recovery. No reset, rename, merge, deployment, or outreach performed.

Three implementation subagents began sharing/UI, offline/build tooling, and public documentation. Their turns stopped at account usage limits; their uncommitted files remain preserved. Main agent is continuing implementation and review. Subagent completion is **not** verification.

## Verified baseline

- `npm ci`, `npm test` (16 files, 132 tests), `npm run build` passed outside sandbox. Sandbox blocks esbuild execution and server binding (`EPERM`).
- `npm audit` found a high-severity transitive `source-map-js` issue; patch updated lockfile, audit now reports zero vulnerabilities.
- Existing storage database/store/key, five supported session discriminants (including retired Stessa Onda), bilingual content, and score recording reviewed. No schema migration planned.
- README incorrectly lists three games including Stessa Onda. Actual catalog: Impostore, Bomba, Chi sono?, Twit.
- New SEO acceptance tests failed all three cases against original HTML: missing canonical/social metadata, structured content, and sitemap.

## In progress

- Preserve `/ImpostorGame/` and all old hash routes; add safe `#game/<id>` sharing/setup links.
- Native sharing, clipboard/manual fallback, keyboard/dialog focus restoration, faster Impostore setup.
- Build-generated atomic offline precache; wait for existing tabs to close before activating updates; never touch IndexedDB.
- Static social metadata and real screenshots; one canonical preview for fragment routes.
- README/contribution/issue templates, CI validation, marketing drafts, relative-path itch build.

## Remaining acceptance work

1. Inspect and finish all partial code; record functional red/green evidence.
2. Generate icons; validate production asset paths and service worker.
3. Browser tests: mobile/desktop, all four completed game flows, secret privacy, persistence, sharing/focus, offline reload/gameplay, update lifecycle.
4. Real screenshots/social preview and authentic recording; verify documents and licensing/provenance limits.
5. Reproducible final install/tests/build/diff checks; itch ZIP validation.
6. Coherent commits, push branch, open PR; never merge/deploy.

## Owner decisions / limitations

- Repository rename or custom domain needs explicit approval and a compatibility plan. Keep published URL now.
- Physical iOS/Android installation and platform preview caches require owner smoke checks after approved deployment.
- No analytics: global most-played game is unknown. Local stats do not establish public popularity.
- Artwork provenance cannot be inferred solely from filenames or license declaration; document uncertainty, do not claim exclusive originality.

## Code milestone — 2026-10-12

- Recovered and finished subagent work; 148 Vitest tests pass. Production and itch builds ran successfully after icons were generated.
- Real red evidence: original dialog avatar choice focuses name; closing loses opener focus; archived baseline downloaded 1,790,009 bytes for redundant cover. Persisted browser regression failed against original UI.
- Additional real red evidence: production startup changed a supported old 3-attempt Impostore session to 2; delayed-save regression left secret word visible after Hide and Pass; mobile QA found Change categories target under 44px. Small fixes applied, green verification pending.
- Added Playwright as a development-only dependency so browser regressions are reproducible. No shipped runtime dependency added.
- Offline worker precaches complete build with content version, waits for old tabs to close, removes scoped old caches, and deletes a failed-install cache. No skipWaiting, clients.claim, forced reload, or private-data HTTP caching.
- `docs/naming-and-provenance.md` records safe URL decision, future migration plan and honest historic asset provenance gaps.

## Verification milestone — 2026-10-12

- `npm run test:browser` passed: avatar keyboard focus, Escape/opener return, saved selection focus, supported legacy session limits, synchronous secret concealment during slow save.
- Real worker lifecycle test passed: B waits while A has an active session, activates after clients close, removes A cache, opens B offline with unchanged full IndexedDB snapshot; broken C download fails without replacing B or leaving partial cache.
- Offline reload caught `Vary: Origin` on module requests versus precache requests; fixed matching of public, versioned precached assets with `ignoreVary`. Full four-game offline QA still in progress.
- No global usage ranking claimed; no analytics or third-party runtime service introduced.
