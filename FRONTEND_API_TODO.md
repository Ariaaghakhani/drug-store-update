# Frontend API Gaps

Entries document a mismatch between what a FRONT screen needs and what BACK (`PouyanPlatform`) currently exposes. Each entry is written by whichever task/PR found the gap.

## Order fulfillment status missing from OrderDocument (admin search index)
- Status: missing
- Needed by: components/panel/orders/OrdersManagement.vue
- Endpoint: `POST /api/search/orders` and `POST /api/search/orders/status/{status}` (existing — field addition proposed)
- Request: unchanged
- Expected response: `OrderDocument` gains `fulfillmentStatus: 'SHIPPED' | 'READY_FOR_PICKUP' | 'DELIVERED' | null`
- Current behavior: `OrderDocument` (`order/search/document/OrderDocument.java`) only has `personFullName`, `status`, `statusCode`, `totalAmount`, `dateOrdered`, `items` — no `fulfillmentStatus`. `OrderDTO` (returned by `/api/orders/list`, `/api/orders/get`, `/api/orders/by-person`) does carry `fulfillmentStatus`, but that endpoint has no `personFullName`/customer name, so the admin list — wired to the search endpoint for customer-name + free-text search — can only show the payment/order-status axis per row today. Showing fulfillment too would require one `/api/orders/get` call per visible row (N+1), which we chose not to do.
- Why: product decision requires showing both the payment/order status and fulfillment status per row in the admin order list; currently only the payment/order status is shown there (CustomerOrders.vue, which uses `/api/orders/by-person` → `OrderDTO`, already shows both axes correctly).
- Date: 2026-10-07

## No order aggregate/stats endpoint
- Status: missing
- Needed by: components/panel/orders/OrdersManagement.vue
- Endpoint: `GET /api/orders/stats` (proposed) or similar
- Request: none, or `{ from?: Date, to?: Date }`
- Expected response: `{ totalOrders: number, countByStatus: Record<string, number>, revenueToday: number, revenueTotal: number }`
- Current behavior: checked `OrderController`, `OrderSearchController`, `InvoiceController` — no endpoint returns counts-by-status or revenue aggregates. Worked around this by calling `/api/search/orders` and `/api/search/orders/status/{code}` with `size: 1` per status to read `SearchResultDTO.totalElements` (real, exact counts — not estimates) for the "کل سفارشات" and per-status stat tiles. There is still no way to get a true revenue total/"today's revenue" without fetching and summing every order, so the stats strip's revenue tile sums only the currently-loaded page of results and is labeled "جمع این صفحه" (sum of this page) instead of implying a global total.
- Why: a real stats/aggregate endpoint would let the stats strip show true revenue figures (today/this month/total) instead of a page-scoped approximation.
- Date: 2026-10-07

## No update endpoint for orders, order-items, or invoices
- Status: missing
- Needed by: components/panel/orders/OrdersManagement.vue, components/panel/orders/CustomerOrders.vue (future order-status-change actions)
- Endpoint: `POST /api/orders/update`, `POST /api/order-items/update`, `POST /api/invoices/update` (proposed)
- Request: `{ id: number, ...fields }` per entity
- Expected response: `ApiResponse<OrderDTO | OrderItemDTO | InvoiceDTO>`
- Current behavior: `OrderController`, `OrderItemController`, `InvoiceController` (BACK) only expose `create`/`get`/`list`/`delete` (+ `by-*` filters on `OrderController`) — no `/update` route exists for any of the three. `services/api/orders.js` previously had `updateOrder`/`updateOrderItem`/`updateInvoice` wrappers pointing at nonexistent `.../update` routes; removed them in this change rather than leave dead calls. Order status transitions on BACK go through dedicated flows instead (`OrderFulfillmentService.ship/readyForPickup/deliver`, `CashOnDeliveryService.markPaid/cancel`), none of which are exposed as REST endpoints yet either.
- Why: the admin panel will eventually need to change order status / mark fulfillment steps from the UI (e.g. the "بررسی" button in OrdersManagement.vue); no endpoint exists for that today.
- Date: 2026-10-07
