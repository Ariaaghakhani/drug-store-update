> **STATUS (2026-10-29): implemented by the backend** — see `FRONTEND_PAYMENT_FLOW.md` (Downloads). Note the final redirect path is `/checkout/result`, not `/checkout/redirect`. Kept for history.

# Backend request: redirect the browser to the store frontend after payment

> **خلاصه به فارسی:** فرانت در لحظه‌ی شروع پرداخت (`POST /api/checkout`، `POST /api/payment/order/{id}`،
> `POST /api/wallet/my/top-up`) دامنه‌ی خودش را می‌فرستد. بعد از برگشت از بانک
> (`GET /api/payment/callback/{gateway}`) بک‌اند مرورگر را با 302 به
> `{domain}/checkout/redirect?status=..&orderId=..&paymentToken=..` می‌فرستد. فرانت در `onMounted` همان صفحه چند API
> صدا می‌زند (نتیجه‌ی پرداخت، سفارش) و نتیجه را نشان می‌دهد. دامنه باید در لیست دامنه‌های مجاز فروشگاه باشد (ضد open redirect).

Frontend repo: `drug-store` (Nuxt 3). Written 2026-10-28.

---

## 1. What exists today (verified in `PaymentReturnUrlResolver`)

The callback already 302s to a frontend page, but the target comes from the **tenant setting `PAYMENT_RETURN_URL`**:

- Read via `systemSettingService.get(SettingKey.PAYMENT_RETURN_URL)`.
- Only used if its origin is in the tenant's `allowedOrigins` (SYSTEM tenant: `app.cors.allowed-origins`); otherwise the
  callback falls back to JSON.
- Query string appended: `orderId` (or `walletTopUp=true` for a wallet top-up), `status`, `paymentToken`.

## 2. What we need

The frontend must **send its own domain with the payment-start request**, and the backend must redirect to
`{domain}/checkout/redirect` instead of depending only on the tenant setting. Reasons: one backend serves several
frontends (production, staging, preview, local dev, a store's custom domain), and a single global setting cannot be right
for all of them.

### 2.1 New request field

Add an optional field to the three payment-start requests:

| Endpoint | Field |
|---|---|
| `POST /api/checkout` (`CheckoutRequestDTO`) | `returnOrigin` |
| `POST /api/payment/order/{orderId}` (retry) | `returnOrigin` (body, or query param — no body today, so a query param is fine) |
| `POST /api/wallet/my/top-up` | `returnOrigin` |

- Type: string, an **origin only**, e.g. `https://shop.example.com` or `http://localhost:3000`. No path, no query.
  (If a path is sent, ignore it and keep scheme + host + port.)
- Optional. If absent, keep today's behaviour (`PAYMENT_RETURN_URL` setting, then JSON fallback).

### 2.2 Validate it (must, otherwise the callback is an open redirect)

- Normalise with `TenantService.normalizeOrigin` and accept it **only if it is in the tenant's allowed origins** — the same
  `allowedOrigins()` check `PaymentReturnUrlResolver` already does.
- If it is not allowed: reject the start request with **400** (`payment.return-origin.not-allowed`), do not silently
  ignore it, so the frontend sees the misconfiguration immediately.
- Validate at start time (fail early), and persist the normalised value on the `PaymentTransaction`
  (new column, e.g. `return_origin`, nullable). **Do not** re-read it from the callback request: the bank calls the
  callback, not our frontend, so there is no `Origin` header to trust and the value must come from the stored transaction.

### 2.3 Redirect on callback

In `GET /api/payment/callback/{gateway}`, after the transaction is settled, respond **302** to:

```
{transaction.returnOrigin}/checkout/redirect?status=<PaymentStatus>&orderId=<id>&paymentToken=<token>
```

- Wallet top-up: replace `orderId` with `walletTopUp=true` (as today).
- Query params to include, all URL-encoded:

| Param | Value | Notes |
|---|---|---|
| `status` | `PaymentStatus` enum name (`COMPLETED`, `VERIFIED`, `FAILED`, `CANCELED`, `EXPIRED`, ...) | same as today |
| `orderId` | order id | omitted for a wallet top-up |
| `walletTopUp` | `true` | only for a wallet top-up |
| `paymentToken` | our `paymentToken` | same as today; this is the key the frontend uses for follow-up calls |

- Path is fixed: `/checkout/redirect`. It does not need to be configurable.
- Success **and** failure both redirect to the same page — the frontend reads `status`. A bank-side failure/cancel must
  also redirect (not return JSON) as long as a `returnOrigin` is stored on the transaction.
- Resolution order: stored `returnOrigin` → `PAYMENT_RETURN_URL` setting (existing behaviour, keep it as the fallback) → JSON.

### 2.4 Reachable-by-token result endpoint (needed for the page's on-mount calls)

The page will call the backend on mount. Today the query string only carries `status`/`orderId`/`paymentToken`, and there is
no endpoint to get the rest of `PaymentResultDTO` (amount, refId, masked card, gateway, order summary). Please add:

```
GET /api/payment/result/{paymentToken}
```

- Returns `ApiResponse<PaymentResultDTO>`.
- Auth: **must work right after the bank redirect**, when the browser may have no valid access token yet (the access token
  lives in memory/localStorage; the refresh cookie is `HttpOnly`). Either (a) make it public and only return data for an
  unguessable `paymentToken` (never an enumerable id) with no sensitive fields beyond amount / status / masked card /
  order id, or (b) require login and rely on the frontend's refresh-then-retry. Option (a) is simpler for the user; please
  tell us which you pick.
- Idempotent: the page can be refreshed or revisited from browser history and must show the same result.
- `404` for an unknown token.

After this the page also calls `POST /api/orders/get` `{ id: orderId }` (already exists) for the order summary.

## 3. Frontend contract

- The frontend sends `returnOrigin: window.location.origin` on the three start requests.
- The page `/checkout/redirect` runs on mount: reads `status`/`orderId`/`walletTopUp`/`paymentToken` from the URL, calls
  `GET /api/payment/result/{paymentToken}` and `POST /api/orders/get`, then shows success/failure and a link to the order.
- Note for us (not backend): `/checkout/redirect` is currently the **pre-gateway** interstitial (`url`/`gateway`/`amount`
  params) and `/checkout/result` is the post-payment page. The page will serve both roles, told apart by the query params
  (`url` present → interstitial; `status` present → result), or we rename one — decision is on the frontend side and does
  not change this backend request.

## 4. Acceptance checklist

- [ ] `returnOrigin` accepted on checkout, retry-payment and wallet top-up; 400 when not an allowed origin
- [ ] Origin persisted on `PaymentTransaction`; callback uses the stored value, never the callback request's headers
- [ ] Callback 302s to `{origin}/checkout/redirect?status=&orderId=&paymentToken=` (or `walletTopUp=true`) for success **and** failure
- [ ] Missing `returnOrigin` falls back to the `PAYMENT_RETURN_URL` setting, then JSON — nothing existing breaks
- [ ] `GET /api/payment/result/{paymentToken}` returns the full `PaymentResultDTO`, safe to call repeatedly
- [ ] Local dev origin (`http://localhost:3000`) and staging origins can be added to a store's allowed origins

---

## 5. Local development: `http://localhost:3000` + the MOCK gateway

The whole flow must work end to end on a developer machine with no real bank:

1. Frontend (`http://localhost:3000`) calls `POST /api/checkout` with `gateway: "MOCK"` and `returnOrigin: "http://localhost:3000"`.
2. `MockGatewayProvider` returns `paymentUrl = {payment.callback-base-url}/mock-bank/pay/{authority}`; the frontend
   interstitial sends the browser there (backend-rendered page, dev profile only).
3. The mock bank page hits `GET /api/payment/callback/MOCK?authority=…&status=…`.
4. The callback settles the transaction and 302s to `http://localhost:3000/checkout/redirect?status=…&orderId=…&paymentToken=…`.

What to check / change for this to work:

- `http://localhost:3000` (exact scheme + host + port; `localhost` and `127.0.0.1` are different origins) must be accepted
  by the `returnOrigin` check. For the SYSTEM tenant that list is `app.cors.allowed-origins`: make sure the **dev profile**
  includes it. For a non-SYSTEM tenant it is that tenant's `allowedOrigins`. Do **not** hardcode localhost as always
  allowed in production config.
- `TenantService.normalizeOrigin` must keep the port (`http://localhost:3000`, not `http://localhost`).
- The MOCK bank page must pass through **both** outcomes (a "pay" and a "fail/cancel" button) so both redirects can be
  tested; each one ends in the same `/checkout/redirect` redirect with a different `status`.
- The stored `returnOrigin` is used for MOCK exactly like for a real gateway — no special-casing of the mock provider.
- `payment.callback-base-url` is the **backend's** public URL (what the bank/mock page calls), unrelated to `returnOrigin`.

---

## 6. Ready-to-paste prompt for the backend repo

> Implement the feature described in `BACKEND_PAYMENT_REDIRECT.md` (copy that file into the backend repo first).
>
> Context: the Spring Boot module is `com.pouyanplatform.backend.payment`. `PaymentReturnUrlResolver` currently builds the
> post-callback redirect from the tenant setting `PAYMENT_RETURN_URL` and only accepts origins in the tenant's
> `allowedOrigins` (SYSTEM tenant: `app.cors.allowed-origins`). The callback is `PaymentController` →
> `GET|POST /api/payment/callback/{gateway}`, returning `outcome.redirectUri()` as a 302.
>
> Do this:
> 1. Add an optional `returnOrigin` string to `CheckoutRequestDTO`, to the wallet top-up request, and as an optional query
>    param on `POST /api/payment/order/{orderId}`.
> 2. At payment start, normalise it with `TenantService.normalizeOrigin` (origin only, keep the port) and validate it
>    against the same allowed-origins set `PaymentReturnUrlResolver.allowedOrigins()` uses. Reject with 400
>    (`payment.return-origin.not-allowed`) if it isn't allowed. Persist the normalised value on `PaymentTransaction`
>    (new nullable column `return_origin` + migration).
> 3. In `PaymentReturnUrlResolver.resolve`, prefer the transaction's stored `return_origin`, building
>    `{returnOrigin}/checkout/redirect?status=&orderId=&paymentToken=` (or `walletTopUp=true` instead of `orderId`). Fall back
>    to the `PAYMENT_RETURN_URL` setting, then JSON, as today. Redirect on failure/cancel too, not only on success. Never read
>    the origin from the callback request.
> 4. Add `GET /api/payment/result/{paymentToken}` returning `ApiResponse<PaymentResultDTO>` (idempotent, 404 on unknown
>    token; safe to call right after the bank redirect — choose public-by-unguessable-token or login-required and document it).
> 5. Make it work on `http://localhost:3000` with the MOCK gateway in the dev profile: add that origin to the dev
>    `app.cors.allowed-origins`, confirm `normalizeOrigin` keeps the port, and make sure the mock bank page can finish as both
>    success and failure.
> 6. Add tests: allowed vs disallowed `returnOrigin`, redirect URL shape for order payment, wallet top-up and failure,
>    fallback to `PAYMENT_RETURN_URL` when `returnOrigin` is absent, and the result endpoint.
>
> Don't break existing behaviour when `returnOrigin` is absent. Update the API docs and tell me the final contract
> (field names, error code, result-endpoint auth).
