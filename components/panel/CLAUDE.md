# components/panel/

## Purpose
Presentational building blocks for the pharmacist/admin panel ([`pages/panel/*`](../../pages/panel/CLAUDE.md)): cards, tables, filter bars, and multi-step modals for addresses, orders, products, users, profile, and security settings. Almost all components here are "dumb" (props in, events out) — pages own data, loading state, and persistence.

## Key files
**root** — `DeleteConfirmDialog.vue`: generic confirm-delete modal, reused by users/products pages.

**address/** — `AddressCard.vue` (single address row, edit/delete/set-default), `AddressFormModal.vue` (add/edit modal, own form state + province/city cascading select), `AddressListCard.vue` (wraps `AddressCard` list with skeleton/empty/add-CTA).

**orders/** — `CustomerOrders.vue` (customer order list, hardcoded local data), `OrdersManagement.vue` (admin order list with stats strip/status tabs, also hardcoded local data).

**products/** — `AddProductModal.vue` (create-product form), `ProductImagesField.vue` (image upload via `FileReader` data URLs), `ProductMetrics.vue` (KPI strip), `ProductsFilters.vue` (search + category `v-model`), `ProductsTable.vue` (table with skeleton/empty states, near-expiry badges, `canUpdate`/`canDelete`-gated row actions).

**profile/** — `ChangePhoneModal.vue` (5-step OTP wizard, fully simulated), `EmailConfirmationModal.vue` (simulated verification link flow), `PersonalInfoEditModal.vue`, `UserContactDetails.vue`, `UserHeroCard.vue` (emits `avatar-change` with raw `File`), `UserInfoCard.vue`.

**security/** — `ChangePasswordModal.vue` (2-step: current+new password form with strength meter, then success — wired to real `POST api/auth/me/password`; OTP steps were dropped since BACK's `ChangePasswordRequest` only takes `currentPassword`/`newPassword`, no OTP). `ActiveSessionsCard.vue`, `AuthMethodsCard.vue`, `DangerZoneCard.vue`, `LoginHistoryCard.vue`, `SecurityAlertsCard.vue`, `TwoFAModal.vue` remain fully mocked — each carries a one-line note pointing at its `FRONTEND_API_TODO.md` entry; BACK has no session-list/revoke, 2FA, login-history, or security-alert-prefs endpoints.

**users/** — `CreateUserModal.vue`, `EditUserModal.vue` (includes `UserPermissionsPanel`, reads `useRolesStore()` directly), `UserPermissionsPanel.vue` (3×4 permission-switch grid: users/products/orders × create/read/update/delete), `UsersFilters.vue`, `UsersTable.vue`.

## Public surface
- Every component uses plain `defineProps`/`defineEmits`; most follow `v-model:x` (`update:open`, `update:searchQuery`, etc.) rather than touching Pinia/composables internally.
- Only exception: `users/EditUserModal.vue` calls `useRolesStore()` directly to relabel `roleFa` on role change — the one panel component that reaches into global state itself.
- **No component in this module calls `services/api/*` directly.** All API/service calls happen one level up in `pages/panel/*.vue`:
  - `pages/panel/address.vue` → `app.$api.address.{getState,getCity,getAddresses,addAddress}` ([`services/api/panel/address.js`](../../services/api/CLAUDE.md)).
  - `pages/panel/products/{index,new,[id]}.vue` → `useProductsStore()` ([`stores/products.js`](../../stores/CLAUDE.md)), not `services/api/products.js` directly.
  - `pages/panel/users.vue` → `useRolesStore()` ([`stores/roles.ts`](../../stores/CLAUDE.md)) plus fully local mock user data.
  - `pages/panel/orders.vue` → no store/API wiring; hardcoded local arrays/refs with simulated `setTimeout` latency.
  - `pages/panel/security.vue` → mostly hardcoded local arrays/refs with simulated `setTimeout` latency, except `ChangePasswordModal` which now calls `app.$api.auth.changePassword` directly and updates `$auth`/`userStore` via `app.$auth.setToken`/`setUser` on success (same pattern as `pages/login.vue::finalizeLogin`).

## Data flow and dependencies
- [`composables/useUserPanelTabs.ts`](../../composables/CLAUDE.md) drives role-based nav/permission gating (`getUserRole`, `hasAccessToRoute`), read by `pages/panel/users.vue` and `products/index.vue` to compute `canCreate/canUpdate/canDelete`, passed down as props to `UsersTable`/`ProductsTable`/`UserPermissionsPanel`.
- [`stores/roles.ts`](../../stores/CLAUDE.md) holds the role→permission matrix consumed by `users.vue`, `products/index.vue`, `EditUserModal.vue`.
- `stores/products.js` is the source of truth for product list/categories; `stores/user.js` supplies `currentUser` for address/profile pages.
- Page↔component mapping: `pages/panel/address.vue`↔`address/*`, `products/{index,new,[id]}.vue`↔`products/*`, `users.vue`↔`users/*`, `profile.vue`↔`profile/*`, `security.vue`↔`security/*`, `orders.vue`↔`orders/*`.

## Gotchas
- **Orders and most of security are still mocked**: nothing in `orders/*` hits a real endpoint; in `security/*` only `ChangePasswordModal.vue` is wired — don't assume persistence when extending the other 6 security components (see their in-file notes + `FRONTEND_API_TODO.md`).
- **Permission gating is prop-driven, not enforced in the component**: `ProductsTable`/`UsersTable` just hide/disable actions based on booleans passed in; real role→permission resolution lives in the parent pages. A component alone enforces nothing server-side.
- **Modal pattern**: all modals use Nuxt UI `UModal` with `v-model:open`, `dir="rtl"` + `font-dana` wrapper; destructive/cancel-mid-flow modals (`ChangePhoneModal`, `ChangePasswordModal`) have a secondary "cancel confirm" sub-state layered via nested `<Transition>` — closing via the X button doesn't always close immediately.
- **OTP step wizards** manage per-digit input refs manually in `ChangePhoneModal` (still simulated) — no shared composable yet; copy the pattern carefully if adding new OTP flows. `ChangePasswordModal` no longer has an OTP step (BACK's `/api/auth/me/password` doesn't require one).
- Tables use native `<table>` + Nuxt UI `UDropdownMenu` for row actions, not a shared data-table component; pagination state lives in the parent page, not in `ProductsTable`/`UsersTable`.

Last synced: feat/api-8-security-password
