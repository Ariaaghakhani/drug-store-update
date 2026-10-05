# Integration Plan — Daro Plus (FRONT)

State root: `.claude/integration/`. This file is the only one kept in context; see `log.md`, `checklists/`, `shared.md`, `sections/`.

## Phase checklist
- [x] Phase 1: LLM docs (started: 2026-10-06T00:00Z, PR #44)
- [~] Phase 2: Integration discovery (started: 2026-10-06T01:00Z)
- [ ] Phase 3: Integration loop

## Docs checklist (Phase 1 — one line per FRONT module)
- [x] root `CLAUDE.md` (updated index with all 11 module links + Docs rule; fixed stale TypeScript-era conventions to reflect the TS→JS revert)
- [x] `components/` (top-level + `auth/` + `dashboard/{admin,customer,owner}`) → `components/CLAUDE.md`
- [x] `components/panel/` (`address/`, `orders/`, `products/`, `profile/`, `security/`, `users/`) → `components/panel/CLAUDE.md`
- [x] `composables/` → `composables/CLAUDE.md`
- [x] `stores/` → `stores/CLAUDE.md`
- [x] `layouts/` → `layouts/CLAUDE.md`
- [x] `middleware/` → `middleware/CLAUDE.md`
- [x] `pages/` (storefront: about, account, cart, index, login, medications) → `pages/CLAUDE.md`
- [x] `pages/panel/` (panel shell + sub-pages) → `pages/panel/CLAUDE.md`
- [x] `plugins/` → `plugins/CLAUDE.md`
- [x] `services/api/` → `services/api/CLAUDE.md`
- [x] `utils/` + `types/` (combined — small) → `utils/CLAUDE.md`
- [x] Automation: `.claude/hooks/docs-drift.sh` + Stop hook registration in `.claude/settings.json`
- [x] Automation: `.claude/commands/sync-docs.md` + baseline `.claude/docs-sync`
- [x] Automation: hook verified in isolated scratch repo (flags module code changed w/o doc update → exit 2; clears once doc updated → exit 0); no throwaway files left in the real repo
- [x] Commit, push `docs/llm-context`, open PR (task D) → https://github.com/Ariaaghakhani/drug-store-update/pull/44

## Task table (Phase 2/3 — populated during Phase 2)
| id | section | branch | status | PR | gaps |
|----|---------|--------|--------|----|------|

## Decisions to review
- Pre-existing `API_ENDPOINTS_SUMMARY.md` and `BACKEND_INTEGRATION.md` already exist at repo root (committed in `a5c0a70`, predates this run). Phase 2 should read these first and reconcile/fold into `shared.md` + `sections/*.md` rather than redoing that discovery from scratch — avoid duplicating work.
- Root `CLAUDE.md` currently documents a TypeScript-era convention ("TypeScript for all props, emits, and composable return types", `useXxx.ts` naming) that is stale: commit `209e98b` ("Revert from TS to JS") moved the codebase to plain JS, and `composables/` now has a mix of `.js`/`.ts` files. Treating this as inaccurate existing content per Phase 1 instructions ("keep existing content that is still accurate") — will correct it rather than preserve it.

## Needs Aria
(none yet)

## Copy of the Resume protocol section
1. `git checkout chore/integration-state && git pull` (create it from `<default>` if it doesn't exist). Read `plan.md` only. Run `gh auth status`.
2. Find the first phase item that isn't `[x]`.
3. For a task that is `[~]` or `in-progress`:
   - Check out its branch, run `git status` and `git log <default>..HEAD`, and read its checklist.
   - Reconcile: items whose results already exist become `[x]`. Keep uncommitted changes.
   - Dispatch a subagent with the resume brief to continue from the first item not `[x]`.
4. For your own steps (commit, push, PR, docs commit), reconcile against git and gh state, then continue.
