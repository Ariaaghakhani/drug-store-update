# Frontend API TODO

Backend gaps discovered while wiring frontend composables to real endpoints. Each entry is a proposed contract for BACK to implement — not yet built.

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
