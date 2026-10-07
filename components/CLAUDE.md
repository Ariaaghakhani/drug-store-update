# components/ (top-level, auth/, dashboard/)

Covers `components/*.vue` top-level, `components/auth/`, `components/dashboard/{admin,customer,owner}/`. See [`components/panel/CLAUDE.md`](panel/CLAUDE.md) for the panel-management components.

## Purpose
Global presentational and feature components for the public storefront shell (header/footer/hero/product grids, AI chatbot widget), the phone/OTP/password authentication flow, and the role-based `/panel/dashboard` views (admin, owner, customer).

## Key files
- `Header.vue` — sticky nav; cart dropdown (Teleport to body), mobile menu, dark-mode toggle, auth-aware profile button.
- `Footer.vue` — static footer, no script logic.
- `HeroSection.vue` — landing hero text + search box; embeds `HeroCarousel`.
- `HeroCarousel.vue` — self-contained autoplay/swipe carousel, no store/API deps.
- `CategoriesCarousel.vue` — scrollable category chips; navigates to `/medications?category=...`.
- `FeaturedProducts.vue` / `PopularMedications.vue` — hardcoded product/medication grids; render `ProductCard`/`UCard`.
- `ProductCard.vue` — reusable product tile, used by `FeaturedProducts` and the catalog page.
- `StatsSection.vue` — static stats cards, no logic.
- `ChatbotWidget.vue` — floating AI chat widget driven by [`stores/chat`](../stores/CLAUDE.md) and `stores/cart`.
- `AuthModal.vue` — standalone **legacy** login/register modal with simulated (`setTimeout`) calls; still mounted only from `pages/cart.vue`.
- `auth/PhoneStep.vue`, `PasswordStep.vue`, `OtpStep.vue`, `RegisterStep.vue`, `ResetPasswordStep.vue`, `AuthHero.vue` — the real, current login flow steps, driven entirely by `pages/login.vue`.
- `dashboard/admin/AdminDashboard.vue` — renders real data from [`composables/useAdminDashboard`](../composables/CLAUDE.md) (store summary, low-stock, expiring goods); order-queue/prescription-review-queue sections remain TODO placeholders (no BACK endpoint).
- `dashboard/owner/OwnerDashboard.vue` — renders real data from [`composables/useOwnerDashboard`](../composables/CLAUDE.md) (user-activity bar chart, goods-by-category pie chart only); revenue/sales-trend/top-products/staff-activity sections remain TODO placeholders (no BACK endpoint — see `FRONTEND_API_TODO.md`).
- `dashboard/customer/CustomerDashboard.vue` — orchestrates the customer dashboard via [`composables/useCustomerDashboard`](../composables/CLAUDE.md).
- `dashboard/customer/{DashboardStats,OrderTracking,PrescriptionsList,RefillReminders,ReorderGrid}.vue` — presentational cards, props-in/emits-out, with `loading` skeleton states.

## Public surface
- `ProductCard` — prop `product: Object` (required); emits `addToCart` (camelCase — note casing when wiring listeners elsewhere, which mostly use kebab-case).
- `AuthModal` — props `modelValue: Boolean`, `redirectAfterAuth: String`; emits `update:modelValue`, `authenticated`.
- `auth/PhoneStep` — props `phoneNumber`, `loading`; emits `update:phoneNumber`, `submit`.
- `auth/PasswordStep` — props `password`, `error`, `loading`; emits `update:password`, `update:error`, `submit`, `switchToOtp`, `forgotPassword`, `goBack`.
- `auth/OtpStep` — props `digits` (array), `error`, `timer`, `loading`, `context` (`'login'|'register'|'forgot-password'`); emits `update:digits`, `update:error`, `submit`, `resend`, `switchToPassword`, `goBack`; exposes `focusFirst()` via `defineExpose`. "Switch to password" button only shown when `context === 'login'`.
- `auth/RegisterStep` / `ResetPasswordStep` — prop `form: Object` (required, must contain an `errors` sub-object the component mutates directly), `loading`; emit `update:form`, `submit`, `goBack`.
- `auth/AuthHero` — no props, decorative only, hidden below `md:`.
- `dashboard/customer/*` — accept `loading: Boolean` + data props, emit `track`/`shop`/`viewAll`/`upload`/`order`/`add`.
- `AdminDashboard`/`OwnerDashboard` — no props/emits; read their composables directly (see Key files).
- Composables read: `useCustomerDashboard`, `useFormat` (`DashboardStats`/`ReorderGrid`), `useUserPanelTabs` (used by `pages/panel/dashboard.vue`, not the components themselves).
- Stores read: `useCartStore` (`Header`, `FeaturedProducts`, `ChatbotWidget`, `CustomerDashboard`); `useChatStore` (`ChatbotWidget`, `HeroSection`).
- Services/API: only `pages/login.vue` calls real endpoints via `$api.auth.*` (see [`services/api/CLAUDE.md`](../services/api/CLAUDE.md)); no `components/auth/*`/`dashboard/*` component calls the API directly. `AuthModal.vue` and `useCustomerDashboard.js` only simulate network calls.

## Data flow and dependencies
- `pages/login.vue` is the sole consumer of `components/auth/*`, owning all state and wiring every step's emits; steps swap via a `currentStep` string machine (`phone → password/register → otp-login/otp-register/forgot-password-otp → reset-password`).
- `pages/panel/dashboard.vue` picks `AdminDashboard`/`OwnerDashboard`/`CustomerDashboard` based on `useUserPanelTabs().getUserRole()` — the only role gating in this module; the dashboard components themselves have no auth checks.
- `CustomerDashboard.vue` depends on `useCustomerDashboard` (mocked) and `useCartStore`/`useToast` for add-to-cart actions.
- `Header.vue` depends on `useCartStore`, `useColorMode`, `this.$auth.loggedIn` to route "profile" clicks to `/panel` vs `/login?redirect=/panel`.
- `ChatbotWidget.vue`/`AuthModal.vue` both call `useNuxtApp().$auth.setToken(...)` directly rather than via a dedicated composable.
- Landing components (`HeroSection`, `HeroCarousel`, `CategoriesCarousel`, `FeaturedProducts`, `PopularMedications`, `StatsSection`) are assembled on `pages/index.vue`; all use hardcoded Farsi mock data.

## Gotchas
- **Two parallel, inconsistent auth flows**: the real one (`auth/*` + `pages/login.vue`) and a legacy dead-end one (`AuthModal.vue`, simulated) still mounted from `pages/cart.vue`. Future login-logic edits won't propagate to the cart modal unless both are updated.
- **RTL-specific scroll math**: `CategoriesCarousel`/`HeroCarousel` invert normal LTR scroll-direction logic because the app is RTL — don't "fix" these to look like standard LTR code.
- `RegisterStep`/`ResetPasswordStep` mutate `form.errors` in place via a two-way computed over the `form` prop — passing an object without an `errors` key throws.
- `OtpStep`'s `context` prop drives conditional UI; an unlisted value fails the prop validator (dev warning only, doesn't throw).
- Admin/owner dashboard data is now real (store-wide aggregates only — no per-user scoping on BACK). Customer dashboard (`useCustomerDashboard`) is still entirely mocked — no backend equivalent exists.
- Role gating is coarse (`admin | owner | else→customer`) and lives in the page, not the dashboard components.
- `ProductCard` emits `addToCart` (camelCase) while the app otherwise uses kebab-case event names — check casing when adding listeners.
- `Header`'s cart dropdown position is computed manually in JS, not CSS/popper.

Last synced: 209e98b
