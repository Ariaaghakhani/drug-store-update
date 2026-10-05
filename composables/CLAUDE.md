# composables/

## Purpose
Shared Composition API logic for the pharmacy storefront's user panel area: role-based dashboard data fetching (customer/admin/owner), navigation/tab config per role, a toast-notification wrapper, a role-permission updater, and Persian (`fa-IR`) number/currency formatting helpers.

## Key files
- `useAdminDashboard.js` — stub; returns `{}`, only TODO comments for order queue, prescription review queue, inventory alerts.
- `useAppToast.ts` — wraps Nuxt UI's `useToast()`, adding `success`/`error`/`info`/`warning` helpers with preset colors/icons.
- `useCustomerDashboard.js` — returns mocked customer dashboard data (stats, orders, reminders, prescriptions, reorder items) via `useAsyncData`, all hardcoded fixtures with Persian strings/digits.
- `useFormat.js` — pure formatting helpers for counts, prices, thousands, and days, all using `fa-IR` locale.
- `useOwnerDashboard.js` — stub; returns `{}`, only TODO comments for revenue metrics, sales trends, top products, staff activity.
- `useUpdateRolePermission.ts` — updates a role's permission in [`stores/roles.ts`](../stores/CLAUDE.md) and calls a no-op `syncToApi` stub.
- `useUserPanelTabs.ts` — builds role-based panel navigation (customer/admin/owner) and route-access helpers, reading the current user's role from [`stores/user.js`](../stores/CLAUDE.md).

## Public surface
- `useAdminDashboard()` → `{}` (placeholder; no fields yet).
- `useAppToast()` → `{ ...toast, success(title, description?, icon?), error(title, description?, icon?), info(title, description?, icon?), warning(title, description?, icon?) }`.
- `useCustomerDashboard()` → `{ stats, statsPending, orders, ordersPending, reminders, remindersPending, prescriptions, prescriptionsPending, reorderItems, reorderPending }` — each data field is a `ref` from `useAsyncData`, each `*Pending` the matching loading-state ref.
- `useFormat()` → `{ formatCount(n), formatPrice(amount), formatThousands(amount), formatDays(n) }`.
- `useOwnerDashboard()` → `{}` (placeholder; no fields yet).
- `useUpdateRolePermission()` → `{ updatePermission(roleId, domain, action, value) }`.
- `useUserPanelTabs()` → `{ getUserRole(), getRoutesForRole(), getMenuItems(), hasAccessToRoute(path), getAccessiblePaths() }` — plain functions, not reactive refs.

## Data flow and dependencies
- `useUpdateRolePermission.ts` → [`stores/roles.ts`](../stores/CLAUDE.md) (`useRolesStore`, types `RolePermissions`/`Permission`); likely consumed by owner/admin roles-and-permissions UI under [`components/panel`](../components/panel/CLAUDE.md).
- `useUserPanelTabs.ts` → [`stores/user.js`](../stores/CLAUDE.md) (`useUserStore`, `currentUser?.role`); likely consumed by the panel layout/sidebar/nav shared across `/panel/*` pages — see [`layouts/CLAUDE.md`](../layouts/CLAUDE.md) and [`pages/panel/CLAUDE.md`](../pages/panel/CLAUDE.md).
- `useAppToast.ts` → Nuxt UI's global `useToast()`; used anywhere user feedback is needed.
- `useCustomerDashboard.js` has no store/API dependency currently — all data is inlined mock data; likely intended for `/panel/dashboard` (customer role) once wired to a real `services/api` endpoint — see [`services/api/CLAUDE.md`](../services/api/CLAUDE.md).
- `useAdminDashboard.js` / `useOwnerDashboard.js` are stubs with no dependencies yet, presumably meant to parallel `useCustomerDashboard.js` once filled in.
- `useFormat.js` is a leaf utility with no dependencies, used throughout panel/dashboard/product UI for Persian-formatted prices, counts, and day counts.
- No file in this module calls into `services/api/*` yet — all "API" interaction is either mocked (`useCustomerDashboard`) or a no-op stub (`useUpdateRolePermission`'s `syncToApi`). This is a gap Phase 2 discovery should track.

## Gotchas
- **TS/JS drift**: the project reverted from TypeScript to JavaScript (commit `209e98b`, "Revert from TS to JS"), but `useAppToast.ts`, `useUpdateRolePermission.ts`, and `useUserPanelTabs.ts` were never converted and remain `.ts`. Same drift exists in [`stores/roles.ts`](../stores/CLAUDE.md). Any code depending on their type exports (`RolePermissions`, `Permission`, `RouteItem`, `UserRole`) is coupled to that lingering TS surface.
- `useUserPanelTabs.ts` has a stale header comment reading `// composables/useUserPanelTabs.js (or .ts)`, suggesting the extension was never finalized.
- `getUserRole()` defaults to `'admin'` (not `'customer'`) when the user's role is missing/invalid — can over-grant admin-style nav items to unauthenticated/malformed sessions.
- `useAdminDashboard` and `useOwnerDashboard` are pure stubs returning `{}` — not yet at parity with `useCustomerDashboard`'s shape; any component calling them today gets no data and no loading state.
- `useFormat.js` always appends Persian unit suffixes (`تومان`, `هزار تومان`, `روز`) baked into the returned string — callers can't strip the unit or reuse the formatter for non-Toman contexts.
- `useUpdateRolePermission`'s `syncToApi` is an empty async no-op — permission updates are currently applied only optimistically to the local Pinia store, with no real backend persistence yet.
- `useCustomerDashboard.js` mock data mixes real numbers (`createdAt` Unix timestamps) with pre-formatted Persian display strings (`date`, `trackingCode`) — consumers shouldn't assume every field is machine-formatted.

Last synced: 209e98b
