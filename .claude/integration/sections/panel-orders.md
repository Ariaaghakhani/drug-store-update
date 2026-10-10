# Section: panel-orders

Branch: `feat/api-4-panel-orders`

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md` (orders sub-section), `pages/panel/CLAUDE.md`
- `shared.md`

## Endpoints
`order/controller/{OrderController,OrderItemController,InvoiceController}.java`, `order/search/controller/OrderSearchController.java`:
- `POST /api/orders/list` body `{page, size}` → Spring `Page<OrderDTO>` — flat "all orders," no status/search/date filter params.
- `POST /api/orders/by-person` body `{personId}` → `List<OrderDTO>` (no pagination) — closest thing to "my orders," but **caller must pass `personId` explicitly** (no JWT auto-scoping).
- `POST /api/orders/by-status` body `{catalogId}` — filters by a **Catalog row ID**, not a string enum.
- `POST /api/orders/by-date` body `{start, end}`.
- `POST /api/search/orders` body `SearchRequestDTO {query, page, size, ...}` → `SearchResultDTO<OrderDocument>` — supports free-text search (good for the admin search box) but not a direct status filter param; `POST /api/search/orders/status/{status}` filters by `statusCode` string instead.
- `services/api/orders.js::updateOrder` (`POST api/orders/update`) **does not exist on BACK** — no update route at all. Same for `updateOrderItem`/`updateInvoice`.

**Status model mismatch (important):** BACK's order status is a per-tenant `Catalog` FK (`OrderDTO.statusId`, no human-readable string on the DTO), not a fixed enum — plus a separate orthogonal `fulfillmentStatus` enum (`SHIPPED`/`READY_FOR_PICKUP`/`DELIVERED`/null). FRONT's `CustomerOrders.vue` hardcodes `pending/processing/shipped/delivered/cancelled`, which matches neither axis. **Needs a decision** (see plan.md "Decisions to review") on which status axis the UI should filter/display, and the tenant's actual catalog values must be fetched, not hardcoded.

`OrderDTO` has no `customerName`/`itemCount`/display `total` fields that `OrdersManagement.vue`'s mock expects — those need a join against `Person` and/or `OrderItemDTO` data, not a direct field read.

## FRONT files to touch
- `services/api/orders.js` — fix/remove `updateOrder`/`updateOrderItem`/`updateInvoice` (no BACK route); add `byPerson`, `byStatus`, `byDate`, and a search wrapper for `OrderSearchController`.
- `components/panel/orders/CustomerOrders.vue` — wire to `by-person` (pass the logged-in user's `personId` from `userStore`), replace hardcoded status options once the status-axis decision is made.
- `components/panel/orders/OrdersManagement.vue` — wire list to `/api/orders/list` or the search endpoint; the stats strip has **no backend aggregate to call** (see Known gaps).

## Acceptance criteria
- Customer order list shows the logged-in user's own real orders.
- Admin order list paginates against real data; search box uses `OrderSearchController`.
- Status display matches whichever axis was decided (fulfillment vs. catalog status) — don't ship the old hardcoded 5-value list.

## Known gaps
- No aggregate/stats endpoint for order counts-by-status or revenue anywhere on BACK — `OrdersManagement.vue`'s stats strip needs either client-side aggregation (expensive without full pagination) or a backend gap entry requesting one. Write to `FRONTEND_API_TODO.md` rather than faking it.
- Role scoping of `/api/orders/list` (does "customer" role even get access, or only `by-person`?) depends on DB-seeded `role_endpoint_permission` data, not visible in source — verify at runtime, don't assume from code.
