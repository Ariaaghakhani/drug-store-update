# pages/ (storefront)

Covers everything under `pages/` except `pages/panel/**` — see [`pages/panel/CLAUDE.md`](panel/CLAUDE.md) for that.

## Purpose
Customer-facing storefront routes: marketing/info, browsing/buying medications, cart, authentication, and a basic account dashboard. All use the `default` layout, RTL/Farsi content, target end customers.

## Key files
- `/about` — `about.vue` — static marketing page, hardcoded `data()`, no fetching.
- `/account` — `account.vue` — tabbed self-service page (profile/orders/addresses/prescriptions); all mock data, no API calls, no save handlers wired.
- `/cart` — `cart.vue` — cart view backed by [`stores/cart`](../stores/CLAUDE.md); quantity edit/remove, free-shipping threshold, checkout gated on auth. Real checkout flow (Phase 2, api-9): a `UModal` fetches a `quote` and the user's addresses, lets them pick delivery method/address/payment method/gateway, then calls `checkout`.
- `/checkout/result` — `checkout/result.vue` — **new**: landing page for the bank's server-side callback redirect (`GET /api/payment/callback/{gateway}` 302s here when the tenant's `PAYMENT_RETURN_URL` setting points at this app). Reads `status`/`orderId`/`paymentToken` from the query string only — no API call — and renders a success/failure/pending state with a link to `/account`.
- `/` — `index.vue` — homepage composed entirely of child components; only sets `useHead` SEO meta itself.
- `/login` — `login.vue` — multi-step auth wizard (phone → password/OTP → register → forgot-password) from `components/auth/*`, wired to `$api.auth.*`.
- `/medications` — `medications/index.vue` — product listing: search, category filter, pagination, add-to-cart; fetches real product list from backend.
- `/medications/[id]` — `medications/[id].vue` — product detail page: fetches a single product via `$api.goods.getGoods`, renders name/price/description/prescription badge/image, has a loading skeleton and a not-found state, add-to-cart.

## Public surface
- `index.vue` composes [`components/HeroSection.vue`, `CategoriesCarousel.vue`, `FeaturedProducts.vue`, `PopularMedications.vue`, `ChatbotWidget.vue`](../components/CLAUDE.md).
- `cart.vue` — `<script setup>` (converted from Options API in api-9). Composes `components/AuthModal.vue`; reads/writes `useCartStore()` directly; uses `useUserStore()` for `personId` (`userStore.currentUser?.person?.id`); uses Nuxt UI `useToast()`, `useNuxtApp().$auth.loggedIn`/`navigateTo`, and `$api.payments`/`$api.address` for the checkout modal.
- `checkout/result.vue` — standalone, no store/API usage; pure query-string → UI mapping.
- `login.vue` composes all of [`components/auth/*`](../components/CLAUDE.md) (`AuthHero`, `PhoneStep`, `PasswordStep`, `OtpStep`, `RegisterStep`, `ResetPasswordStep`), switched via `<component :is="currentStepComponent">`. Uses `useNuxtApp()` (`$api`, `$auth`), `useAppToast()`, `useRoute()`, `navigateTo`.
- `medications/index.vue` composes `components/ProductCard.vue` (wrapped in `NuxtLink` to `/medications/:id`), uses `useCartStore()`, `useAppToast()`, `useNuxtApp().$api.products`.
- `medications/[id].vue` uses `useCartStore()`, `useAppToast()`, `useFormat()` (for `formatPrice`), `useNuxtApp().$api.goods.getGoods`. No child components — plain `UContainer`/`UBadge`/`UButton`/`USkeleton`.
- `account.vue`, `about.vue` use only Nuxt UI primitives — no store/composable usage.

## Data flow and dependencies
- `medications/index.vue`: client-only fetch via `onMounted()` (not `useFetch`/`useAsyncData`) calling `app.$api.products.fetchProductsList()` → [`services/api/products.js`](../services/api/CLAUDE.md) → `POST api/goods/list`. Category/search filtering is client-side on the fetched page only. `handleAddToCart` → `useCartStore().addItem(...)`.
- `login.vue`: no fetch on load; all calls on user action against `services/api/auth.js` (`checkUser`, `login`, `loginOtp`, `register`, `sendRegisterOtp`, `forgotPassword`, `forgotPasswordOtp`). On success calls `app.$auth.setToken()`/`setUser()` (from [`plugins/auth.client.js`](../plugins/CLAUDE.md), syncs `stores/user.js`) then `navigateTo(route.query.redirect || '/')`. `definePageMeta({ layout: 'auth' })`.
- `cart.vue`: reads/mutates the Pinia `cart` store (persists to `localStorage`) for the item list; `handleCheckout()` still redirects to `/login?redirect=/cart` if logged out. Logged-in: `proceedToCheckout()` opens the checkout modal, loads the customer's addresses (`$api.address.getAddresses`, defaulting to the `isDefault` one) and a price `quote` (`$api.payments.quote`) in parallel, and re-quotes on delivery-method/pay-on-delivery changes. Cart items are mapped to `CheckoutItemDTO` as `{ goodsId: item.id, batchId: item.batchId ?? null, quantity: item.quantity }` — `batchId` is always `null` today since the demo `products` store has no batch concept. On confirm, `confirmCheckout()` calls `$api.payments.checkout`; if the response has `paymentUrl` the cart is cleared and the browser is redirected there via `navigateTo(url, { external: true })` (works for both the real gateways and the local `MOCK` gateway's `/mock-bank/pay/{authority}` page); if `cashOnDelivery: true` instead, the cart is cleared and the modal shows an inline success state instead of redirecting.
- `medications/[id].vue`: client-only fetch via `onMounted()` (same pattern as `medications/index.vue`, not `useFetch`/`useAsyncData` — no SSR data) calling `app.$api.goods.getGoods({ id: route.params.id })` → `services/api/goods.js` → `POST api/goods/get`, unwraps `response.data.data`. Any thrown/missing-data response flips a single `notFound` state (covers both 404 and generic errors) rendering the not-found empty state; no separate toast on failure. `handleAddToCart` → `useCartStore().addItem(...)`, same success-toast pattern as `medications/index.vue`. Images come from `GoodsDTO.attachments[].url` (primary attachment preferred, first as fallback) — there is no flat `images` array on the DTO.
- `account.vue`, `about.vue`: no fetch, no store access — static/mock or unimplemented.
- Auth/middleware: only `login.vue` sets page meta (`layout: 'auth'`). None of the other storefront pages apply `middleware/auth.js` — `account.vue` renders with mock data even logged out; `cart.vue` enforces login manually in its own click handler.

## Gotchas
- `medications/[id].vue` is now implemented via `services/api/goods.js::getGoods` (`POST api/goods/get`), not `products.js`. `GoodsDTO` has no stock/availability field for simple (non-variant) products — only `GoodsVariantDTO.availableQuantity` exists, for variant products. The page intentionally shows no stock UI for simple products rather than fabricating one; see `FRONTEND_API_TODO.md` ("No stock/availability field on simple-product GoodsDTO").
- `medications/index.vue` and `medications/[id].vue` both fetch in `onMounted()`, not `useAsyncData`/`useFetch` — no SSR data, hurts SEO despite being a Nuxt app.
- Category/search on `/medications` filters only the current fetched page (`pageSize` 12), not the full catalog; pagination re-fetches but still applies filters only to the new page.
- `cart.vue`'s `AuthModal` is rendered and wired to `@authenticated` but `handleCheckout` never opens it — redirects to `/login` instead, so `AuthModal` here is still dead code on this page (unchanged by the api-9 checkout work).
- `cart.vue`'s checkout modal has no `/panel`-style form validation beyond disabling the confirm button; a failed `checkout` call just toasts `error.response.data.message` and leaves the modal open for retry.
- The checkout gateway selector only lists `MOCK`/`ZARINPAL` client-side — it doesn't check which gateways the tenant actually has configured (no endpoint exists on the storefront side for that yet).
- `account.vue` has no auth guard and no real backend wiring — treat as a UI mock, not a functional feature.
- `login.vue`'s OTP/session state is page-local (refs + `setInterval`, cleared in `onBeforeUnmount`) — no persistence across navigation.
- `plugins/api.js`'s GET de-dup cache doesn't help `medications/index.vue` since `fetchProductsList` is a POST — every page/category change hits the network fresh.
- `middleware/auth.js` no-ops in dev and only checks `localStorage` client-side; no storefront page actually applies it — auth protection here is ad-hoc (`cart.vue`'s inline check) rather than middleware-driven.

Last synced: 209e98b
