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
- `orders.vue` → [`components/panel/orders/{CustomerOrders,OrdersManagement}.vue`](../../components/panel/CLAUDE.md).
- `address.vue` → `components/panel/address/{AddressListCard,AddressFormModal}.vue`; calls `app.$api.address.*`.
- `products/{index,new,[id]}.vue` now also call `app.$api.goods.*`/`app.$api.catalog.*` directly (see below) — no longer only `address.vue` talking to a real backend.
- `profile.vue` → `components/panel/profile/{UserHeroCard,UserInfoCard,UserContactDetails,PersonalInfoEditModal,ChangePhoneModal,EmailConfirmationModal}.vue`.
- `security.vue` → `components/panel/security/{AuthMethodsCard,ActiveSessionsCard,LoginHistoryCard,SecurityAlertsCard,DangerZoneCard,ChangePasswordModal,TwoFAModal}.vue`.
- `users.vue` → `components/panel/users/{UsersFilters,UsersTable,CreateUserModal,EditUserModal}.vue` + `DeleteConfirmDialog.vue`; uses `useRolesStore`, `useUserPanelTabs().getUserRole`.
- `products/{index,new,[id]}.vue` → `components/panel/products/{ProductMetrics,ProductsFilters,ProductsTable,ProductImagesField}.vue`; uses `useNuxtApp().$api.{goods,catalog}`, `useRolesStore`, `useUserPanelTabs`. **No longer uses `useProductsStore()`** — `stores/products.js` is unused dead code as of Phase 3.

## Data flow and dependencies
- Real backend calls on `address.vue`, via `app.$api.address` ([`services/api/panel/address.js`](../../services/api/CLAUDE.md)): `getState()` → `GET /api/addresses/provinces`, `getCity(province)` → `POST /api/addresses/cities/by-province-id`, `getAddresses({data:{personId}})` → `POST /api/addresses/person`, `addAddress(config)` → `POST /api/addresses/create`. No update/delete endpoints exist — edit/delete/set-default are local-array mutations only.
- Real backend calls on `products/{index,new,[id]}.vue`, via `app.$api.goods`/`app.$api.catalog` ([`services/api/CLAUDE.md`](../../services/api/CLAUDE.md)): `index.vue` → `filterGoods` (`POST /api/goods/filter`, 1-based `page`/`size`, response `PageResponse{content,totalElements,totalPages,page,size}`) + `listCategories` (`GET /api/categories?scope=PRODUCT`) for the category filter dropdown, `deleteGoods` (`POST /api/goods/delete`) on row delete. `new.vue`/`[id].vue` → `createGoods`/`updateGoods`/`getGoods` (`POST /api/goods/{create,update,get}`) plus `listCategories`/`getTags` (`GET /api/tags`) to populate `categoryIds`/`tagIds` `USelectMenu` multi-selects. `brandTitle` input is cosmetic only (not sent — no `brandId` picker wired, see `FRONTEND_API_TODO.md`); `ProductImagesField.vue`'s data-URLs are kept client-side only and not sent to either endpoint.
- `dashboard.vue`, `orders.vue`, `profile.vue`, `security.vue`, `users.vue` have **no `useFetch`/`useAsyncData`/`$api` calls at all** — fully driven by [`stores/roles`](../../stores/CLAUDE.md) seeded with mock data, or local component state with simulated latency. `stores/products.js` is now unused dead code.
- Role resolution: `useUserPanelTabs().getUserRole()` reads `userStore.currentUser?.role`, validated against `['customer','admin','owner']`, defaulting to `'admin'` if missing/invalid.
- `users.vue`/`products/*` branch on fine-grained CRUD permissions from `useRolesStore().roles` (5 roles: owner/admin/pharmacist/support/customer) matched against `getUserRole()`'s 3-role output — a model mismatch, see Gotchas.
- Middleware: [`middleware/panel-access.js`](../../middleware/CLAUDE.md) exists but is **not referenced by name** anywhere; `pages/panel.vue` instead defines its own inline middleware duplicating the same logic.

## Gotchas
- **Dev bypass everywhere**: every guard (`pages/panel.vue`'s inline middleware, `panel-access.js`, `auth.js`) short-circuits with `if (import.meta.dev) return` — in local dev, all auth/role checks are skipped and the panel is reachable unauthenticated.
- **Role model mismatch**: `useUserPanelTabs` only knows 3 roles (`customer`/`admin`/`owner`) for menu/route access, but `stores/roles.ts` defines 5 (adds `pharmacist`, `support`) with distinct permission sets used by `users.vue`/`products/*`. A `pharmacist`/`support` user falls through to `'admin'` for menu purposes while still getting pharmacist/support-level permission checks elsewhere.
- **Most "management" pages aren't wired to a backend**: `users.vue`, `security.vue`, `profile.vue` are pure client-side mock state. `address.vue` and `products/*` talk to real endpoints; `address.vue` still has no update/delete/default-setting API methods.
- `products/new.vue`/`products/[id].vue` call `await navigateTo(...)` synchronously at `<script setup>` top level if the permission is false **at setup time** — a permission that becomes true later (async role load) won't retroactively show the form.
- `products/[id].vue`'s "not found" state is now driven by `loading`/`product` refs from `getGoods` (shows "محصول یافت نشد" once the fetch settles with no product), not a `String(id)` comparison against a mock store.
- **`GoodsDTO` has no stock-availability field and no accepted image/attachment-upload field** (see `FRONTEND_API_TODO.md`): `ProductsTable`'s "موجودی" column shows a neutral "نامشخص" badge instead of fabricating true/false, and `ProductImagesField.vue`'s picked images are never sent to `createGoods`/`updateGoods`.
- `goodCode` is required by BACK (`GoodsServiceImpl.save`, 400 if blank) but wasn't in the old mock form — `new.vue`/`[id].vue` now have an explicit "کد کالا" input and both submit buttons are disabled until it's non-empty.
- `users.vue` computes `canCreate/canUpdate/canDelete` once from the *viewer's own role* — no protection against a lower-privileged admin editing a higher-privilege (owner) user via `EditUserModal`.
- `pages/panel.vue` gates its whole panel UI behind `userStore.currentUser || isDev` inside `ClientOnly` — first-paint behavior differs meaningfully between dev and prod.

Last synced: 5c12c8d
