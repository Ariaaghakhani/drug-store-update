# composables/

## Purpose
Shared Composition API logic for the pharmacy storefront's user panel area: role-based dashboard data fetching (customer/admin/owner), navigation/tab config per role, a toast-notification wrapper, a role-permission updater, and Persian (`fa-IR`) number/currency formatting helpers.

## Key files
- `useAdminDashboard.js` — wired (Phase 6) to BACK's real `DashboardController` via [`services/api/analytics.js`](../services/api/CLAUDE.md): `summary` (`getDashboardSummary`), `lowStock` (`getLowStock`), `expiringGoods` (`getExpiringGoods`). Order queue and prescription review queue have no BACK endpoint — left as TODO comments, intentionally unimplemented.
- `useAppToast.ts` — wraps Nuxt UI's `useToast()`, adding `success`/`error`/`info`/`warning` helpers with preset colors/icons.
- `useCustomerDashboard.js` — returns mocked customer dashboard data (stats, orders, reminders, prescriptions, reorder items) via `useAsyncData`, all hardcoded fixtures with Persian strings/digits. **Intentionally left mocked** — no customer-scoped dashboard endpoint exists in BACK; see `FRONTEND_API_TODO.md`.
- `useFormat.js` — pure formatting helpers for counts, prices, thousands, and days, all using `fa-IR` locale.
- `useOwnerDashboard.js` — partially wired (Phase 6): `userActivityChart` (`getUserActivityChart` — active/inactive **user** counts, not sales) and `categoryChart` (`getCategoryChart` — goods-**by-category counts**, not revenue). Revenue metrics, sales trends, top products, and staff activity have no BACK endpoint — left as TODO comments, intentionally unimplemented; see `FRONTEND_API_TODO.md`.
- `useUpdateRolePermission.ts` — updates a role's permission in [`stores/roles.ts`](../stores/CLAUDE.md) and calls a no-op `syncToApi` stub.
- `useUserPanelTabs.ts` — builds role-based panel navigation (customer/admin/owner) and route-access helpers, reading the current user's role from [`stores/user.js`](../stores/CLAUDE.md).

## Public surface
- `useAdminDashboard()` → `{ summary, summaryPending, lowStock, lowStockPending, expiringGoods, expiringGoodsPending }` — `summary` is `DashboardSummaryDTO`-shaped (`totalUsers, totalGoods, stockValueAtPurchasePrice, stockValueAtSalePrice, lowStockCount`), `lowStock`/`expiringGoods` are arrays per BACK's `LowStockDTO`/`ExpiringGoodsDTO`. No order-queue/prescription-review-queue fields (no BACK endpoint).
- `useAppToast()` → `{ ...toast, success(title, description?, icon?), error(title, description?, icon?), info(title, description?, icon?), warning(title, description?, icon?) }`.
- `useCustomerDashboard()` → `{ stats, statsPending, orders, ordersPending, reminders, remindersPending, prescriptions, prescriptionsPending, reorderItems, reorderPending }` — each data field is a `ref` from `useAsyncData`, each `*Pending` the matching loading-state ref.
- `useFormat()` → `{ formatCount(n), formatPrice(amount), formatThousands(amount), formatDays(n) }`.
- `useOwnerDashboard()` → `{ userActivityChart, userActivityChartPending, categoryChart, categoryChartPending }` — `userActivityChart` is `BarChartDTO`-shaped (`labels, values`; active/inactive **user** counts, not sales), `categoryChart` is `PieChartDTO`-shaped (`categoryIds, categories, counts`; goods-**by-category counts**, not revenue). No revenue/sales-trend/top-products/staff-activity fields (no BACK endpoint).
- `useUpdateRolePermission()` → `{ updatePermission(roleId, domain, action, value) }`.
- `useUserPanelTabs()` → `{ getUserRole(), getRoutesForRole(), getMenuItems(), hasAccessToRoute(path), getAccessiblePaths() }` — plain functions, not reactive refs.

## Data flow and dependencies
- `useUpdateRolePermission.ts` → [`stores/roles.ts`](../stores/CLAUDE.md) (`useRolesStore`, types `RolePermissions`/`Permission`); likely consumed by owner/admin roles-and-permissions UI under [`components/panel`](../components/panel/CLAUDE.md).
- `useUserPanelTabs.ts` → [`stores/user.js`](../stores/CLAUDE.md) (`useUserStore`, `currentUser?.role`); likely consumed by the panel layout/sidebar/nav shared across `/panel/*` pages — see [`layouts/CLAUDE.md`](../layouts/CLAUDE.md) and [`pages/panel/CLAUDE.md`](../pages/panel/CLAUDE.md).
- `useAppToast.ts` → Nuxt UI's global `useToast()`; used anywhere user feedback is needed.
- `useCustomerDashboard.js` has no store/API dependency currently — all data is inlined mock data. **Intentionally left mocked**: no customer-scoped dashboard endpoint exists anywhere in BACK; see `FRONTEND_API_TODO.md` (repo root) for the proposed shape.
- `useAdminDashboard.js` / `useOwnerDashboard.js` (Phase 6) → [`services/api/analytics.js`](../services/api/CLAUDE.md) (`$api.analytics`, via `useNuxtApp()`), each field backed by its own `useAsyncData` call, following `useCustomerDashboard.js`'s `{data, pending}`-pair pattern. Consumed by [`components/dashboard/admin/AdminDashboard.vue`](../components/dashboard/CLAUDE.md) and [`components/dashboard/owner/OwnerDashboard.vue`](../components/dashboard/CLAUDE.md).
- `useFormat.js` is a leaf utility with no dependencies, used throughout panel/dashboard/product UI for Persian-formatted prices, counts, and day counts.
- `useCustomerDashboard` (mocked) and `useUpdateRolePermission`'s `syncToApi` (no-op stub) remain the only "API" paths in this module with no real backend call — everything else now calls into `services/api/*`.

## Gotchas
- **TS/JS drift**: the project reverted from TypeScript to JavaScript (commit `209e98b`, "Revert from TS to JS"), but `useAppToast.ts`, `useUpdateRolePermission.ts`, and `useUserPanelTabs.ts` were never converted and remain `.ts`. Same drift exists in [`stores/roles.ts`](../stores/CLAUDE.md). Any code depending on their type exports (`RolePermissions`, `Permission`, `RouteItem`, `UserRole`) is coupled to that lingering TS surface.
- `useUserPanelTabs.ts` has a stale header comment reading `// composables/useUserPanelTabs.js (or .ts)`, suggesting the extension was never finalized.
- `getUserRole()` defaults to `'admin'` (not `'customer'`) when the user's role is missing/invalid — can over-grant admin-style nav items to unauthenticated/malformed sessions.
- `useAdminDashboard`/`useOwnerDashboard` use `useAsyncData` without an error callback — if `$api.analytics.*` rejects (e.g. 401/403), the data `ref` stays `null` and `*Pending` resolves to `false`; components render the empty state, not an error state. No retry/toast on failure yet.
- `useFormat.js` always appends Persian unit suffixes (`تومان`, `هزار تومان`, `روز`) baked into the returned string — callers can't strip the unit or reuse the formatter for non-Toman contexts.
- `useUpdateRolePermission`'s `syncToApi` is an empty async no-op — permission updates are currently applied only optimistically to the local Pinia store, with no real backend persistence yet.
- `useCustomerDashboard.js` mock data mixes real numbers (`createdAt` Unix timestamps) with pre-formatted Persian display strings (`date`, `trackingCode`) — consumers shouldn't assume every field is machine-formatted.

Last synced: 5c12c8d
