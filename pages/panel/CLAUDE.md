# pages/panel/

Covers `pages/panel.vue` (the panel shell route) and everything under `pages/panel/`. See [`pages/CLAUDE.md`](../CLAUDE.md) for the storefront pages.

## Purpose
`pages/panel.vue` is the shell/layout route for the pharmacist/admin/customer panel: sidebar (desktop) / bottom-nav + slide-up menu (mobile), profile banner, logout, dark-mode toggle, hosting `<NuxtPage />` for all child routes. Auth-gated and role-gated: depending on role (`customer`, `admin`, `owner`), different nav items and page content show. The one app area serving three audiences (self-service customer account pages, admin/owner-only management for users/products/orders) from the same route tree.

## Key files
- `/panel` — `pages/panel.vue` — shell layout: sidebar/bottom-nav, profile banner, logout, color-mode toggle, role-based menu via `useUserPanelTabs`; redirects bare `/panel` to `/panel/dashboard`.
- `/panel/dashboard` — `dashboard.vue` — picks `AdminDashboard`/`OwnerDashboard`/`CustomerDashboard` by role.
- `/panel/orders` — `orders.vue` — `CustomerOrders` for role `customer`, else `OrdersManagement`.
- `/panel/products` — `products/index.vue` — product list/table with metrics, filters, pagination; permission-gated create/edit/delete.
- `/panel/products/new` — `products/new.vue` — create-product form; guarded by `products.create` permission.
- `/panel/products/[id]` — `products/[id].vue` — edit-product form; guarded by `products.update` permission.
- `/panel/address` — `address.vue` — customer address book, with real API calls for provinces/cities/list.
- `/panel/profile` — `profile.vue` — personal info, contact details, avatar — all client-mocked.
- `/panel/security` — `security.vue` — password/2FA, sessions, login history, security alerts, danger zone — all client-mocked.
- `/panel/users` — `users.vue` — user management table; fully mocked in-memory list; permission-gated by `users.*`.

## Public surface
- `pages/panel.vue`: uses `useUserStore`, `useUserPanelTabs`, `useColorMode`, `useNuxtApp().$auth`, `useToast`. Sets `definePageMeta({ layout: 'panel' })` and its own inline client-side middleware (see Gotchas).
- `dashboard.vue` → [`components/dashboard/{admin,owner,customer}/*`](../../components/CLAUDE.md). None call `$api`/`useFetch` — all mock data.
- `orders.vue` → [`components/panel/orders/{CustomerOrders,OrdersManagement}.vue`](../../components/panel/CLAUDE.md). Unlike every other page in this folder, `orders.vue` passes no data down — both components fetch their own data directly via `$api.orders`/`$api.catalog` (see that module's CLAUDE.md for the dual-status wiring).
- `address.vue` → `components/panel/address/{AddressListCard,AddressFormModal}.vue`; calls `app.$api.address.*`.
- `profile.vue` → `components/panel/profile/{UserHeroCard,UserInfoCard,UserContactDetails,PersonalInfoEditModal,ChangePhoneModal,EmailConfirmationModal}.vue`.
- `security.vue` → `components/panel/security/{AuthMethodsCard,ActiveSessionsCard,LoginHistoryCard,SecurityAlertsCard,DangerZoneCard,ChangePasswordModal,TwoFAModal}.vue`.
- `users.vue` → `components/panel/users/{UsersFilters,UsersTable,CreateUserModal,EditUserModal}.vue` + `DeleteConfirmDialog.vue`; uses `useRolesStore`, `useUserPanelTabs().getUserRole`.
- `products/{index,new,[id]}.vue` → `components/panel/products/{ProductMetrics,ProductsFilters,ProductsTable,ProductImagesField}.vue`; uses `useProductsStore`, `useRolesStore`, `useUserPanelTabs`.

## Data flow and dependencies
- Real backend calls on `address.vue`, via `app.$api.address` ([`services/api/panel/address.js`](../../services/api/CLAUDE.md)): `getState()` → `GET /api/addresses/provinces`, `getCity(province)` → `POST /api/addresses/cities/by-province-id`, `getAddresses({data:{personId}})` → `POST /api/addresses/person`, `addAddress(config)` → `POST /api/addresses/create`. No update/delete endpoints exist — edit/delete/set-default are local-array mutations only.
- `orders.vue` itself makes no calls, but its two child components now do, directly: `CustomerOrders.vue` → `app.$api.orders.byPerson({data:{personId: userStore.currentUser.person.id}})` + `app.$api.catalog.getCatalogsByType({data:{type:'ORDER_STATUS'}})`; `OrdersManagement.vue` → `app.$api.orders.searchOrders`/`searchOrdersByStatus` (list + stats-tile counts) + the same catalog lookup. See [`components/panel/CLAUDE.md`](../../components/panel/CLAUDE.md) for the dual-status-axis details and known gaps.
- `dashboard.vue`, `profile.vue`, `security.vue`, `users.vue`, `products/*.vue` have **no `useFetch`/`useAsyncData`/`$api` calls at all** — fully driven by [`stores/{roles,products}`](../../stores/CLAUDE.md) seeded with mock data, or local component state with simulated latency.
- Role resolution: `useUserPanelTabs().getUserRole()` reads `userStore.currentUser?.role`, validated against `['customer','admin','owner']`, defaulting to `'admin'` if missing/invalid.
- `users.vue`/`products/*` branch on fine-grained CRUD permissions from `useRolesStore().roles` (5 roles: owner/admin/pharmacist/support/customer) matched against `getUserRole()`'s 3-role output — a model mismatch, see Gotchas.
- Middleware: [`middleware/panel-access.js`](../../middleware/CLAUDE.md) exists but is **not referenced by name** anywhere; `pages/panel.vue` instead defines its own inline middleware duplicating the same logic.

## Gotchas
- **Dev bypass everywhere**: every guard (`pages/panel.vue`'s inline middleware, `panel-access.js`, `auth.js`) short-circuits with `if (import.meta.dev) return` — in local dev, all auth/role checks are skipped and the panel is reachable unauthenticated.
- **Role model mismatch**: `useUserPanelTabs` only knows 3 roles (`customer`/`admin`/`owner`) for menu/route access, but `stores/roles.ts` defines 5 (adds `pharmacist`, `support`) with distinct permission sets used by `users.vue`/`products/*`. A `pharmacist`/`support` user falls through to `'admin'` for menu purposes while still getting pharmacist/support-level permission checks elsewhere.
- **Most "management" pages aren't wired to a backend**: `users.vue`, `security.vue`, `profile.vue` are pure client-side mock state. `address.vue` and `orders.vue`'s children talk to real endpoints; on `address.vue` edit/delete/default-setting still have no corresponding API methods, and on `orders.vue`'s children there's no update endpoint at all for orders (see `FRONTEND_API_TODO.md`).
- `products/new.vue`/`products/[id].vue` call `await navigateTo(...)` synchronously at `<script setup>` top level if the permission is false **at setup time** — a permission that becomes true later (async role load) won't retroactively show the form.
- `products/[id].vue`'s "not found" fallback compares `getById` with `String(id)`, so numeric/string route param mismatches are already handled.
- `users.vue` computes `canCreate/canUpdate/canDelete` once from the *viewer's own role* — no protection against a lower-privileged admin editing a higher-privilege (owner) user via `EditUserModal`.
- `pages/panel.vue` gates its whole panel UI behind `userStore.currentUser || isDev` inside `ClientOnly` — first-paint behavior differs meaningfully between dev and prod.

Last synced: 209e98b
