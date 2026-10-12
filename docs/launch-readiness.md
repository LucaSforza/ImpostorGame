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

## Completed acceptance — 2026-10-12

- Full production Chromium run passed offline: all four games started and completed; cached reload concealed secrets and restored session; profiles, locale and per-game statistics survived refresh without double counting.
- Hash back/forward, game-specific setup, active-session precedence, native share/cancellation, successful clipboard and denied clipboard/manual URL passed. No private data in links.
- At 390×844, 320×740 and desktop 1280×900, document had no horizontal overflow and checked visible buttons were at least 44px. Reduced motion suppressed game entrance animation. Axe scans passed on catalog, four setups, stats, player/rules dialogs, Impostore reveal, Bomba live, Chi sono? identity view and Twit question/private form. One real prohibited-ARIA failure on reveal progress was fixed first. These checks do not certify full WCAG or physical screen-reader behavior.
- Network inspection found no gameplay fetch/XHR/WebSocket/EventSource or third-party request; no console/page errors in successful full run. Worker installation/update downloads static public assets only.
- Six real screenshots captured using fictional QA profiles. Social preview composed from real captures; no fabricated UI. Authentic silent recording generation in progress.

Next: final clean install/tests/build, final asset/itch checks and commits, branch push + PR. Public deployment, social posting and repository rename remain approval-only.

## Distribution milestone — 2026-10-12

- Authentic silent `marketing/recordings/pocket-circle-demo.webm` generated from actual app navigation with fictional players; raw footage and editing instructions provided. Recording files are local generated artifacts, not permanent source assets.
- `npm run package:itch` produced `dist-itch.zip`; static checks passed relative asset links, preview dimensions, manifest icon dimensions, valid JSON-LD, no itch manifest/worker, and included LICENSE/SOURCE.md. Source notice records build revision; rebuild from the final clean commit before publishing.
- Markdown local-link check passed. README/KB now describe all four games, install/cache limits, sharing, architecture, tests, deploy, license and contribution flow.
- Promotional drafts cover ten named Reddit communities, Product Hunt, Hacker News, itch.io, feedback replies and a video shot list. These are drafts only; current community rules must be checked before posting.

## Final local gates — 2026-10-12

- Final `npm ci`, `npm test` (18 files / 148 tests), `npm run build`, `npm run package:itch`, static asset/metadata validator and `npm audit` passed. Audit: zero reported vulnerabilities. `git diff --check` passed.
- Relative itch build browser smoke passed at 320×740: all four games started, shared roster survived reload, no manifest/service-worker registration, no missing assets/page errors. All four full-game offline flows were separately completed on Pages production preview.
- Full final media/offline acceptance run passed with `errors: []`; capture manifest records synthetic profiles and checks. No deployment or outreach performed.
- Local runtime used Node 24.15.0 and Chromium 151 via Playwright 1.62.1. CI is configured for Node 22 but its remote run is not yet verified; physical Safari/Android and manual screen-reader checks remain owner tasks.

## Delivery status

Commits: `4f22134` core implementation; `e614965` documentation/media; `391dbf9` final accessibility/validation. PR: https://github.com/LucaSforza/ImpostorGame/pull/1 (open, not merged). Generated `dist-itch.zip` and `marketing/recordings/pocket-circle-demo.webm` stay local and can be rebuilt. Source, screenshots, preview PNG, tests, guidance and drafts are committed; no user data is included.

Owner approval needed for merge/public deployment, repository metadata changes, itch.io publication, and promotional posting. Keep current URL; future rename/domain migration needs its own approval. Prioritized follow-ups: physical install/screen-reader/preview smoke checks; historic asset provenance ledger; optional user-controlled backup before any origin migration; optional QR/batch roster only if requested by players.

## Handoff

- Branch pushed: `codex/public-launch`. PR #1 created through the existing authenticated GitHub CLI after the connector returned 403 (integration lacked PR-write permission). PR attached to the Codex chat. No automatic merge/deploy.
- Final update-lifecycle check passed against completed build. Existing public Pages URL was read successfully (HTTP 200); new release is intentionally not deployed.
- `dist-itch.zip` rebuilt from clean committed code `391dbf9`; bundled SOURCE.md points to that exact corresponding source. Owner upload instructions in `marketing/itch-io.md`.
- Remote CI status must be read from the PR; local execution evidence above is independent of CI. Final handoff records any completed CI separately.

## CI follow-up — 2026-10-12

One Node 22 GitHub job passed; a parallel PR job failed the final 320px touch-target check. Local isolated reproduction confirmed that every failed element was detached (`isConnected=false`, `0×0`) after a hash route replaced the root between Playwright lookup and measurement. Actual controls were not undersized. Layout checks now select and measure atomically in one browser task, retain the 44px threshold, require visible controls, and exercise twenty route/viewport transitions. No production behavior changed for this CI fix. New local and CI verification follows.

Local green after CI fix: full offline acceptance (including twenty route/viewport transitions), 148 Vitest tests and diff check passed. Isolated red reproduced at transition 7 with all failing buttons detached. CI rerun requested by pushing the focused test fix; remote result is not yet asserted here.
