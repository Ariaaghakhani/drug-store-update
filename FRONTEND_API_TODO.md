# Frontend API TODO

Backend gaps discovered while wiring frontend features to real endpoints. Each entry is a proposed contract for BACK to implement — not yet built, and not yet confirmed as the final shape; re-verify against BACK source before implementing.

## Users & Roles permission UI does not match BACK's permission model
- Status: needs-change (FRONT-side redesign, not a missing BACK endpoint — BACK is more capable than FRONT's current model, not less)
- Needed by: `pages/panel/users.vue`, `components/panel/users/{EditUserModal,UserPermissionsPanel}.vue`, `stores/roles.ts`, `composables/useUpdateRolePermission.ts`
- Endpoint: `GET /api/admin/endpoint-permissions/grouped` (already exists on BACK), plus `POST/PUT/DELETE /api/role-endpoint-permissions` for assignment
- Request: n/a — this is a UI data-model change, not a new call
- Expected response: FRONT currently models permissions as a fixed 3-domain (`users/products/orders`) × 4-action (`create/read/update/delete`) checkbox grid (`stores/roles.ts`). BACK's real mechanism grants a role access to specific, concrete HTTP endpoints grouped by an open-ended `module` string (likely dozens of values, e.g. `USER_MANAGEMENT`, `ORDER`, `ADDRESS`), via `EndpointPermissionController`/`RoleEndpointPermissionController`. There's also a separate, thinner `Permission` entity (bare `action` string) with no REST controller at all — confirmed unused/legacy, not the mechanism to build against.
- Current behavior: `UserPermissionsPanel.vue` renders the hardcoded 3×4 grid against `stores/roles.ts`'s mock data; none of it is wired to any BACK endpoint today.
- Why: a literal "wire up the existing grid" is not possible — the data shapes don't correspond. Needs a product/design decision on whether to rebuild the panel as a module-grouped endpoint-toggle list (matches BACK exactly), keep a simplified grid curated to a fixed subset of modules, or some other approach, before any implementation work starts. Deferred by Aria on 2026-10-06 pending that decision — not scheduled as an integration task until a redesign direction is picked.
- Date: 2026-10-06

## Stock availability (inStock) for simple goods
- Status: missing
- Needed by: pages/panel/products/{index,new,[id]}.vue, components/panel/products/ProductsTable.vue
- Endpoint: none today — `GoodsDTO` (`product/dto/GoodsDTO.java`) has no boolean/quantity stock field; actual stock lives in the separate Inventory domain (`services/api/inventory.js`, per-warehouse rows), not on the goods record itself.
- Request: n/a
- Expected response: ideally `GoodsDTO` gaining a derived field like `inStock: boolean | null` (aggregated across warehouses) or the admin product list joining `inventory.js::listInventory` per goods id.
- Current behavior: `GoodsController`/`GoodsServiceImpl` return no stock info; `ProductBatchDTO`/`InventoryDTO` exist but are keyed by goods/warehouse, not summarized per-good.
- Why: admin product table previously showed a mocked "موجود/ناموجود" badge; without a real field we now render a neutral "نامشخص" badge instead of fabricating true/false.
- Date: 2026-10-06

## Product image / attachment upload
- Status: needs-change
- Needed by: pages/panel/products/{new,[id]}.vue, components/panel/products/ProductImagesField.vue
- Endpoint: proposed `POST /api/attachments/upload` (multipart) — `services/api/attachment.js::uploadAttachment` is scaffolded but unverified against `AttachmentController` in this task.
- Request: multipart file + `{ referenceType: 'GOODS', referenceId: <goodsId> }` (per `GoodsAttachmentOwner.REFERENCE_TYPE` used server-side in `GoodsServiceImpl`).
- Expected response: `AttachmentDTO` (id, url, etc.) to push into `GoodsDTO.attachments`.
- Current behavior: `GoodsDTO.attachments` is a `List<AttachmentDTO>` populated server-side from `AttachmentService.findByReference`; it is not accepted as raw data on create/update, and `ProductImagesField.vue` only produces local `FileReader` data-URLs with no id.
- Why: kept `ProductImagesField.vue`'s existing data-URL picker for UI continuity but stopped sending `images` to `createGoods`/`updateGoods` (BACK doesn't expect it there) rather than guessing an upload flow.
- Date: 2026-10-06

## Brand selection (brandId) for product form
- Status: mismatch
- Needed by: pages/panel/products/{new,[id]}.vue
- Endpoint: likely `GET /api/catalogs?type=BRAND` or `POST /api/catalogs/by-type` (`CatalogController`, base `/api/catalogs` — not one of this task's reviewed controllers, so paths are unverified).
- Request: `{ type: 'BRAND' }` for by-type lookup.
- Expected response: `CatalogDTO[]` to populate a brand `USelectMenu` bound to `GoodsDTO.brandId`.
- Current behavior: `GoodsDTO.brandTitle` is a read-only denormalized display field (`GoodsReferenceResolver.applyBrandAndUnit` only ever reads `brandId`, via `catalogService.getEntity(brandId, CatalogTypes.BRAND)`); a free-text brand name sent from the form is silently ignored on create/update.
- Why: form kept the free-text "برند" input for continuity, but it is now cosmetic only — selecting/persisting a real brand needs a `CatalogDTO` (type `BRAND`) picker wired against `catalog.js`'s `listCatalogs`/`getCatalog`, whose paths (`api/catalog/*`) do not match `CatalogController`'s real base path (`/api/catalogs`) and were out of this task's scope to fix.
- Date: 2026-10-06

## CategoryScope update/delete
- Status: missing
- Needed by: services/api/catalog.js (`updateCategoryScope`, `deleteCategoryScope`)
- Endpoint: none — `CategoryScopeController` (`catalog/controller/CategoryScopeController.java`) only exposes `GET /api/category-scopes`, `POST /api/category-scopes/get`, `POST /api/category-scopes/create`. No update/delete mapping exists.
- Request: n/a
- Expected response: n/a
- Current behavior: `catalog.js`'s `updateCategoryScope`/`deleteCategoryScope` still point at `api/category-scopes/update`/`.../delete`, which 404 on BACK; left unchanged since no real endpoint exists to fix them against (not currently called by any page).
- Why: flagging instead of guessing a path that doesn't exist server-side.
- Date: 2026-10-06

## No stock/availability field on simple-product GoodsDTO
- Status: missing
- Needed by: pages/medications/[id].vue
- Endpoint: POST /api/goods/get (proposed addition to existing response)
- Request: `{ id: number }` (unchanged)
- Expected response: `GoodsDTO` with an added nullable `inStock: boolean` or `availableQuantity: number | null` field for simple (non-variant) products, so the product detail page can show availability without guessing.
- Current behavior: `GoodsDTO` (`product/dto/GoodsDTO.java`) has no stock/quantity field at all. Stock only exists on `GoodsVariantDTO.availableQuantity` (`product/dto/GoodsVariantDTO.java`), which only applies to variant products (`isModel`/`variants`), not simple goods. Confirmed by reading both DTOs in `PouyanPlatform` BACK source.
- Why: customers need to know if a simple (non-variant) product is in stock before adding it to cart; today the detail page cannot show this and must omit the UI rather than fabricate it.
- Date: 2026-10-06

## Owner dashboard revenue / sales-trend / top-products / staff-activity
- Status: missing
- Needed by: composables/useOwnerDashboard.js
- Endpoint: GET /api/dashboard/owner/revenue-summary (proposed), POST /api/dashboard/owner/sales-trend-chart (proposed, optional `{startDate, endDate}`), POST /api/dashboard/owner/top-products (proposed, optional `{limit, startDate, endDate}`), POST /api/dashboard/owner/staff-activity (proposed, optional `{startDate, endDate}`)
- Request: sales-trend/top-products/staff-activity take an optional filter body `{startDate?: string (ISO date), endDate?: string (ISO date), limit?: number}`; revenue-summary takes no params
- Expected response: revenue-summary → `{ totalRevenue: number, periodRevenue: number, revenueGrowthPercent: number }`; sales-trend-chart → `{ labels: string[], values: number[] }` (revenue or order count per period, not goods/user counts); top-products → `{ goodCode: string, nameFa: string, unitsSold: number, revenue: number }[]`; staff-activity → `{ userId: number, fullName: string, actionCount: number, lastActiveAt: string|null }[]`
- Current behavior: `com.pouyanplatform.backend.analytics.dashboard.controller.DashboardController` exposes only `/admin/summary`, `/admin/low-stock`, `/admin/expiring-goods`, `/admin/users-bar-chart-filtered` (user active/inactive counts), and `/admin/goods-category-pie-filtered` (goods-by-category counts) — no revenue, sales, order-value, top-product, or staff-activity data anywhere in BACK today. `useOwnerDashboard.js` leaves these as TODO comments and returns no fields for them.
- Why: the owner role needs revenue and sales-performance visibility to make the dashboard useful beyond inventory/user counts — currently the UI can only show goods-by-category and user-activity breakdowns, neither of which answers "how is the business doing".
- Date: 2026-10-06

## Customer-scoped dashboard (my orders / prescriptions / reminders summary)
- Status: missing
- Needed by: composables/useCustomerDashboard.js
- Endpoint: GET /api/dashboard/customer/summary (proposed)
- Request: none (identifies the customer from the authenticated session/token)
- Expected response: `{ pendingOrderCount: number, completedOrderCount: number, totalSpent: number, activeOrders: { id: string, trackingCode: string, status: string, itemCount: number, createdAt: number }[], refillReminders: { id: string, medicationName: string, daysRemaining: number }[], prescriptions: { id: string, uploadedAt: string, status: string, description: string|null }[], reorderSuggestions: { id: number, nameFa: string, price: number, category: string }[] }`
- Current behavior: no customer-scoped dashboard endpoint exists anywhere in BACK; `com.pouyanplatform.backend.analytics.dashboard.controller.DashboardController` only exposes admin-scoped endpoints (`/admin/*`). `useCustomerDashboard.js` returns fully hardcoded mock fixtures via `useAsyncData`, with no `services/api` call at all.
- Why: the customer panel's dashboard (`components/dashboard/customer/CustomerDashboard.vue`) is the primary landing view for the customer role and currently shows fabricated data in production — customers need their real order/prescription/reminder state.
- Date: 2026-10-06

## Active session list + revoke-one + revoke-all
- Status: missing
- Needed by: components/panel/security/ActiveSessionsCard.vue, components/panel/security/DangerZoneCard.vue
- Endpoint: `GET /api/auth/me/sessions` (list), `DELETE /api/auth/me/sessions/{id}` (revoke one), `POST /api/auth/me/sessions/revoke-all` (proposed)
- Request: list — none; revoke-one — path param `id: string|number` (refresh token / session id); revoke-all — none (acts on current user from auth context)
- Expected response: list → `ApiResponse<SessionDTO[]>` where `SessionDTO = { id: string, current: boolean, device: string|null, browser: string|null, ip: string|null, location: string|null, lastActiveAt: string (ISO), createdAt: string (ISO) }`; revoke-one/revoke-all → `ApiResponse<null>` or `ApiResponse<{ revokedCount: number }>`
- Current behavior: BACK has no controller endpoint for this — `RefreshTokenRepository.revokeAllByUser` and `AccessTokenRevocationService.revokeAllForUser` already exist and are used internally by `/api/auth/me/password` and phone-change confirm, so a self-service "revoke all" endpoint would be a thin new controller method wrapping existing service calls, not new infra. Per-session listing and single-session revoke have no backing data path at all (no per-session metadata like device/browser/location is persisted on `RefreshToken`).
- Why: users expect to see and manage where they're logged in, especially after a password change wipes all other sessions silently.
- Date: 2026-10-06

## 2FA setup/verify
- Status: missing
- Needed by: components/panel/security/TwoFAModal.vue, components/panel/security/AuthMethodsCard.vue
- Endpoint: `POST /api/auth/me/2fa/setup` (begin, returns secret/QR), `POST /api/auth/me/2fa/verify` (confirm code, enables), `POST /api/auth/me/2fa/disable` (proposed)
- Request: setup — none; verify — `{ code: string }`; disable — `{ code: string }` or `{ currentPassword: string }`
- Expected response: setup → `ApiResponse<{ secret: string, qrCodeUrl: string }>`; verify → `ApiResponse<{ enabled: true }>`; disable → `ApiResponse<{ enabled: false }>`
- Current behavior: BACK has no 2FA/TOTP concept anywhere in `identity/auth` — only phone-OTP login/register flows exist, which are not a second factor on top of password.
- Why: security page already advertises "احراز هویت دو مرحله‌ای" as a toggle; shipping it mocked risks users believing their account is protected when it isn't.
- Date: 2026-10-06

## Login history
- Status: missing
- Needed by: components/panel/security/LoginHistoryCard.vue
- Endpoint: `GET /api/auth/me/login-history` (proposed, paginated)
- Request: `{ page?: number, pageSize?: number }` as query params
- Expected response: `ApiResponse<{ content: LoginHistoryEntryDTO[], totalElements: number }>` where `LoginHistoryEntryDTO = { id: string, success: boolean, suspicious: boolean, action: string, device: string|null, ip: string|null, occurredAt: string (ISO) }`
- Current behavior: BACK has no login-history/audit trail exposed to the end user — `loginAttemptService` tracks failed-attempt counters for lockout purposes only, nothing persisted/queryable per login event today.
- Why: lets users verify no one else accessed their account, which is a standard account-security expectation.
- Date: 2026-10-06

## Security alerts / notification preferences
- Status: missing
- Needed by: components/panel/security/SecurityAlertsCard.vue
- Endpoint: `GET /api/auth/me/security-notifications` (read prefs), `PATCH /api/auth/me/security-notifications` (update, proposed)
- Request: read — none; update — `{ id: string, enabled: boolean }` (or full map `{ [id: string]: boolean }`)
- Expected response: `ApiResponse<{ id: string, label: string, description: string, enabled: boolean }[]>`
- Current behavior: BACK has no notification-preference storage or delivery mechanism for security events (new-device login, failed-login streak, profile change) — nothing to read or persist against.
- Why: users expect to opt in/out of being alerted about sensitive account activity.
- Date: 2026-10-06
