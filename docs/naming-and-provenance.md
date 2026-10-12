# Branding, URLs, and provenance

## Safe naming decision

Keep repository and published URL at `LucaSforza/ImpostorGame` and `https://lucasforza.github.io/ImpostorGame/`. Every public product surface calls the app **Pocket Circle** and names all four games. Source links, README, contribution notes, manifest, page metadata, preview image and marketing descriptions make the mapping explicit. Suggested repository description/topics are in [marketing/repository-presentation.md](../marketing/repository-presentation.md); no account settings changed.

GitHub redirects repository links after a rename, but explicitly excludes project-site URLs. Do not assume existing Reddit links or installed PWAs will redirect. See [GitHub repository rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).

## Future owner-approved migration

1. Keep this published app at the old path while considering a Pocket Circle domain or repository name. Test a second deployment first; do not remove the working site.
2. If renaming the repository, arrange a real compatibility site at the old Pages path before changing public links. Reusing the old repository name destroys GitHub's repository redirects, so separate source-link redirects from Pages compatibility hosting. A new custom domain is a new browser origin and cannot read the old origin's IndexedDB.
3. Provide explicit, user-initiated export/import before moving users to a new origin. A path-only change on `lucasforza.github.io` keeps origin-scoped IndexedDB, but changes worker scope, manifest identity/start URL, install entries, and cached links. Preserve the old installed application until users choose to migrate; do not silently redirect its offline shell.
4. Update base path, canonical/share/sitemap URLs, manifest ID/scope, service-worker cache prefix, icons, docs and promoted links together. Test old and new bookmarks, saves, offline startup, updates and installed app entry points. Keep old URL working long-term.
5. Retire old caches only in their own scope and after replacement works. Never delete IndexedDB as part of URL migration. Recheck indexing and social preview caches after approved deployment.

GitHub recommends considering a custom domain before renaming a Pages repository. Domain verification, DNS, source availability and stored-data migration need owner decisions. Nothing in this PR renames a repository or configures a domain. [Custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).

## Quality and provenance

This launch work uses AI assistance for code, documentation and test implementation. Main agent reviewed subagent changes and executed the listed checks; neither AI assistance nor test counts guarantee correctness or originality. No testimonials or public usage figures were invented. We cannot answer which game is most played globally: the app intentionally has no telemetry.

Application source declares `AGPL-3.0-or-later` and includes its full license. New icons derive from the existing vector favicon; new screenshots and recordings capture the actual app with fictional QA profiles. Social preview composes those real screenshots with factual text. No externally sourced artwork, fonts, runtime scripts or media were added by this launch change.

Existing raster avatars, game/category artwork and bilingual decks lack a complete per-asset author/source/license ledger in the recovered repository. The repository license is evidence of the maintainer's distribution intent, not proof of each asset's provenance or legal exclusivity. Owner should document asset creation tools, authors, input sources and applicable terms; replace assets if permissions cannot be established. Do not claim all art is human-only, all AI-generated, or necessarily original. Characters and factual trivia may refer to third-party names; this work does not assert ownership of those names.

Development tools remain outside the shipped app. Installed dependency licenses can be inspected via each package's `package.json`/license file and the lockfile. Launch dependency inventory: TypeScript Apache-2.0; Vite and Vitest MIT; fake-indexeddb Apache-2.0; axe-core MPL-2.0 and Playwright Apache-2.0 (development browser QA only); remaining transitive packages retain their own notices. This inventory is engineering evidence, not a blanket legal warranty. A full historic media/content provenance audit remains an owner task.

The itch ZIP includes `LICENSE` and a source-repository notice with its build commit. When publishing, provide corresponding source for the exact uploaded build; retain the commit or attach a source archive. Do not upload binaries without the source link.
