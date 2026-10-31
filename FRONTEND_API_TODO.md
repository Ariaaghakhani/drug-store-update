# Frontend API TODO

Backend gaps discovered while wiring frontend features to real endpoints. Each entry is a proposed contract for BACK to implement — not yet built, and not yet confirmed as the final shape; re-verify against BACK source before implementing.

> **Backend answered all entries below on 2026-10-27** (PRs #402–#406, `main`). Per-entry status lines are updated in
> place; see the full write-up for exact field names/edge cases before wiring — this file only tracks resolution
> status, not the contract details. Two deltas from what FRONT proposed: security-notifications update is `PUT`, not
> `PATCH` (CORS); customer dashboard's `refillReminders` is always `[]` (no backend feature yet).

## Order fulfillment status missing from OrderDocument (admin search index)
- Status: **resolved — already existed, no BACK change needed (2026-10-27)**. `OrderDocument` already has
  `fulfillmentStatus`, `trackingCode`, `shippingMethodTitle`, with more values than proposed (`SHIPPED`,
  `DELIVERY_FAILED`, `RETURNED_TO_STORE`, `LOST`, `DAMAGED`, `READY_FOR_PICKUP`, `NOT_COLLECTED`, `DELIVERED`, or
  `null`). Old orders showing `null` need a platform-admin-run `POST /api/search/orders/reindex` (backend-side).
- Needed by: components/panel/orders/OrdersManagement.vue
- Endpoint: `POST /api/search/orders` and `POST /api/search/orders/status/{status}` (existing — field addition proposed)
- Request: unchanged
- Expected response: `OrderDocument` gains `fulfillmentStatus: 'SHIPPED' | 'READY_FOR_PICKUP' | 'DELIVERED' | null`
- Current behavior: `OrderDocument` (`order/search/document/OrderDocument.java`) only has `personFullName`, `status`, `statusCode`, `totalAmount`, `dateOrdered`, `items` — no `fulfillmentStatus`. `OrderDTO` (returned by `/api/orders/list`, `/api/orders/get`, `/api/orders/by-person`) does carry `fulfillmentStatus`, but that endpoint has no `personFullName`/customer name, so the admin list — wired to the search endpoint for customer-name + free-text search — can only show the payment/order-status axis per row today. Showing fulfillment too would require one `/api/orders/get` call per visible row (N+1), which we chose not to do.
- Why: product decision requires showing both the payment/order status and fulfillment status per row in the admin order list; currently only the payment/order status is shown there (CustomerOrders.vue, which uses `/api/orders/by-person` → `OrderDTO`, already shows both axes correctly).
- Date: 2026-10-07

## No order aggregate/stats endpoint
- Status: **resolved — done, #402 (2026-10-27)**. `GET /api/orders/stats?from=&to=` (both optional, inclusive, on
  order date; staff-only, 403 for customer; `from` after `to` → 400). Returns
  `{ totalOrders, countByStatus: {status: count} (absent status = 0), revenueTotal, revenueToday }`.
  `revenueTotal` = sum of `PAID` orders in range (refunds not subtracted, cancelled-paid no longer counts);
  `revenueToday` = today's paid orders, independent of range. Drop the "size:1 per status" workaround and the
  "جمع این صفحه" label.
- Needed by: components/panel/orders/OrdersManagement.vue
- Endpoint: `GET /api/orders/stats` (proposed) or similar
- Request: none, or `{ from?: Date, to?: Date }`
- Expected response: `{ totalOrders: number, countByStatus: Record<string, number>, revenueToday: number, revenueTotal: number }`
- Current behavior: checked `OrderController`, `OrderSearchController`, `InvoiceController` — no endpoint returns counts-by-status or revenue aggregates. Worked around this by calling `/api/search/orders` and `/api/search/orders/status/{code}` with `size: 1` per status to read `SearchResultDTO.totalElements` (real, exact counts — not estimates) for the "کل سفارشات" and per-status stat tiles. There is still no way to get a true revenue total/"today's revenue" without fetching and summing every order, so the stats strip's revenue tile sums only the currently-loaded page of results and is labeled "جمع این صفحه" (sum of this page) instead of implying a global total.
- Why: a real stats/aggregate endpoint would let the stats strip show true revenue figures (today/this month/total) instead of a page-scoped approximation.
- Date: 2026-10-07

## No update endpoint for orders, order-items, or invoices
- Status: **will not be built as a generic `/update` — by design (2026-10-27)**. Invoices are read-only legal
  documents; order items lock once paid/cancelled/dispatched/reserved; order status only changes through dedicated
  flows so an order can never become PAID without a real payment. What exists instead (all staff-only, all return
  `OrderDTO` unless noted) — all new, all POST/PUT, no generic update:
  - `POST /api/admin/orders/{id}/ship` `{trackingCode?}`, `/ready-for-pickup` (optional body), `/deliver` (no body)
  - `POST /api/admin/orders/{id}/delivery-failed` `{reason: CUSTOMER_ABSENT|UNREACHABLE|WRONG_ADDRESS|REFUSED|OTHER}`
  - `POST /api/admin/orders/{id}/returned` / `/not-collected` / `/lost` / `/damaged` (no body)
  - `PUT /api/admin/orders/{id}/shipping` `{shippingMethodId, addressId, pickupSlotStart, payShippingOnDelivery, courierName, courierPhone, note}`
  - `GET /api/admin/orders/{id}/fulfillment-history`
  - `GET /api/admin/cod-orders`, `POST /api/admin/cod-orders/{id}/paid`, `POST /api/admin/cod-orders/{id}/cancel`
  - `GET /api/admin/shipments`, `GET /api/admin/shipments/summary` (query filters)
  - Invalid transition (e.g. deliver before ship) → 409 `order.fulfillment.transition`.
  - Wire the "بررسی"/status buttons in `OrdersManagement.vue` to these instead of any `.../update` assumption. If a
    field genuinely needs editing, tell BACK which field + why for a dedicated action.
- Needed by: components/panel/orders/OrdersManagement.vue, components/panel/orders/CustomerOrders.vue (future order-status-change actions)
- Endpoint: `POST /api/orders/update`, `POST /api/order-items/update`, `POST /api/invoices/update` (proposed)
- Request: `{ id: number, ...fields }` per entity
- Expected response: `ApiResponse<OrderDTO | OrderItemDTO | InvoiceDTO>`
- Current behavior: `OrderController`, `OrderItemController`, `InvoiceController` (BACK) only expose `create`/`get`/`list`/`delete` (+ `by-*` filters on `OrderController`) — no `/update` route exists for any of the three. `services/api/orders.js` previously had `updateOrder`/`updateOrderItem`/`updateInvoice` wrappers pointing at nonexistent `.../update` routes; removed them in this change rather than leave dead calls. Order status transitions on BACK go through dedicated flows instead (`OrderFulfillmentService.ship/readyForPickup/deliver`, `CashOnDeliveryService.markPaid/cancel`), none of which are exposed as REST endpoints yet either.
- Why: the admin panel will eventually need to change order status / mark fulfillment steps from the UI (e.g. the "بررسی" button in OrdersManagement.vue); no endpoint exists for that today.
- Date: 2026-10-07

## Users & Roles permission UI does not match BACK's permission model
- Status: **still needs-change — no code change yet (2026-10-27)**. Backend confirms no BACK change needed; it
  already serves `GET /api/admin/endpoint-permissions/grouped` + `/api/role-endpoint-permissions` for assignment.
  Still blocked on FRONT's design decision (below) before implementation starts.
- (original) FRONT-side redesign, not a missing BACK endpoint — BACK is more capable than FRONT's current model, not less
- Needed by: `pages/panel/users.vue`, `components/panel/users/{EditUserModal,UserPermissionsPanel}.vue`, `stores/roles.ts`, `composables/useUpdateRolePermission.ts`
- Endpoint: `GET /api/admin/endpoint-permissions/grouped` (already exists on BACK), plus `POST/PUT/DELETE /api/role-endpoint-permissions` for assignment
- Request: n/a — this is a UI data-model change, not a new call
- Expected response: FRONT currently models permissions as a fixed 3-domain (`users/products/orders`) × 4-action (`create/read/update/delete`) checkbox grid (`stores/roles.ts`). BACK's real mechanism grants a role access to specific, concrete HTTP endpoints grouped by an open-ended `module` string (likely dozens of values, e.g. `USER_MANAGEMENT`, `ORDER`, `ADDRESS`), via `EndpointPermissionController`/`RoleEndpointPermissionController`. There's also a separate, thinner `Permission` entity (bare `action` string) with no REST controller at all — confirmed unused/legacy, not the mechanism to build against.
- Current behavior: `UserPermissionsPanel.vue` renders the hardcoded 3×4 grid against `stores/roles.ts`'s mock data; none of it is wired to any BACK endpoint today.
- Why: a literal "wire up the existing grid" is not possible — the data shapes don't correspond. Needs a product/design decision on whether to rebuild the panel as a module-grouped endpoint-toggle list (matches BACK exactly), keep a simplified grid curated to a fixed subset of modules, or some other approach, before any implementation work starts. Deferred by Aria on 2026-10-06 pending that decision — not scheduled as an integration task until a redesign direction is picked.
- Date: 2026-10-06

## Stock availability (inStock) for simple goods
- Status: **resolved — done, #402 (2026-10-27)**. `GoodsDTO` now has response-only `availableQuantity: number`
  (sellable online stock; excludes reserved/expired/offline-warehouse units; sum of variants for `isModel:true`) and
  `inStock: boolean` (`availableQuantity > 0`) on `/api/goods/get`, `/list`, `/filter`. Replace the "نامشخص" neutral
  badge with real `inStock`.
- Needed by: pages/panel/products/{index,new,[id]}.vue, components/panel/products/ProductsTable.vue
- Endpoint: none today — `GoodsDTO` (`product/dto/GoodsDTO.java`) has no boolean/quantity stock field; actual stock lives in the separate Inventory domain (`services/api/inventory.js`, per-warehouse rows), not on the goods record itself.
- Request: n/a
- Expected response: ideally `GoodsDTO` gaining a derived field like `inStock: boolean | null` (aggregated across warehouses) or the admin product list joining `inventory.js::listInventory` per goods id.
- Current behavior: `GoodsController`/`GoodsServiceImpl` return no stock info; `ProductBatchDTO`/`InventoryDTO` exist but are keyed by goods/warehouse, not summarized per-good.
- Why: admin product table previously showed a mocked "موجود/ناموجود" badge; without a real field we now render a neutral "نامشخص" badge instead of fabricating true/false.
- Date: 2026-10-06

## Product image / attachment upload
- Status: **resolved — already existed (2026-10-27)**. `POST /api/attachments/upload` (multipart):
  `file, referenceType=Goods, referenceId=<goodsId>, isPrimary?`. `POST /api/attachments/upload/batch` (multipart,
  `files` many, all-or-nothing). Also `set-primary`, `by-reference`, `delete`. Flow: create goods first (get id),
  then upload; `GoodsDTO.attachments` reads from these — never send images inside create/update goods.
- Needed by: pages/panel/products/{new,[id]}.vue, components/panel/products/ProductImagesField.vue
- Endpoint: proposed `POST /api/attachments/upload` (multipart) — `services/api/attachment.js::uploadAttachment` is scaffolded but unverified against `AttachmentController` in this task.
- Request: multipart file + `{ referenceType: 'GOODS', referenceId: <goodsId> }` (per `GoodsAttachmentOwner.REFERENCE_TYPE` used server-side in `GoodsServiceImpl`).
- Expected response: `AttachmentDTO` (id, url, etc.) to push into `GoodsDTO.attachments`.
- Current behavior: `GoodsDTO.attachments` is a `List<AttachmentDTO>` populated server-side from `AttachmentService.findByReference`; it is not accepted as raw data on create/update, and `ProductImagesField.vue` only produces local `FileReader` data-URLs with no id.
- Why: kept `ProductImagesField.vue`'s existing data-URL picker for UI continuity but stopped sending `images` to `createGoods`/`updateGoods` (BACK doesn't expect it there) rather than guessing an upload flow.
- Date: 2026-10-06

## Brand selection (brandId) for product form
- Status: **resolved — already existed, fix FRONT paths (2026-10-27)**. Base path is `/api/catalogs` (plural), not
  `/api/catalog`. `POST /api/catalogs/by-type {type:"BRAND"}` → `CatalogDTO[]`; bind chosen `id` to
  `GoodsDTO.brandId` (`brandTitle` stays read-only).
- Needed by: pages/panel/products/{new,[id]}.vue
- Endpoint: likely `GET /api/catalogs?type=BRAND` or `POST /api/catalogs/by-type` (`CatalogController`, base `/api/catalogs` — not one of this task's reviewed controllers, so paths are unverified).
- Request: `{ type: 'BRAND' }` for by-type lookup.
- Expected response: `CatalogDTO[]` to populate a brand `USelectMenu` bound to `GoodsDTO.brandId`.
- Current behavior: `GoodsDTO.brandTitle` is a read-only denormalized display field (`GoodsReferenceResolver.applyBrandAndUnit` only ever reads `brandId`, via `catalogService.getEntity(brandId, CatalogTypes.BRAND)`); a free-text brand name sent from the form is silently ignored on create/update.
- Why: form kept the free-text "برند" input for continuity, but it is now cosmetic only — selecting/persisting a real brand needs a `CatalogDTO` (type `BRAND`) picker wired against `catalog.js`'s `listCatalogs`/`getCatalog`, whose paths (`api/catalog/*`) do not match `CatalogController`'s real base path (`/api/catalogs`) and were out of this task's scope to fix.
- Date: 2026-10-06

## CategoryScope update/delete
- Status: **will not be built — by design (2026-10-27)**. Scopes are system values every store copies on creation
  and code refers to by name; renaming/deleting breaks goods categories, Excel import, and the blog. Remove
  `updateCategoryScope`/`deleteCategoryScope` from `catalog.js`; read-only use (`GET /api/category-scopes`,
  `POST /api/category-scopes/get`) stays.
- Needed by: services/api/catalog.js (`updateCategoryScope`, `deleteCategoryScope`)
- Endpoint: none — `CategoryScopeController` (`catalog/controller/CategoryScopeController.java`) only exposes `GET /api/category-scopes`, `POST /api/category-scopes/get`, `POST /api/category-scopes/create`. No update/delete mapping exists.
- Request: n/a
- Expected response: n/a
- Current behavior: `catalog.js`'s `updateCategoryScope`/`deleteCategoryScope` still point at `api/category-scopes/update`/`.../delete`, which 404 on BACK; left unchanged since no real endpoint exists to fix them against (not currently called by any page).
- Why: flagging instead of guessing a path that doesn't exist server-side.
- Date: 2026-10-06

## No stock/availability field on simple-product GoodsDTO
- Status: **resolved — done, #402 (2026-10-27)**. Same `availableQuantity`/`inStock` fields as the panel entry above,
  also present on `POST /api/goods/get` — the detail page can now show availability for simple goods.
- Needed by: pages/medications/[id].vue
- Endpoint: POST /api/goods/get (proposed addition to existing response)
- Request: `{ id: number }` (unchanged)
- Expected response: `GoodsDTO` with an added nullable `inStock: boolean` or `availableQuantity: number | null` field for simple (non-variant) products, so the product detail page can show availability without guessing.
- Current behavior: `GoodsDTO` (`product/dto/GoodsDTO.java`) has no stock/quantity field at all. Stock only exists on `GoodsVariantDTO.availableQuantity` (`product/dto/GoodsVariantDTO.java`), which only applies to variant products (`isModel`/`variants`), not simple goods. Confirmed by reading both DTOs in `PouyanPlatform` BACK source.
- Why: customers need to know if a simple (non-variant) product is in stock before adding it to cart; today the detail page cannot show this and must omit the UI rather than fabricate it.
- Date: 2026-10-06

## Owner dashboard revenue / sales-trend / top-products / staff-activity
- Status: **resolved — done, #403 (2026-10-27)**. Staff-with-dashboard-access only (403 for customer); only `PAID`
  orders count, by order date.
  - `GET /api/dashboard/owner/revenue-summary` → `{totalRevenue, periodRevenue, previousPeriodRevenue, revenueGrowthPercent, periodStart}`.
    Period = current Jalali month to date; previous = same day-count at start of last Jalali month.
    `revenueGrowthPercent` 1 decimal, `null` if no sales last month. `periodStart` = first day of Jalali month (Gregorian date).
  - `POST /api/dashboard/owner/sales-trend-chart` `{startDate?, endDate?}` → `{labels, values, orderCounts}` — one
    entry/day (0 for no-sales days), `labels` Gregorian `YYYY-MM-DD` (convert to Jalali client-side), default last 30
    days, capped at 366, `start > end` → 400.
  - `POST /api/dashboard/owner/top-products` `{limit?, startDate?, endDate?}` → `[{goodsId, goodCode, nameFa, unitsSold, revenue}]`,
    per-variant, most-units-first, `limit` 1..50 (default 10, else 400), no dates = all time, `revenue` = post-discount line totals with tax.
  - `POST /api/dashboard/owner/staff-activity` `{startDate?, endDate?}` → `[{userId, fullName, actionCount, lastActiveAt}]`,
    any non-customer role, most-active-first, max 50, from audit log (logins included), `fullName` falls back to username.
  - Deltas from FRONT's proposal: `revenue-summary` has 2 extra fields; `sales-trend-chart` also returns
    `orderCounts`; `top-products` also returns `goodsId`.
- Needed by: composables/useOwnerDashboard.js
- Endpoint: GET /api/dashboard/owner/revenue-summary (proposed), POST /api/dashboard/owner/sales-trend-chart (proposed, optional `{startDate, endDate}`), POST /api/dashboard/owner/top-products (proposed, optional `{limit, startDate, endDate}`), POST /api/dashboard/owner/staff-activity (proposed, optional `{startDate, endDate}`)
- Request: sales-trend/top-products/staff-activity take an optional filter body `{startDate?: string (ISO date), endDate?: string (ISO date), limit?: number}`; revenue-summary takes no params
- Expected response: revenue-summary → `{ totalRevenue: number, periodRevenue: number, revenueGrowthPercent: number }`; sales-trend-chart → `{ labels: string[], values: number[] }` (revenue or order count per period, not goods/user counts); top-products → `{ goodCode: string, nameFa: string, unitsSold: number, revenue: number }[]`; staff-activity → `{ userId: number, fullName: string, actionCount: number, lastActiveAt: string|null }[]`
- Current behavior: `com.pouyanplatform.backend.analytics.dashboard.controller.DashboardController` exposes only `/admin/summary`, `/admin/low-stock`, `/admin/expiring-goods`, `/admin/users-bar-chart-filtered` (user active/inactive counts), and `/admin/goods-category-pie-filtered` (goods-by-category counts) — no revenue, sales, order-value, top-product, or staff-activity data anywhere in BACK today. `useOwnerDashboard.js` leaves these as TODO comments and returns no fields for them.
- Why: the owner role needs revenue and sales-performance visibility to make the dashboard useful beyond inventory/user counts — currently the UI can only show goods-by-category and user-activity breakdowns, neither of which answers "how is the business doing".
- Date: 2026-10-06

## Customer-scoped dashboard (my orders / prescriptions / reminders summary)
- Status: **resolved — done, #403 (2026-10-27)**. `GET /api/dashboard/customer/summary`, any logged-in user, always
  the caller's own data. Response: `{ pendingOrderCount, completedOrderCount, totalSpent, activeOrders: [{id, trackingCode, status, fulfillmentStatus, itemCount, totalAmount, createdAt}] (latest 5, open orders), refillReminders: [] (always empty — no BACK feature), prescriptions: [{id, uploadedAt, status, description}] (latest 5), reorderSuggestions: [{id, nameFa, price, category}] (up to 6) }`.
  - `pendingOrderCount` = open (not failed/cancelled/delivered, unpaid-pending included); `completedOrderCount` =
    paid+delivered; `totalSpent` = sum of paid orders.
  - `activeOrders`: `id`/`itemCount` numbers, `createdAt` ISO datetime (not epoch); two extra fields vs FRONT's
    proposal: `fulfillmentStatus` (null = not shipped) and `totalAmount`.
  - `prescriptions.status` ∈ `SUBMITTED|AVAILABLE|PARTIALLY_AVAILABLE|UNAVAILABLE|INVALID|CONFIRMED|READY|SHIPPED|DELIVERED|CANCELLED`;
    always empty in a non-prescription store.
  - `reorderSuggestions.price` = current unit price after active discount; `category` = first category name or `null`.
  - **`refillReminders` is always `[]`** — no refill-reminder feature on BACK. Hide that card / show empty state;
    do not keep the mock. Replace all 5 hardcoded fixtures in `useCustomerDashboard.js` with this one call — note
    the current mock's flat field names (`reminders`/`orders`/`reorderItems`) don't match this response and need
    remapping, not just a new API call bolted onto the old shape.
- Needed by: composables/useCustomerDashboard.js
- Endpoint: GET /api/dashboard/customer/summary (proposed)
- Request: none (identifies the customer from the authenticated session/token)
- Expected response: `{ pendingOrderCount: number, completedOrderCount: number, totalSpent: number, activeOrders: { id: string, trackingCode: string, status: string, itemCount: number, createdAt: number }[], refillReminders: { id: string, medicationName: string, daysRemaining: number }[], prescriptions: { id: string, uploadedAt: string, status: string, description: string|null }[], reorderSuggestions: { id: number, nameFa: string, price: number, category: string }[] }`
- Current behavior: no customer-scoped dashboard endpoint exists anywhere in BACK; `com.pouyanplatform.backend.analytics.dashboard.controller.DashboardController` only exposes admin-scoped endpoints (`/admin/*`). `useCustomerDashboard.js` returns fully hardcoded mock fixtures via `useAsyncData`, with no `services/api` call at all.
- Why: the customer panel's dashboard (`components/dashboard/customer/CustomerDashboard.vue`) is the primary landing view for the customer role and currently shows fabricated data in production — customers need their real order/prescription/reminder state.
- Date: 2026-10-06

## Active session list + revoke-one + revoke-all
- Status: **resolved — done, #402 (revoke-all) + #405 (list, revoke-one) (2026-10-27)**. Any logged-in user, own
  sessions only.
  - `GET /api/auth/me/sessions` → `[{id, current, device, browser, ip, location, lastActiveAt, createdAt}]` — one
    per login per device, newest activity first. `current:true` detected from the refresh cookie (send
    `credentials:'include'`). `device` = OS (`Windows`/`Android`/`iOS`/`macOS`/`Linux`/`Other`), `browser` =
    `Chrome`/`Edge`/`Firefox`/`Safari`/`Opera`/`Samsung Internet`/`App`/`Other`. Sessions started before
    2026-10-27 have `device`/`browser`/`ip` = `null`. `location` always `null` (no geo-IP). `id` is an opaque
    string — pass back as-is.
  - `DELETE /api/auth/me/sessions/{id}` → `{revokedCount: 1}`. Someone else's/unknown id → 404. Revoking the
    **current** session acts like logout (cookie cleared, current access token revoked) → send user to login.
    Another device drops out at its next refresh (≤15 min, the access-token lifetime).
  - `POST /api/auth/me/sessions/revoke-all` → `{revokedCount: n}` — signs out every device including this one →
    send user to login afterwards.
- Needed by: components/panel/security/ActiveSessionsCard.vue, components/panel/security/DangerZoneCard.vue
- Endpoint: `GET /api/auth/me/sessions` (list), `DELETE /api/auth/me/sessions/{id}` (revoke one), `POST /api/auth/me/sessions/revoke-all` (proposed)
- Request: list — none; revoke-one — path param `id: string|number` (refresh token / session id); revoke-all — none (acts on current user from auth context)
- Expected response: list → `ApiResponse<SessionDTO[]>` where `SessionDTO = { id: string, current: boolean, device: string|null, browser: string|null, ip: string|null, location: string|null, lastActiveAt: string (ISO), createdAt: string (ISO) }`; revoke-one/revoke-all → `ApiResponse<null>` or `ApiResponse<{ revokedCount: number }>`
- Current behavior: BACK has no controller endpoint for this — `RefreshTokenRepository.revokeAllByUser` and `AccessTokenRevocationService.revokeAllForUser` already exist and are used internally by `/api/auth/me/password` and phone-change confirm, so a self-service "revoke all" endpoint would be a thin new controller method wrapping existing service calls, not new infra. Per-session listing and single-session revoke have no backing data path at all (no per-session metadata like device/browser/location is persisted on `RefreshToken`).
- Why: users expect to see and manage where they're logged in, especially after a password change wipes all other sessions silently.
- Date: 2026-10-06

## 2FA setup/verify
- Status: **will not be built — product decision (2026-10-27)**. Remove the 2FA toggle from
  `AuthMethodsCard.vue`/`TwoFAModal.vue` entirely so the page stops suggesting protection that doesn't exist.
- Needed by: components/panel/security/TwoFAModal.vue, components/panel/security/AuthMethodsCard.vue
- Endpoint: `POST /api/auth/me/2fa/setup` (begin, returns secret/QR), `POST /api/auth/me/2fa/verify` (confirm code, enables), `POST /api/auth/me/2fa/disable` (proposed)
- Request: setup — none; verify — `{ code: string }`; disable — `{ code: string }` or `{ currentPassword: string }`
- Expected response: setup → `ApiResponse<{ secret: string, qrCodeUrl: string }>`; verify → `ApiResponse<{ enabled: true }>`; disable → `ApiResponse<{ enabled: false }>`
- Current behavior: BACK has no 2FA/TOTP concept anywhere in `identity/auth` — only phone-OTP login/register flows exist, which are not a second factor on top of password.
- Why: security page already advertises "احراز هویت دو مرحله‌ای" as a toggle; shipping it mocked risks users believing their account is protected when it isn't.
- Date: 2026-10-06

## Login history
- Status: **resolved — done, #404 (2026-10-27)**. `GET /api/auth/me/login-history?page=0&size=20` (`size` 1..100,
  else 400), own rows, newest first → `PageResponse<{id, action, success, failureReason, suspicious, device, ip, occurredAt}>`.
  - `action`: `PASSWORD`|`OTP`|`REGISTER`|`LOGOUT`|`LOGOUT_ALL`.
  - `failureReason` (only when `success:false`): `BAD_CREDENTIALS`|`OTP_INVALID`|`LOCKED`|`PASSWORD_EXPIRED`.
  - `suspicious:true` = successful login from an IP+browser combo none of the user's earlier successful logins had
    (first login never suspicious).
  - `device` is one readable string e.g. `"Chrome on Windows"` (null if unknown).
  - Only events from 2026-10-27 on exist; rows >180 days old are deleted. A login attempt against a phone with no
    account is not recorded at all.
  - Suggested fa labels: PASSWORD «ورود با رمز», OTP «ورود با کد پیامکی», REGISTER «ثبت‌نام», LOGOUT «خروج»,
    LOGOUT_ALL «خروج از همه‌ی دستگاه‌ها»; BAD_CREDENTIALS «رمز اشتباه», OTP_INVALID «کد اشتباه», LOCKED «حساب قفل بود»,
    PASSWORD_EXPIRED «رمز منقضی شده».
- Needed by: components/panel/security/LoginHistoryCard.vue
- Endpoint: `GET /api/auth/me/login-history` (proposed, paginated)
- Request: `{ page?: number, pageSize?: number }` as query params
- Expected response: `ApiResponse<{ content: LoginHistoryEntryDTO[], totalElements: number }>` where `LoginHistoryEntryDTO = { id: string, success: boolean, suspicious: boolean, action: string, device: string|null, ip: string|null, occurredAt: string (ISO) }`
- Current behavior: BACK has no login-history/audit trail exposed to the end user — `loginAttemptService` tracks failed-attempt counters for lockout purposes only, nothing persisted/queryable per login event today.
- Why: lets users verify no one else accessed their account, which is a standard account-security expectation.
- Date: 2026-10-06

## Personal-info form sends Gregorian ISO birthDate through a Jalali-styled input
- Status: needs-change (FRONT-side, not a BACK gap)
- Needed by: components/panel/profile/PersonalInfoEditModal.vue, pages/panel/profile.vue
- Endpoint: `POST /api/persons/update` (existing, now wired) — `PersonDTO.birthDate` is a Gregorian `LocalDate` (ISO `yyyy-MM-dd`)
- Current behavior: the birth-date field is a free-text `UInput` with placeholder `1370/01/01` (Jalali-styled), but BACK stores/validates it as a plain Gregorian `LocalDate`. `saveProfile` only normalizes `/` to `-` so the value is parseable JSON (avoids a hard 400), it does **not** convert Jalali digits to the equivalent Gregorian date — a user typing a real Jalali date will have it stored as a nonsensical Gregorian date (e.g. `1402-05-10` parses fine but is ~621 years off).
- Why: no Jalali/Gregorian conversion library is in `package.json` (checked: no `jalaali-js`/`moment-jalaali`/`dayjs` plugin); picking one and reworking the input into a real Jalali date-picker is a product/UI decision, not something to guess at while just wiring the save button to the real endpoint.
- Date: 2026-10-09

## Security alerts / notification preferences
- Status: **resolved — done, #405 (2026-10-27)**. Any logged-in user, own settings.
  - `GET /api/auth/me/security-notifications` → `[{id, label, description, enabled}]` (labels/descriptions already
    Persian, ready to render).
  - **`PUT`** (not PATCH — CORS only allows GET/POST/PUT/DELETE/OPTIONS) `/api/auth/me/security-notifications`
    body `{id: "NEW_DEVICE_LOGIN", enabled: false}` → returns the full list again. Unknown `id` → 400.
  - Three alerts, all **on** by default: `NEW_DEVICE_LOGIN` (sent when a login is marked `suspicious`, see login
    history), `ACCOUNT_LOCKED` (sent when account temporarily locked after repeated wrong password/code),
    `PASSWORD_CHANGED` (sent on password change or forgot-password reset) — each an SMS to the account's mobile.
    The store can also kill all of them at the store-settings level, in which case `enabled:true` here sends
    nothing; the page doesn't need to know that.
- Needed by: components/panel/security/SecurityAlertsCard.vue
- Endpoint: `GET /api/auth/me/security-notifications` (read prefs), `PATCH /api/auth/me/security-notifications` (update, proposed)
- Request: read — none; update — `{ id: string, enabled: boolean }` (or full map `{ [id: string]: boolean }`)
- Expected response: `ApiResponse<{ id: string, label: string, description: string, enabled: boolean }[]>`
- Current behavior: BACK has no notification-preference storage or delivery mechanism for security events (new-device login, failed-login streak, profile change) — nothing to read or persist against.
- Why: users expect to opt in/out of being alerted about sensitive account activity.
- Date: 2026-10-06
