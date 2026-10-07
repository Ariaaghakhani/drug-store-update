# pages/ (storefront)

Covers everything under `pages/` except `pages/panel/**` — see [`pages/panel/CLAUDE.md`](panel/CLAUDE.md) for that.

## Purpose
Customer-facing storefront routes: marketing/info, browsing/buying medications, cart, authentication, and a basic account dashboard. All use the `default` layout, RTL/Farsi content, target end customers.

## Key files
- `/about` — `about.vue` — static marketing page, hardcoded `data()`, no fetching.
- `/account` — `account.vue` — tabbed self-service page (profile/orders/addresses/prescriptions); all mock data, no API calls, no save handlers wired.
- `/cart` — `cart.vue` — cart view backed by [`stores/cart`](../stores/CLAUDE.md); quantity edit/remove, free-shipping threshold, checkout gated on auth.
- `/` — `index.vue` — homepage composed entirely of child components; only sets `useHead` SEO meta itself.
- `/login` — `login.vue` — multi-step auth wizard (phone → password/OTP → register → forgot-password) from `components/auth/*`, wired to `$api.auth.*`.
- `/medications` — `medications/index.vue` — product listing: search, category filter, pagination, add-to-cart; fetches real product list from backend.
- `/medications/[id]` — `medications/[id].vue` — **stub**: only renders `{{ $route.params.id }}`, no fetch, no `definePageMeta`.

## Public surface
- `index.vue` composes [`components/HeroSection.vue`, `CategoriesCarousel.vue`, `FeaturedProducts.vue`, `PopularMedications.vue`, `ChatbotWidget.vue`](../components/CLAUDE.md).
- `cart.vue` composes `components/AuthModal.vue`; reads/writes `useCartStore()` directly; uses Nuxt UI `useToast()` and `this.$auth.loggedIn`/`navigateTo`.
- `login.vue` composes all of [`components/auth/*`](../components/CLAUDE.md) (`AuthHero`, `PhoneStep`, `PasswordStep`, `OtpStep`, `RegisterStep`, `ResetPasswordStep`), switched via `<component :is="currentStepComponent">`. Uses `useNuxtApp()` (`$api`, `$auth`), `useAppToast()`, `useRoute()`, `navigateTo`.
- `medications/index.vue` composes `components/ProductCard.vue` (wrapped in `NuxtLink` to `/medications/:id`), uses `useCartStore()`, `useAppToast()`, `useNuxtApp().$api.products`.
- `account.vue`, `about.vue`, `medications/[id].vue` use only Nuxt UI primitives — no store/composable usage.

## Data flow and dependencies
- `medications/index.vue`: client-only fetch via `onMounted()` (not `useFetch`/`useAsyncData`) calling `app.$api.products.fetchProductsList()` → [`services/api/products.js`](../services/api/CLAUDE.md) → `POST api/goods/list`. Category/search filtering is client-side on the fetched page only. `handleAddToCart` → `useCartStore().addItem(...)`.
- `login.vue`: no fetch on load; all calls on user action against `services/api/auth.js` (`checkUser`, `login`, `loginOtp`, `register`, `sendRegisterOtp`, `forgotPassword`, `forgotPasswordOtp`). On success calls `app.$auth.setToken()`/`setUser()` (from [`plugins/auth.client.js`](../plugins/CLAUDE.md), syncs `stores/user.js`) then `navigateTo(route.query.redirect || '/')`. `definePageMeta({ layout: 'auth' })`.
- `cart.vue`: no API calls; purely reads/mutates the Pinia `cart` store (persists to `localStorage`). Checkout is a stub — `handleCheckout()` redirects to `/login?redirect=/cart` if logged out, otherwise only shows a toast (navigation to a real checkout page is commented out as `// TODO`).
- `account.vue`, `about.vue`, `medications/[id].vue`: no fetch, no store access — static/mock or unimplemented.
- Auth/middleware: only `login.vue` sets page meta (`layout: 'auth'`). None of the other storefront pages apply `middleware/auth.js` — `account.vue` renders with mock data even logged out; `cart.vue` enforces login manually in its own click handler.

## Gotchas
- `medications/[id].vue` is effectively unimplemented — no product-detail endpoint exists in `services/api/products.js` either (only `fetchProductsList`), yet `ProductCard`/`medications/index.vue` link to this route expecting a real page. Flag for Phase 2 gap tracking.
- `medications/index.vue` fetches in `onMounted()`, not `useAsyncData`/`useFetch` — no SSR data, hurts SEO despite being a Nuxt app.
- Category/search on `/medications` filters only the current fetched page (`pageSize` 12), not the full catalog; pagination re-fetches but still applies filters only to the new page.
- `cart.vue`'s `AuthModal` is rendered and wired to `@authenticated` but `handleCheckout` never opens it — redirects to `/login` instead, so `AuthModal` here is dead code on this page.
- `account.vue` has no auth guard and no real backend wiring — treat as a UI mock, not a functional feature.
- `login.vue`'s OTP/session state is page-local (refs + `setInterval`, cleared in `onBeforeUnmount`) — no persistence across navigation.
- `plugins/api.js`'s GET de-dup cache doesn't help `medications/index.vue` since `fetchProductsList` is a POST — every page/category change hits the network fresh.
- `middleware/auth.js` no-ops in dev and only checks `localStorage` client-side; no storefront page actually applies it — auth protection here is ad-hoc (`cart.vue`'s inline check) rather than middleware-driven.

Last synced: 209e98b
