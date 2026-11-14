# Shared conventions — Phase 2/3

## Request/response envelope (confirmed across all 7 domains checked)

Every BACK endpoint wraps its body in `ApiResponse<T>`: `{ success, message, data, status, errorCode? }`. The real payload is always in `.data`.

FRONT's `plugins/api.js` adds its own wrapping on top, **asymmetrically**:
- Success: `onResponse` sets `response._data = { data: response._data }` → the real backend payload is at `response.data.data` (two levels: FRONT's wrapper, then BACK's `ApiResponse.data`).
- Error: `onResponseError` sets `response.data = response._data` (one level only) → `error.response.data` is BACK's raw error body directly (`{success:false, message, data, status, errorCode}`), `error.response.status` is the HTTP status.

**Every section below must read success via `response.data.data`, not `response.data`, and errors via `error.response.data` directly.** Getting this wrong (reading `response.data` on success, or expecting `error.response.data.data` on failure) is the single most common mistake risk across every task — call it out in PR descriptions.

Pagination is **not uniform** across BACK domains — check each domain's actual DTO:
- Goods (`/api/goods/list`, `/api/goods/filter`): `PageResponse<T> { content, totalElements, totalPages, page (1-based), size }` — no `hasNext`, no `pageNumber`.
- Orders (`/api/orders/list`): Spring `Page<OrderDTO>` (standard Spring pagination fields).
- Search endpoints (`/api/search/orders`, `/api/search/goods`): `SearchResultDTO<T> { content, totalElements, totalPages, page, size, first, last, empty }`.
Don't assume one shape fits all; verify per-endpoint when wiring.

## Known cross-cutting bugs to fix opportunistically

- `services/api/auth.js::submitOtp` calls `this.login(config)`/`this.register(config)` without `return`/`await` — the result is silently dropped. Fix when touching any task that uses `auth.js`.
- `services/api/panel/address.js::addAddress`'s success handler reads `response?.data?.id`; per the envelope above it should be `response?.data?.data?.id`. This is a live bug in the one call that's actually wired up today.

## Role/permission gating reality

Almost nothing on BACK uses hardcoded `@PreAuthorize` role checks. Access is **dynamic and DB-driven**: a `role_endpoint_permission` table (managed via `EndpointPermissionController`/`RoleEndpointPermissionController`, modules like `ORDER`, `USER_MANAGEMENT`, `ADDRESS`, etc.) decides per-role access to each concrete endpoint at runtime. This means:
- You cannot tell from the Java source alone whether a given role can call a given endpoint — it depends on seeded DB data. Flag this as "needs runtime verification" rather than asserting it in a PR.
- FRONT's own role model (`stores/roles.ts`: 3 domains × 4 actions, 5 roles) **does not match** this mechanism at all — see the `panel-users-roles` section for the big finding there.

## FRONTEND_API_TODO.md entry template

Not created yet — Phase 3 task subagents create/append to it per the brief below. Each entry:

```
## <Short title>
- Status: missing | mismatch | needs-change
- Needed by: <FRONT page/component>, FRONT PR <link>
- Endpoint: <METHOD /path> (proposed if missing)
- Request: <params/body with types>
- Expected response: <JSON shape with types, nullability>
- Current behavior: <what BACK returns today, per source>
- Why: <one line of product reason>
- Date: <YYYY-MM-DD>
```

Before appending, search `FRONTEND_API_TODO.md` for the title — don't duplicate.

## Known backend gaps found during Phase 2 discovery (pre-flagged so Phase 3 subagents don't have to rediscover these)

These have **no BACK endpoint today** — confirmed by reading the relevant controllers, not assumed. Phase 3 tasks touching these areas should write a `FRONTEND_API_TODO.md` entry rather than attempt to "integrate" something that doesn't exist:

1. Admin order list: no single endpoint combining pagination + search + status filter + date range; no order-count/revenue aggregate endpoint anywhere (`OrderController`, `OrderSearchController`, `InvoiceController` all checked).
2. Owner dashboard: no revenue, sales-trend, top-products, or staff-activity data anywhere in `analytics.dashboard`. Only store-wide user-active/inactive counts and goods-by-category counts exist.
3. Customer self-service dashboard: no customer-scoped "my orders / my prescriptions / my reminders" endpoint anywhere — `DashboardController` is 100% store-wide/admin aggregate, no per-user filtering at all.
4. Security page: no self-service "list my active sessions," "revoke one session," or "revoke all sessions while staying logged in" endpoint (the underlying `revokeAll`/`revokeAllForUser` service methods exist but aren't exposed to a self-service controller route — this would be a thin new endpoint, not new infrastructure).
5. Security page: no 2FA/TOTP concept anywhere in BACK.
6. Security page: no user-facing login-history endpoint (only internal admin/business audit logging, not scoped to "my logins").
7. Security page: no security-alerts/notifications-preferences concept anywhere in BACK.

## Decision needed before `panel-users-roles` can be scoped (see that section)

FRONT's `UserPermissionsPanel` concept (fixed 3-domain × 4-action checkbox grid, from `stores/roles.ts`) cannot be wired to BACK as designed — BACK's real permission mechanism is a variable-length, module-grouped list of concrete HTTP-endpoint grants (`EndpointPermissionController`'s `/grouped`), not a 3×4 matrix. This needs a UI redesign decision, not just a wiring fix — flagged in "Decisions to review" in `plan.md`.
