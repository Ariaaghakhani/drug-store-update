# utils/ and types/

## Purpose
`utils/` holds plain-JS helpers for client-side auth session cleanup and form-field validation (phone, national ID, registration form), used directly by Vue components and the Nuxt auth plugin. `types/` holds TypeScript-only interface definitions describing backend DTOs/API contracts and a couple of frontend-panel shapes (products, users) — reference/documentation types rather than active runtime code; nothing in the current `.js`/`.vue` source imports them.

## Key files
- `utils/auth.js` — exports `tokenGeneratedAtLocalStorageKey` (localStorage key constant) and `logoutAndResetAuthentication(app, opts)`, which calls the backend logout endpoint (swallowing errors) then resets `$auth` state.
- `utils/validations.js` — exports Persian-language validators: `validatePhoneNumber`, `isValidPhoneNumber`, `validateIranianNationalCode`, `validateRegisterForm`.
- `types/api.ts` — `interface` declarations modeling backend DTOs across every domain: auth, users/roles, products/goods, orders, payments, inventory, addresses, dashboard/analytics, tickets, reviews, blog, suppliers, patients/prescriptions, attachments, pagination, errors, cart.
- `types/panel-products.ts` — `interface Product`, a simplified product shape for the admin/storefront panel UI.
- `types/panel-users.ts` — `interface PanelUser` and `interface CreateUserForm`; imports `RolePermissions` from [`stores/roles`](../stores/CLAUDE.md).

## Public surface
- `utils/auth.js`: `tokenGeneratedAtLocalStorageKey`, `logoutAndResetAuthentication(app, { callLogout })`.
- `utils/validations.js`: `validatePhoneNumber(phoneNumber)`, `isValidPhoneNumber(phoneNumber)`, `validateIranianNationalCode(code)`, `validateRegisterForm(formData)`.
- `types/api.ts` key interfaces: `ApiResponse<T>`, `PageResponse<T>`, `LoginRequest`/`TokenResponse`/`RegisterRequest`, `UserDTO`/`PersonDTO`/`RoleDTO`/`PermissionDTO`, `GoodsDTO`/`CategoryDTO`/`TagDTO`/`ProductBatchDTO`, `OrderDTO`/`OrderItemDTO`/`InvoiceDTO`/`PurchaseOrderDTO`, `PaymentTransactionDTO`/`CheckoutResponse`, `InventoryDTO`/`WarehouseDTO`, `AddressDTO`/`ProvinceDTO`/`CityDTO`, `DashboardSummaryDTO`/`KpiDTO`/`BarChartDTO`/`PieChartDTO`, `TicketDTO`/`ReviewDTO`/`BlogPostDTO`/`ContactMessageDTO`, `SupplierDTO`/`OrganizationDTO`, `PatientDTO`/`PrescriptionDTO`, `AttachmentDTO`, `Cart`/`CartItem`, `ErrorResponse`.
- `types/panel-products.ts`: `Product` (id, bilingual name, price/discount/rating, stock, prescription flag).
- `types/panel-users.ts`: `PanelUser` (id, fullName, phone, roleId/roleFa, isActive, lastLoginFa, permissions), `CreateUserForm` (fullName, phone, roleId, isActive).

## Data flow and dependencies
`utils/validations.js` is consumed by `components/auth/PhoneStep.vue` (`validatePhoneNumber`, `isValidPhoneNumber`) and `components/auth/RegisterStep.vue` (`validateRegisterForm`) — see [`components/CLAUDE.md`](../components/CLAUDE.md). `utils/auth.js`'s `logoutAndResetAuthentication` is consumed by [`plugins/auth.client.js`](../plugins/CLAUDE.md) on 401/session-expiry. Both `utils/` files are plain runtime JS, no type annotations.

`types/*.ts` files are pure type-only declarations (no runtime logic) — consistent with the TS→JS revert (`209e98b`) keeping `.ts` specifically for type-only documentation while all executable logic moved to plain `.js`. They currently function as living documentation/contracts, referenced only by `API_ENDPOINTS_SUMMARY.md`, not by source code — this makes them a useful starting point for Phase 2's BACK-contract comparison, but they can already be stale relative to real BACK DTOs since nothing enforces them.

## Gotchas
- `validatePhoneNumber` requires `^09\d{9}$`; empty input returns `''` (treated as "no error," not "invalid") — pair with a required-field check if needed.
- `validateIranianNationalCode` implements the real Iranian national-ID checksum (10-digit weighted sum mod 11, factors 10→2), zero-pads 8-9 digit codes, rejects all-identical-digit codes — easy to get wrong if reimplemented.
- `validateRegisterForm` enforces password length ≥ 8 plus a letter-and-digit regex lookahead — no special-character requirement.
- `logoutAndResetAuthentication` swallows logout API errors (`.catch(() => {})`) and defers `app.$auth.reset()` via `setTimeout(..., 0)` — easy to overlook when debugging logout races.
- `types/` being unimported means they can silently drift from real JS runtime shapes (e.g. `GoodsDTO` in `api.ts` vs. `Product` in `panel-products.ts` already have different field sets for what's presumably the same entity) — no compiler catches mismatches.

Last synced: 209e98b
