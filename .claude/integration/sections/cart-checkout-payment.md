# Section: cart-checkout-payment

Branch: `feat/api-9-cart-checkout-payment`

## Module docs to read
- `services/api/CLAUDE.md`, `pages/CLAUDE.md` (cart), `stores/CLAUDE.md` (cart)
- `shared.md`

## Endpoints
`payment/controller/{CheckoutController,PaymentController,MockBankController}.java`:
- `POST /api/checkout` — **the single all-in-one checkout call.** Body `CheckoutRequestDTO { personId, items: [{goodsId, batchId, quantity}], deliveryMethod (DELIVERY|PICKUP), addressId, payShippingOnDelivery, paymentMethod (ONLINE|CASH_ON_DELIVERY), gateway ("ZARINPAL"|"MOCK"|...), acceptedTerms }`. Creates the order, reserves inventory, computes price, and creates the payment transaction server-side in one call — **do not call `/api/orders/create` first**, that's a separate generic admin endpoint, not the checkout prerequisite. Returns 201 `CheckoutResponseDTO { orderId, paymentTransactionId, amount, paymentUrl, cashOnDelivery }`.
- `POST /api/checkout/quote` body `CheckoutQuoteRequestDTO { items, deliveryMethod, payShippingOnDelivery }` → `CheckoutQuoteDTO` (subtotal/discount/tax/shipping/total/min-order/free-shipping-threshold/COD-eligibility) — use this to render the cart summary before the real checkout call; mirrors what checkout will actually charge.
- `GET /api/payment/callback/{gateway}?...` — bank's return endpoint; server redirects to the tenant's configured frontend result page, or returns `PaymentResultDTO` JSON directly. **No separate verify/status/list endpoint exists** — don't build a polling UI expecting one.
- Dev/local testing: `gateway: "MOCK"` in the checkout call → response `paymentUrl` points at `/mock-bank/pay/{authority}` (note: path is `/mock-bank/...`, **not** `/api/mock-bank/...`, and it's a plain browser-navigable HTML page with SUCCESS/FAIL buttons) → clicking redirects through `/api/payment/callback/MOCK` → lands on the tenant's result page. Requires the BACK `dev` profile active; works fully locally without a real bank sandbox.

## FRONT files to touch
- `services/api/payments.js` — needs a near-total rewrite; every current export calls a nonexistent path (`api/checkout/init`, `api/payments/verify`, `api/payments/status`, `api/payments/list`, `api/payments/get`, `api/mock-bank/callback`, `api/mock-bank/initiate` — none exist). Replace with: `checkout(checkoutRequestDTO)` → `POST api/checkout`, `quote(checkoutQuoteRequestDTO)` → `POST api/checkout/quote`, `payOrder(orderId, gateway)` → `POST api/payment/order/{orderId}?gateway=...` (for retry-payment on an existing order), `requestPayment(paymentRequestDTO)` → `POST api/payment/request`. The callback is server-handled — FRONT typically never calls `GET api/payment/callback/...` directly; it only needs a result/return page.
- `pages/cart.vue` — `handleCheckout`/`proceedToCheckout` currently only shows a toast with a `// TODO` for real navigation. Build: call `quote` to show the real total → call `checkout` with cart items + chosen address + delivery method + gateway → if `paymentUrl` present, redirect there; if `cashOnDelivery:true` and no `paymentUrl`, show order-placed success directly.
- Add a checkout result/return page (doesn't exist yet) that the bank callback redirect lands on, to show success/failure and link to order details.

## Acceptance criteria
- Full cart → checkout → (mock) payment → return flow works end-to-end locally using `gateway: MOCK`.
- Cash-on-delivery path (no payment redirect) shows an immediate order-placed confirmation.
- Checkout quote total matches what checkout actually charges (no separate client-side price calculation that could drift from BACK's).

## Known gaps
None — BACK fully supports this; `services/api/payments.js` just needs correcting, not new backend work.
