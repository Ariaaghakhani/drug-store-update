# components/panel/

## Purpose
Presentational building blocks for the pharmacist/admin panel ([`pages/panel/*`](../../pages/panel/CLAUDE.md)): cards, tables, filter bars, and multi-step modals for addresses, orders, products, users, profile, and security settings. Almost all components here are "dumb" (props in, events out) — pages own data, loading state, and persistence.

## Key files
**root** — `DeleteConfirmDialog.vue`: generic confirm-delete modal, reused by users/products pages.

**address/** — `AddressCard.vue` (single address row, edit/delete/set-default), `AddressFormModal.vue` (add/edit modal, own form state + province/city cascading select), `AddressListCard.vue` (wraps `AddressCard` list with skeleton/empty/add-CTA).

**orders/** — `CustomerOrders.vue` (customer's own orders, real data via `$api.orders.byPerson`), `OrdersManagement.vue` (admin order list with stats strip/status tabs, real data via `$api.orders.searchOrders`/`searchOrdersByStatus`).

**products/** — `AddProductModal.vue` (create-product form), `ProductImagesField.vue` (image upload via `FileReader` data URLs), `ProductMetrics.vue` (KPI strip), `ProductsFilters.vue` (search + category `v-model`), `ProductsTable.vue` (table with skeleton/empty states, near-expiry badges, `canUpdate`/`canDelete`-gated row actions).

**profile/** — `ChangePhoneModal.vue` (5-step OTP wizard, fully simulated), `EmailConfirmationModal.vue` (simulated verification link flow), `PersonalInfoEditModal.vue`, `UserContactDetails.vue`, `UserHeroCard.vue` (emits `avatar-change` with raw `File`), `UserInfoCard.vue`.

**security/** — `ActiveSessionsCard.vue`, `AuthMethodsCard.vue`, `ChangePasswordModal.vue` (4-step OTP + password-strength meter), `DangerZoneCard.vue`, `LoginHistoryCard.vue`, `SecurityAlertsCard.vue`, `TwoFAModal.vue`.

**users/** — `CreateUserModal.vue`, `EditUserModal.vue` (includes `UserPermissionsPanel`, reads `useRolesStore()` directly), `UserPermissionsPanel.vue` (3×4 permission-switch grid: users/products/orders × create/read/update/delete), `UsersFilters.vue`, `UsersTable.vue`.

## Public surface
- Every component uses plain `defineProps`/`defineEmits`; most follow `v-model:x` (`update:open`, `update:searchQuery`, etc.) rather than touching Pinia/composables internally.
- Only exception: `users/EditUserModal.vue` calls `useRolesStore()` directly to relabel `roleFa` on role change — the one panel component that reaches into global state itself.
- **One exception to "components don't call `services/api/*` directly"**: `orders/CustomerOrders.vue` and `orders/OrdersManagement.vue` call `app.$api.orders.*`/`app.$api.catalog.getCatalogsByType` themselves (via `useNuxtApp()`) rather than receiving data as props from `pages/panel/orders.vue` — `pages/panel/orders.vue` stays a pure role-switch with no data of its own. Every other component here still follows the prop-in/event-out rule; API calls happen one level up in `pages/panel/*.vue`:
  - `pages/panel/address.vue` → `app.$api.address.{getState,getCity,getAddresses,addAddress}` ([`services/api/panel/address.js`](../../services/api/CLAUDE.md)).
  - `pages/panel/products/{index,new,[id]}.vue` → `useProductsStore()` ([`stores/products.js`](../../stores/CLAUDE.md)), not `services/api/products.js` directly.
  - `pages/panel/users.vue` → `useRolesStore()` ([`stores/roles.ts`](../../stores/CLAUDE.md)) plus fully local mock user data.
  - `pages/panel/security.vue` → no store/API wiring; hardcoded local arrays/refs with simulated `setTimeout` latency.

## Data flow and dependencies
- [`composables/useUserPanelTabs.ts`](../../composables/CLAUDE.md) drives role-based nav/permission gating (`getUserRole`, `hasAccessToRoute`), read by `pages/panel/users.vue` and `products/index.vue` to compute `canCreate/canUpdate/canDelete`, passed down as props to `UsersTable`/`ProductsTable`/`UserPermissionsPanel`.
- [`stores/roles.ts`](../../stores/CLAUDE.md) holds the role→permission matrix consumed by `users.vue`, `products/index.vue`, `EditUserModal.vue`.
- `stores/products.js` is the source of truth for product list/categories; `stores/user.js` supplies `currentUser` for address/profile pages.
- Page↔component mapping: `pages/panel/address.vue`↔`address/*`, `products/{index,new,[id]}.vue`↔`products/*`, `users.vue`↔`users/*`, `profile.vue`↔`profile/*`, `security.vue`↔`security/*`, `orders.vue`↔`orders/*`.

## Gotchas
- **Security is still mocked**; `orders/*` is now real (see above) — don't assume persistence for `security/*`.
- **Dual order-status display**: BACK models an order's payment/order status as a per-tenant `Catalog` row (`OrderDTO.statusId`, no fixed enum) and a separate orthogonal `fulfillmentStatus` enum (`SHIPPED`/`READY_FOR_PICKUP`/`DELIVERED`/`null`="در حال آماده‌سازی"). Both components show both axes where the data is available:
  - `CustomerOrders.vue` (`$api.orders.byPerson` → `OrderDTO[]`) resolves `statusId` → label itself via `$api.catalog.getCatalogsByType({data:{type:'ORDER_STATUS'}})` (`CatalogController`'s `/api/catalogs/by-type`, verified against BACK source — order-status rows are seeded with `type=ORDER_STATUS`, `code` ∈ `PENDING`/`PAID`/`FAILED`) and shows `fulfillmentStatus` as a second badge, since `OrderDTO` carries both fields.
  - `OrdersManagement.vue` (`$api.orders.searchOrders`/`searchOrdersByStatus` → `OrderDocument[]`) only shows the payment/order-status badge — `OrderDocument` (the Elasticsearch-backed search index) already has a resolved `status`/`statusCode` so no catalog lookup is needed there, but it has **no `fulfillmentStatus` field at all**, so that axis can't be shown in the admin list without an N+1 `getOrder` call per row (not done). See `FRONTEND_API_TODO.md` for the proposed fix (index `fulfillmentStatus` on `OrderDocument`).
- **No order aggregate endpoint**: `OrdersManagement.vue`'s stats strip gets real exact counts for "کل سفارشات" and per-status tiles by calling `searchOrders`/`searchOrdersByStatus` with `size:1` and reading `SearchResultDTO.totalElements` (not an estimate) — but there's no revenue-aggregate endpoint, so the revenue tile sums only the currently-loaded page and is labeled "جمع این صفحه" rather than implying a global total. See `FRONTEND_API_TODO.md`.
- **No update endpoint**: BACK has no `/update` route for orders, order-items, or invoices at all (confirmed against `OrderController`/`OrderItemController`/`InvoiceController`) — `services/api/orders.js`'s former `updateOrder`/`updateOrderItem`/`updateInvoice` wrappers (calling nonexistent routes) were removed. The "بررسی" button in `OrdersManagement.vue` has nowhere to navigate yet.
- **Permission gating is prop-driven, not enforced in the component**: `ProductsTable`/`UsersTable` just hide/disable actions based on booleans passed in; real role→permission resolution lives in the parent pages. A component alone enforces nothing server-side.
- **Modal pattern**: all modals use Nuxt UI `UModal` with `v-model:open`, `dir="rtl"` + `font-dana` wrapper; destructive/cancel-mid-flow modals (`ChangePhoneModal`, `ChangePasswordModal`) have a secondary "cancel confirm" sub-state layered via nested `<Transition>` — closing via the X button doesn't always close immediately.
- **OTP step wizards** manage per-digit input refs manually (duplicated between `ChangePhoneModal` and `ChangePasswordModal` — no shared composable yet); copy the pattern carefully if adding new OTP flows.
- Tables use native `<table>` + Nuxt UI `UDropdownMenu` for row actions, not a shared data-table component; pagination state lives in the parent page, not in `ProductsTable`/`UsersTable`.

Last synced: 209e98b
