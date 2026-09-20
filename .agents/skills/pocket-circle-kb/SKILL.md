---
name: pocket-circle-kb
description: Navigate and maintain this repository's Pocket Circle knowledge base before code review, bug fixes, game changes, localization, persistence, or QA work. Use for project knowledge here, not general documentation search.
---

# Navigate the Pocket Circle KB

Paths below are relative to the repository root. Start with `AGENTS.md` and `kb/README.md`, then follow only relevant pages and links.

| Question | Read | Verify against |
| --- | --- | --- |
| Product boundaries, profiles, appearance | `kb/catalog-design.md` | `src/catalog.ts`, `src/main.ts`, `src/style.css` |
| Screens, state, modules, startup | `kb/architecture.md` | `src/main.ts`, `src/router.ts` |
| Rules, limits, winners, rematches | `kb/game-rules.md` | `src/game.ts`, `src/bomb.ts`, `src/same-wave.ts`, corresponding tests |
| Reload, data loss, migrations, statistics | `kb/indexeddb.md` | `src/db.ts`, `src/stats.ts`, `tests/db.test.ts`, `tests/review.test.ts` |
| Translations, categories, content | `kb/language.md` | `src/i18n.ts`, `src/words.ts`, `src/bomb-content.ts`, `src/same-wave-content.ts` |
| Release checks and earlier evidence | `kb/qa.md` | `package.json`, `tests/`, current test/browser results |

Code describes current behavior; `kb/catalog-design.md` states intended product behavior. Identify disagreements and test them before choosing whether to fix code or documentation. Historical QA applies to its dated revision, not the current tree.

Use FFF MCP `find_files` for unknown paths, `grep` for a known identifier, and `multi_grep` for related identifiers. Read returned files before refining searches. Read known paths directly; avoid repository-wide dumps. If FFF is unavailable, report that and use a narrow fallback.

For fixes, run existing tests, add and run a regression demonstrating the defect before production edits, then verify the fix. The main agent owns review and diagnosis; authorized subagents may implement already diagnosed fixes, not perform the review.

Update the KB page owning the changed contract; link new pages from `kb/README.md`. Keep details in one place. Record actual automated/browser checks in `kb/qa.md`, distinguishing them from checks not performed. Cite paths and line numbers for findings.
