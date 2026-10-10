# Integration Plan — Daro Plus (FRONT)

State root: `.claude/integration/`. This file is the only one kept in context; see `log.md`, `checklists/`, `shared.md`, `sections/`.

## Phase checklist
- [x] Phase 1: LLM docs (started: 2026-10-06T00:00Z, PR #44)
- [x] Phase 2: Integration discovery (started: 2026-10-06T01:00Z, finished: 2026-10-06T02:00Z) — 9 tasks scoped, STOPPED HERE for plan approval per Aria's request. Do not start Phase 3 without explicit go-ahead.
- [x] Phase 3: Integration loop (started: 2026-10-06T03:00Z, finished: 2026-10-07T00:30Z) — all 9 tasks have outcomes: 8 have open implementation PRs (#45, #47, #48, #49, #50, #51, #52, #54), task 5 deferred/documented only (#53). Aria is merging #44-53 (except #46) herself, PR by PR, checking mergeability between each.

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
| 1 | address-management | feat/api-1-address-management | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/45 | none — pure wiring + bug fixes |
| 2 | product-detail-page | feat/api-2-product-detail-page | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/49 | stock-field gap filed in FRONTEND_API_TODO.md |
| 3 | panel-products-admin | feat/api-3-panel-products-admin | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/52 | stock field, image upload, brand picker, CategoryScope update/delete -- 4 FRONTEND_API_TODO entries |
| 4 | panel-orders | feat/api-4-panel-orders | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/54 | OrderDocument missing fulfillmentStatus; no aggregate endpoint; no update endpoints -- 3 FRONTEND_API_TODO entries |
| 5 | panel-users-roles | feat/api-5-panel-users-roles | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/53 | deferred by Aria 2026-10-06 — documented, not implemented |
| 6 | panel-dashboard | feat/api-6-panel-dashboard | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/47 | owner dashboard revenue/sales/top-products/staff-activity; customer dashboard has no backend equivalent at all (both filed in FRONTEND_API_TODO.md) |
| 7 | profile-phone-change | feat/api-7-profile-phone-change | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/48 | none — full parity |
| 8 | security-password | feat/api-8-security-password | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/50 | sessions/2FA/login-history/alerts filed as 4 FRONTEND_API_TODO.md entries |
| 9 | cart-checkout-payment | feat/api-9-cart-checkout-payment | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/51 | none — `payments.js` rewritten, not new backend work |

## Decisions to review
- Pre-existing `API_ENDPOINTS_SUMMARY.md` and `BACKEND_INTEGRATION.md` already exist at repo root (committed in `a5c0a70`, predates this run). ~~Phase 2 should read these first~~ — done: they turned out to be an aspirational/planned API surface written 2026-09-18/21, not verified against BACK source. Cross-checking against the real BACK controllers (Phase 2, this run) found they're significantly wrong in places (e.g. almost the entire `user.js`/`analytics.js`/`payments.js` path sets are guessed). Treat both root docs as historical context only, not ground truth — `services/api/CLAUDE.md` and the `sections/*.md` files now carry the verified contract.
- Root `CLAUDE.md` currently documents a TypeScript-era convention ("TypeScript for all props, emits, and composable return types", `useXxx.ts` naming) that is stale: commit `209e98b` ("Revert from TS to JS") moved the codebase to plain JS, and `composables/` now has a mix of `.js`/`.ts` files. Treating this as inaccurate existing content per Phase 1 instructions ("keep existing content that is still accurate") — corrected in PR #44.
- **`panel-users-roles` (task 5) is blocked on a design decision**: FRONT's `stores/roles.ts` + `UserPermissionsPanel.vue` model permissions as a fixed 3-domain × 4-action checkbox grid. BACK has no such model — its real mechanism (`EndpointPermissionController`/`RoleEndpointPermissionController`) grants roles access to specific HTTP endpoints, grouped by an open-ended `module` string (likely dozens of values). A literal "wire up the existing grid" is not possible; the UI needs to become a module-grouped endpoint-toggle list instead. **Needs Aria's call on how far to redesign this** before task 5 starts — flagged in sections/panel-users-roles.md too.
- **`panel-orders` (task 4) needs a status-axis decision**: BACK models order status as a per-tenant `Catalog` FK (no fixed enum, no human-readable string on the DTO) plus a separate `fulfillmentStatus` enum (`SHIPPED`/`READY_FOR_PICKUP`/`DELIVERED`/null) — two independent axes, neither matching FRONT's hardcoded `pending/processing/shipped/delivered/cancelled`. Needs a decision on which axis (or both) the UI should filter/display before implementation.

## Needs Aria
1. ~~Task 5 redesign direction~~ — answered 2026-10-06: deferred/documented, not implemented (PR #53).
2. ~~Task 4 status-axis decision~~ — answered 2026-10-06: show both axes (PR #54).
3. **Merge order** (in progress, Aria merging manually): #44 → #45 → #47 → #48 → #49 → #50 → #51 → #52 → #53 → #54, checking mergeability before each (per her request, excluding non-merging #46). `FRONTEND_API_TODO.md` collides as an independently-created new file across #47/#49/#50/#52/#53/#54 — expect a conflict on that one file each time one of these merges after another; keep the union of entries.
4. **~10 backend gaps total**, now all filed as `FRONTEND_API_TODO.md` entries across the PRs above (stock field, image/attachment upload, brand picker, CategoryScope update/delete, order aggregate endpoint, OrderDocument.fulfillmentStatus, order/order-item/invoice update endpoints, owner-dashboard revenue/sales/top-products/staff-activity, customer-scoped dashboard, self-service sessions/2FA/login-history/security-alerts, users/roles permission-UI redesign) — review and reconcile into one list once all PRs are merged, since right now they're split across several copies of the file.

## Final report
- **Docs (Phase 1)**: all 11 FRONT modules documented, drift hook verified working (both flag and clear paths) — PR #44.
- **Integration (Phase 2/3)**: 9 of 9 tasks have an outcome — 8 implementation PRs (#45, #47, #48, #49, #50, #51, #52, #54) plus 1 deferred/documented task (#53, panel-users-roles). No task left in `todo`/`blocked` state.
- **Pre-existing docs corrected**: `API_ENDPOINTS_SUMMARY.md`/`BACKEND_INTEGRATION.md` at repo root were found to be aspirational (written before BACK's real contract was verified) and significantly wrong in several domains — `services/api/CLAUDE.md` and the `sections/*.md` files now carry the verified contract instead.
- **FRONTEND_API_TODO.md entries**: ~10 across the PRs listed above (see item 4 in "Needs Aria").
- **Outstanding**: Aria merging #44–#54 (except #46) herself in dependency order, resolving the expected trivial `FRONTEND_API_TODO.md` conflicts along the way. Runtime verification of every endpoint (noted per-PR) still pending against a live backend.

## Copy of the Resume protocol section
1. `git checkout chore/integration-state && git pull` (create it from `<default>` if it doesn't exist). Read `plan.md` only. Run `gh auth status`.
2. Find the first phase item that isn't `[x]`.
3. For a task that is `[~]` or `in-progress`:
   - Check out its branch, run `git status` and `git log <default>..HEAD`, and read its checklist.
   - Reconcile: items whose results already exist become `[x]`. Keep uncommitted changes.
   - Dispatch a subagent with the resume brief to continue from the first item not `[x]`.
4. For your own steps (commit, push, PR, docs commit), reconcile against git and gh state, then continue.
