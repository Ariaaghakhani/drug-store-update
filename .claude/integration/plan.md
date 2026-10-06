# Integration Plan — Daro Plus (FRONT)

State root: `.claude/integration/`. This file is the only one kept in context; see `log.md`, `checklists/`, `shared.md`, `sections/`.

## Phase checklist
- [x] Phase 1: LLM docs (started: 2026-10-06T00:00Z, PR #44)
- [x] Phase 2: Integration discovery (started: 2026-10-06T01:00Z, finished: 2026-10-06T02:00Z) — 9 tasks scoped, STOPPED HERE for plan approval per Aria's request. Do not start Phase 3 without explicit go-ahead.
- [~] Phase 3: Integration loop (started: 2026-10-06T03:00Z — Aria approved task 1 only, not the full loop; dispatching tasks one at a time with explicit go-ahead)

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
| 2 | product-detail-page | feat/api-2-product-detail-page | in-progress | — | possible stock-field question (not a hard gap) |
| 3 | panel-products-admin | feat/api-3-panel-products-admin | in-progress | — | same stock-field question as task 2 |
| 4 | panel-orders | feat/api-4-panel-orders | todo | — | no order stats/aggregate endpoint; status-axis decision needed first |
| 5 | panel-users-roles | feat/api-5-panel-users-roles | todo | — | **blocked**: needs UI redesign decision before implementation (see Decisions to review) |
| 6 | panel-dashboard | feat/api-6-panel-dashboard | pr-open | https://github.com/Ariaaghakhani/drug-store-update/pull/47 | owner dashboard revenue/sales/top-products/staff-activity; customer dashboard has no backend equivalent at all (both filed in FRONTEND_API_TODO.md) |
| 7 | profile-phone-change | feat/api-7-profile-phone-change | in-progress | — | none — full parity |
| 8 | security-password | feat/api-8-security-password | in-progress | — | sessions/2FA/login-history/alerts are backend gaps (4 TODO entries) |
| 9 | cart-checkout-payment | feat/api-9-cart-checkout-payment | in-progress | — | none — `payments.js` needs rewriting, not new backend work |

## Decisions to review
- Pre-existing `API_ENDPOINTS_SUMMARY.md` and `BACKEND_INTEGRATION.md` already exist at repo root (committed in `a5c0a70`, predates this run). ~~Phase 2 should read these first~~ — done: they turned out to be an aspirational/planned API surface written 2026-09-18/21, not verified against BACK source. Cross-checking against the real BACK controllers (Phase 2, this run) found they're significantly wrong in places (e.g. almost the entire `user.js`/`analytics.js`/`payments.js` path sets are guessed). Treat both root docs as historical context only, not ground truth — `services/api/CLAUDE.md` and the `sections/*.md` files now carry the verified contract.
- Root `CLAUDE.md` currently documents a TypeScript-era convention ("TypeScript for all props, emits, and composable return types", `useXxx.ts` naming) that is stale: commit `209e98b` ("Revert from TS to JS") moved the codebase to plain JS, and `composables/` now has a mix of `.js`/`.ts` files. Treating this as inaccurate existing content per Phase 1 instructions ("keep existing content that is still accurate") — corrected in PR #44.
- **`panel-users-roles` (task 5) is blocked on a design decision**: FRONT's `stores/roles.ts` + `UserPermissionsPanel.vue` model permissions as a fixed 3-domain × 4-action checkbox grid. BACK has no such model — its real mechanism (`EndpointPermissionController`/`RoleEndpointPermissionController`) grants roles access to specific HTTP endpoints, grouped by an open-ended `module` string (likely dozens of values). A literal "wire up the existing grid" is not possible; the UI needs to become a module-grouped endpoint-toggle list instead. **Needs Aria's call on how far to redesign this** before task 5 starts — flagged in sections/panel-users-roles.md too.
- **`panel-orders` (task 4) needs a status-axis decision**: BACK models order status as a per-tenant `Catalog` FK (no fixed enum, no human-readable string on the DTO) plus a separate `fulfillmentStatus` enum (`SHIPPED`/`READY_FOR_PICKUP`/`DELIVERED`/null) — two independent axes, neither matching FRONT's hardcoded `pending/processing/shipped/delivered/cancelled`. Needs a decision on which axis (or both) the UI should filter/display before implementation.

## Needs Aria
1. **Task 5 (panel-users-roles) redesign direction** — see Decisions to review. Options roughly: (a) rebuild `UserPermissionsPanel` as a module-grouped endpoint-toggle list matching BACK exactly, (b) keep a simplified grid but map it onto a curated subset of modules/endpoints chosen up front, or (c) punt — leave this task last/lowest priority. Need your call before task 5's branch starts.
2. **Task 4 (panel-orders) status-axis decision** — show BACK's catalog-driven payment status, the `fulfillmentStatus` enum, or both, in the orders UI? Affects `CustomerOrders.vue`/`OrdersManagement.vue`'s filter options.
3. **7 backend gaps found** (full detail in `shared.md` "Known backend gaps" + each section's "Known gaps"): admin order stats/aggregate endpoint; owner-dashboard revenue/sales/top-products/staff-activity; customer-scoped dashboard; self-service session list/revoke; 2FA; login history; security alerts. These become `FRONTEND_API_TODO.md` entries once Phase 3 tasks reach them — nothing to act on yet, just flagging scope.
4. **Stock/availability field** for simple (non-variant) goods isn't on `GoodsDTO` at all (tasks 2 and 3) — worth a quick check with whoever owns BACK on whether that's intentional or missing before those tasks build UI around it.

## Copy of the Resume protocol section
1. `git checkout chore/integration-state && git pull` (create it from `<default>` if it doesn't exist). Read `plan.md` only. Run `gh auth status`.
2. Find the first phase item that isn't `[x]`.
3. For a task that is `[~]` or `in-progress`:
   - Check out its branch, run `git status` and `git log <default>..HEAD`, and read its checklist.
   - Reconcile: items whose results already exist become `[x]`. Keep uncommitted changes.
   - Dispatch a subagent with the resume brief to continue from the first item not `[x]`.
4. For your own steps (commit, push, PR, docs commit), reconcile against git and gh state, then continue.
