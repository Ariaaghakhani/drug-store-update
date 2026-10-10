# Section: panel-dashboard

Branch: `feat/api-6-panel-dashboard`

## Module docs to read
- `services/api/CLAUDE.md`, `composables/CLAUDE.md` (`use{Admin,Owner,Customer}Dashboard`), `components/CLAUDE.md` (dashboard sub-section)
- `shared.md`

## Endpoints
`analytics/dashboard/controller/DashboardController.java`, base `/api/dashboard/admin` (store-wide only — **no per-user/customer scoping anywhere on this controller**):
- `GET /api/dashboard/admin/summary` → `DashboardSummaryDTO { totalUsers, totalGoods, stockValueAtPurchasePrice, stockValueAtSalePrice, lowStockCount }`.
- `GET /api/dashboard/admin/low-stock` → `List<LowStockDTO> { goodCode, nameFa, warehouseName, available, reorderPoint }` (max 100 rows).
- `POST /api/dashboard/admin/expiring-goods` body optional `{daysAhead}` (default 30) → `List<ExpiringGoodsDTO> { goodCode, nameFa, batchNumber, expiryDate, quantity, expired }` (max 100 rows).
- `POST /api/dashboard/admin/users-bar-chart-filtered` body optional `{roleId, startDate, endDate}` → `BarChartDTO { labels, values }` — **this is active/inactive user counts, not sales.**
- `POST /api/dashboard/admin/goods-category-pie-filtered` body optional `{categoryId, startDate, endDate}` → `PieChartDTO { categoryIds, categories, counts }` — **goods-by-category counts, not revenue.**

**There is no revenue, sales-trend, top-products, or staff-activity endpoint anywhere in this controller or package.** `services/api/analytics.js`'s entire dashboard section is guessed against BACK: wrong HTTP method on summary (POST assumed, BACK is GET), missing `/admin` path segment on every call, and `getDashboardKpi`/`getSalesChart`/`getRevenueChart` have **zero backend counterpart** — not wrong-path, just nonexistent.

## FRONT files to touch
- `services/api/analytics.js` — fix `getDashboardSummary` (`GET /api/dashboard/admin/summary`), `getExpiringGoods` (add missing `/admin` segment), fix `getCategoryChart` to match the pie-chart shape (goods-by-category, not revenue-by-category) at `POST /api/dashboard/admin/goods-category-pie-filtered`. Drop or repurpose `getDashboardKpi`/`getRevenueChart`/`getSalesChart` — no backend target exists; don't leave them silently calling nothing.
- `composables/useAdminDashboard.js` — currently a stub returning `{}`; wire to `summary` + `low-stock` + `expiring-goods`. No order-queue/prescription-review-queue data exists in this controller — those TODOs likely belong to the order/prescription domains, not analytics; out of scope for this task unless re-scoped.
- `composables/useOwnerDashboard.js` — wire to `users-bar-chart-filtered` + `goods-category-pie-filtered` only; most of its original TODOs (revenue, sales trends, top products, staff activity) have no backend data — see Known gaps, don't fabricate.
- `composables/useCustomerDashboard.js` — **leave on mock data.** No backend endpoint exists for a customer-scoped dashboard (see Known gaps). Do not attempt to wire this one.

## Acceptance criteria
- Admin dashboard shows real totals/low-stock/expiring-goods from the live endpoints.
- Owner dashboard shows real user-activity and goods-by-category charts, clearly scoped to what BACK actually provides (don't relabel "goods-by-category count" as "sales by category" in the UI — that would misrepresent the data).
- Customer dashboard is explicitly left unchanged, with a comment pointing at the `FRONTEND_API_TODO.md` entry (once created in Phase 3) rather than silently staying mocked with no trace.

## Known gaps
- Owner dashboard: no revenue, sales-trend, top-products, or staff-activity data anywhere in BACK.
- Customer dashboard: no customer-scoped endpoint at all (no "my orders/prescriptions/reminders" aggregate).
- Admin dashboard: no order-queue / prescription-review-queue data in this controller.
