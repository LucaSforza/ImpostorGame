# Agent Instructions

Write correct, clear, maintainable code. Keep changes small and follow surrounding conventions. Explain tricky intent beside the implementation; avoid speculative abstractions, dead code, and permanent behavior flags. Keep public APIs narrow.

## Project knowledge and local skills

Read [kb/README.md](kb/README.md) before reviews and changes, then relevant KB pages. Code describes current behavior; [catalog design](kb/catalog-design.md) defines intended product boundaries. Keep affected KB pages current.

Use these repository-local skills; do not install them globally:

- [pocket-circle-kb](.agents/skills/pocket-circle-kb/SKILL.md): navigate KB, locate relevant implementation, and update project knowledge.
- [pocket-circle-new-game](.agents/skills/pocket-circle-new-game/SKILL.md): add games through rules, bilingual content, catalog, persistence, statistics, UI, and verification.

## Review and TDD

- The main agent performs review and diagnosis. Subagents may implement already diagnosed fixes; do not delegate review. When used, prefer Luna with high reasoning as requested by the project owner.
- Run existing tests first. Before fixing a bug, write a regression, run it against unchanged production code, and demonstrate the expected failure. Make the smallest fix and rerun it. Record concrete red/green evidence; an assumption is not a reproduced bug.
- Add meaningful tests for new behavior. Finish with `npm test`, `npm run build`, and `git diff --check`. Use [kb/qa.md](kb/qa.md) for relevant browser checks; distinguish checks performed from checks not performed.
- Editorial improvements are not functional bug fixes. Keep Italian/English wording natural, playful, coherent with the category, and easy to read aloud. Preserve stable IDs, comparable choices, and valid saved sessions when revising content.

## Safety

Never expose, log, or commit secrets or credentials. Validate inputs, handle errors explicitly, and prefer safe APIs. Preserve local profiles, statistics, and active sessions across supported updates. Do not silently swallow errors.

## Tools and communication

Use FFF MCP for all file searches. Read known paths directly. If FFF is unavailable, report the limitation and use a narrow fallback.

Be concise and direct. Reference paths and line numbers for findings. Report changes, proof, and unverified behavior. Do not publish or deploy unless requested.
