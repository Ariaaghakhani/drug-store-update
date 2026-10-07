# layouts/

## Purpose
Three top-level page shells selected via `definePageMeta({ layout: ... })`: control the RTL `dir`/font wrapper and which chrome (header/footer, or none) wraps `<NuxtPage />` for storefront, auth, and pharmacist-panel routes.

## Key files
- `default.vue` — storefront shell: `Header` + `<main>` + `Footer`, `dir="rtl"`, `font-dana`.
- `auth.vue` — bare shell for `/login`: no `dir`/font wrapper, no header/footer, just `<NuxtPage />`.
- `panel.vue` — pharmacist-panel shell: `dir="rtl"`, `font-dana`, `<main>` wrapping `<NuxtPage />`, no header/footer of its own.

## Public surface
None declare `<slot/>`s — all render `<NuxtPage />` directly (standard Nuxt layout pattern). Chrome wiring:
- `default.vue` wires in [`components/Header.vue`](../components/CLAUDE.md) (logo, nav links, `/supports` button, cart link, mobile nav) and `components/Footer.vue`.
- `auth.vue` wires in nothing — `pages/login.vue` supplies its own `AuthHero`/step components.
- `panel.vue` wires in nothing itself; the real panel chrome (top bar, bottom tab bar, user menu) lives in [`pages/panel.vue`](../pages/panel/CLAUDE.md) (the page, not the layout).

## Data flow and dependencies
- All three call `useFavicon()` from `assets/composables/useFavicon.js`.
- Neither `auth.vue` nor `panel.vue` reads auth/user state itself — the user-store read (`useUserStore()`, role lookups via `useUserPanelTabs()`) happens in `pages/panel.vue`, not in this layout.

## Gotchas
- `panel.vue` is nearly identical to `default.vue` minus Header/Footer — easy to confuse; the real panel-specific logic (nav, access gating, role-based menu) lives in the page component `pages/panel.vue`, not here.
- `routeRules: { '/panel/**': { ssr: false } }` in `nuxt.config.ts` means everything under this layout is client-only rendered.
- `auth.vue` deliberately omits `dir="rtl"`/`font-dana` — a new auth-flow page expecting RTL globally won't get it from this layout.

Last synced: 209e98b
