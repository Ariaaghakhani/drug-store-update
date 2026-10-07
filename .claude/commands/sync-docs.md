Sync module `CLAUDE.md` docs with code that changed since the last sync.

1. Read `.claude/docs-sync` for the last-synced commit sha. If the file doesn't exist, treat the last sync point as the repo's first commit (full history).
2. Run `git diff --name-only <last-sha> HEAD` plus `git status --porcelain` for uncommitted changes, to get the full changed-file list.
3. Map each changed file to its module doc using the same rules as `.claude/hooks/docs-drift.sh`:
   - `components/panel/*` → `components/panel/CLAUDE.md`
   - `components/*` (else) → `components/CLAUDE.md`
   - `composables/*` → `composables/CLAUDE.md`
   - `stores/*` → `stores/CLAUDE.md`
   - `layouts/*` → `layouts/CLAUDE.md`
   - `middleware/*` → `middleware/CLAUDE.md`
   - `pages/panel.vue` and `pages/panel/*` → `pages/panel/CLAUDE.md`
   - `pages/*` (else) → `pages/CLAUDE.md`
   - `plugins/*` → `plugins/CLAUDE.md`
   - `services/*` → `services/api/CLAUDE.md`
   - `utils/*`, `types/*` → `utils/CLAUDE.md`
   - Anything else (root config, `assets/`, `scripts/`, etc.) → no module doc required.
4. For each affected module doc: re-read the changed files in that module, and update the doc's Key files / Public surface / Data flow / Gotchas sections to match current reality. Don't rewrite sections that are still accurate. Update the `Last synced: <sha>` line at the bottom to the current `HEAD` sha.
5. If a module folder is new (first file under a prefix with no existing `CLAUDE.md`), create its `CLAUDE.md` following the structure in the other module docs, and add it to the index in the root `CLAUDE.md` under "## Module docs".
6. If a module folder was removed or renamed, remove or update its doc and its index entry in the root `CLAUDE.md`.
7. Write the current `HEAD` commit sha to `.claude/docs-sync` (create the file if needed, no trailing content other than the sha).
8. Report which docs were updated, created, or removed, and the new sha.
