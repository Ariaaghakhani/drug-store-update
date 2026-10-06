# components/panel/

## Purpose
Presentational building blocks for the pharmacist/admin panel ([`pages/panel/*`](../../pages/panel/CLAUDE.md)): cards, tables, filter bars, and multi-step modals for addresses, orders, products, users, profile, and security settings. Almost all components here are "dumb" (props in, events out) — pages own data, loading state, and persistence.

## Key files
**root** — `DeleteConfirmDialog.vue`: generic confirm-delete modal, reused by users/products pages.

**address/** — `AddressCard.vue` (single address row, edit/delete/set-default), `AddressFormModal.vue` (add/edit modal, own form state + province/city cascading select), `AddressListCard.vue` (wraps `AddressCard` list with skeleton/empty/add-CTA).

**orders/** — `CustomerOrders.vue` (customer order list, hardcoded local data), `OrdersManagement.vue` (admin order list with stats strip/status tabs, also hardcoded local data).

**products/** — `AddProductModal.vue` (create-product form, unused by `pages/panel/products/new.vue` which has its own inline form), `ProductImagesField.vue` (image upload via `FileReader` data URLs — kept as UI-only; its output is **not** sent to `createGoods`/`updateGoods`, BACK has no matching field on `GoodsDTO` for raw data-URLs, see `FRONTEND_API_TODO.md`), `ProductMetrics.vue` (KPI strip), `ProductsFilters.vue` (search + category `v-model`, now driven by real `filterGoods`/`listCategories` data), `ProductsTable.vue` (table with skeleton/empty states, near-expiry badges, `canUpdate`/`canDelete`-gated row actions; "موجودی" column renders a neutral "نامشخص" badge when `product.inStock` is `null`/`undefined` — `GoodsDTO` has no stock field, see `FRONTEND_API_TODO.md`).

**profile/** — `ChangePhoneModal.vue` (5-step OTP wizard, fully simulated), `EmailConfirmationModal.vue` (simulated verification link flow), `PersonalInfoEditModal.vue`, `UserContactDetails.vue`, `UserHeroCard.vue` (emits `avatar-change` with raw `File`), `UserInfoCard.vue`.

**security/** — `ActiveSessionsCard.vue`, `AuthMethodsCard.vue`, `ChangePasswordModal.vue` (4-step OTP + password-strength meter), `DangerZoneCard.vue`, `LoginHistoryCard.vue`, `SecurityAlertsCard.vue`, `TwoFAModal.vue`.

**users/** — `CreateUserModal.vue`, `EditUserModal.vue` (includes `UserPermissionsPanel`, reads `useRolesStore()` directly), `UserPermissionsPanel.vue` (3×4 permission-switch grid: users/products/orders × create/read/update/delete), `UsersFilters.vue`, `UsersTable.vue`.

## Public surface
- Every component uses plain `defineProps`/`defineEmits`; most follow `v-model:x` (`update:open`, `update:searchQuery`, etc.) rather than touching Pinia/composables internally.
- Only exception: `users/EditUserModal.vue` calls `useRolesStore()` directly to relabel `roleFa` on role change — the one panel component that reaches into global state itself.
- **No component in this module calls `services/api/*` directly.** All API/service calls happen one level up in `pages/panel/*.vue`:
  - `pages/panel/address.vue` → `app.$api.address.{getState,getCity,getAddresses,addAddress}` ([`services/api/panel/address.js`](../../services/api/CLAUDE.md)).
  - `pages/panel/products/{index,new,[id]}.vue` → real `services/api/goods.js`/`catalog.js` calls (`filterGoods`, `createGoods`, `updateGoods`, `getGoods`, `deleteGoods`, `getTags`, `listCategories`) via `useNuxtApp().$api`. No longer reads `useProductsStore()` / `stores/products.js` (now unused, kept as dead code — see [`stores/CLAUDE.md`](../../stores/CLAUDE.md)).
  - `pages/panel/users.vue` → `useRolesStore()` ([`stores/roles.ts`](../../stores/CLAUDE.md)) plus fully local mock user data.
  - `pages/panel/orders.vue`, `pages/panel/security.vue` → no store/API wiring; hardcoded local arrays/refs with simulated `setTimeout` latency.

## Data flow and dependencies
- [`composables/useUserPanelTabs.ts`](../../composables/CLAUDE.md) drives role-based nav/permission gating (`getUserRole`, `hasAccessToRoute`), read by `pages/panel/users.vue` and `products/index.vue` to compute `canCreate/canUpdate/canDelete`, passed down as props to `UsersTable`/`ProductsTable`/`UserPermissionsPanel`.
- [`stores/roles.ts`](../../stores/CLAUDE.md) holds the role→permission matrix consumed by `users.vue`, `products/index.vue`, `EditUserModal.vue`.
- `stores/products.js` (mock) is now unused dead code — `products/{index,new,[id]}.vue` get list/filter/CRUD data from `$api.goods`/`$api.catalog` instead; `stores/user.js` still supplies `currentUser` for address/profile pages.
- Page↔component mapping: `pages/panel/address.vue`↔`address/*`, `products/{index,new,[id]}.vue`↔`products/*`, `users.vue`↔`users/*`, `profile.vue`↔`profile/*`, `security.vue`↔`security/*`, `orders.vue`↔`orders/*`.

## Gotchas
- **Orders and security are still mocked**: nothing in `orders/*` or `security/*` hits a real endpoint yet — don't assume persistence when extending these.
- **Permission gating is prop-driven, not enforced in the component**: `ProductsTable`/`UsersTable` just hide/disable actions based on booleans passed in; real role→permission resolution lives in the parent pages. A component alone enforces nothing server-side.
- **Modal pattern**: all modals use Nuxt UI `UModal` with `v-model:open`, `dir="rtl"` + `font-dana` wrapper; destructive/cancel-mid-flow modals (`ChangePhoneModal`, `ChangePasswordModal`) have a secondary "cancel confirm" sub-state layered via nested `<Transition>` — closing via the X button doesn't always close immediately.
- **OTP step wizards** manage per-digit input refs manually (duplicated between `ChangePhoneModal` and `ChangePasswordModal` — no shared composable yet); copy the pattern carefully if adding new OTP flows.
- Tables use native `<table>` + Nuxt UI `UDropdownMenu` for row actions, not a shared data-table component; pagination state lives in the parent page, not in `ProductsTable`/`UsersTable`.
- **Products admin is now server-paginated** (`page`/`size`/`totalPages`/`totalElements` from `GoodsController./filter`'s `PageResponse`, 1-based page), not client-side sliced like the old mock — `ProductsTable`/`ProductsFilters` themselves are unchanged (still dumb props-in/events-out), only `pages/panel/products/index.vue`'s data layer changed.
- **`AddProductModal.vue` is not wired to `products/new.vue`** — that page has its own inline form (goodCode/nameFa/nameEn/brand/categoryIds/tagIds/price/expiryDate/images/isPrescriptionRequired fields posted straight to `createGoods`). Check before reusing `AddProductModal.vue` elsewhere; it still targets the old mock store shape.

Last synced: 5c12c8d
