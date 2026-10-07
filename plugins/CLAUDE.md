# plugins/

## Purpose
Registers Nuxt 3 app plugins that bootstrap app-wide singletons before components/pages render: a configured HTTP client (`$api`) for talking to the backend and a CMS, and an authentication state object (`$auth`) that hydrates from `localStorage` on the client and initializes as a no-op stub on the server. Together they give every page/component/middleware synchronous access to API calls and auth state via `useNuxtApp()`.

## Key files
- `api.js` — universal plugin (client + server). Creates two `$fetch` instances (`default` → `runtimeConfig.public.BACKEND_URL`, `cms` → `runtimeConfig.public.CMS_URL`), wraps them in a REST-verb caller (`get/post/put/patch/delete`) with GET de-duplication via an in-memory `Map` cache, normalizes responses/errors into a consistent `{ data }` shape, and provides `$api` (built via [`services/api/index.js`](../services/api/CLAUDE.md)'s `createApi`).
- `auth.client.js` — client-only plugin. Builds a reactive `auth` object (`user`, `loggedIn`, `setUser`, `setToken`, `fetchUser`, `reset`), reads/writes the JWT to `localStorage` (`auth.local`), syncs with [`stores/user.js`](../stores/CLAUDE.md), exposes the token via an exported `cachedToken` ref, and provides `$auth` plus an `$authReady` promise.
- `auth.server.js` — server-only plugin. Provides a dummy `$auth` (`user: null`, `loggedIn: false`, no-op methods) and an already-resolved `$authReady`, so SSR code referencing `nuxtApp.$auth`/`$authReady` doesn't throw before the client plugin takes over.

## Public surface
- `$api` — via `const { $api } = useNuxtApp()`. Exposes whatever `createApi` builds (e.g. `$api.auth.fetchUser()`, `$api.auth.logout()`), plus `config.instance` to pick `default` vs `cms`.
- `$auth` — via `useNuxtApp().$auth`. Shape: `{ user, loggedIn, setUser(userData), setToken(token), fetchUser({fetchFromRead}), reset() }`. `user`/`loggedIn` are `readonly()` refs on the client, plain values on the server stub.
- `$authReady` — promise from both auth plugins; resolves once the client plugin finishes its synchronous localStorage init (server resolves immediately). Await it to avoid racing auth hydration.
- `cachedToken` — named export (ref) from `auth.client.js`, imported directly (not via `useNuxtApp`) by `api.js` to attach `Authorization: Bearer <token>` headers client-side, and by [`utils/auth.js`](../utils/CLAUDE.md).

## Data flow and dependencies
- Reads `useRuntimeConfig().public.BACKEND_URL` / `.CMS_URL` (`api.js`).
- `auth.client.js` reads/writes `localStorage['auth.local']` synchronously at init; touches [`stores/user.js`](../stores/CLAUDE.md) (`useUserStore`) via `setUser`/`clearUser`, with a temporary localStorage-sourced fallback for `currentUser` pending a real `/me` endpoint.
- [`middleware/auth.js`](../middleware/CLAUDE.md) independently re-reads `localStorage.getItem('auth.local')` (not via `$auth`) to redirect unauthenticated users, and is skipped entirely in dev (`import.meta.dev`).
- [`utils/auth.js`](../utils/CLAUDE.md)'s `logoutAndResetAuthentication` calls `app.$api.auth.logout()` then `app.$auth.reset()`; invoked from `auth.client.js`'s `fetchUser` on a 401/403.
- `api.js` branches on `import.meta.client` / `import.meta.server` internally rather than via filename suffix; `auth.server.js`/`auth.client.js` share the same provide-slot so only one runs per environment.

## Gotchas
- `api.js` imports `cachedToken` directly from `auth.client.js` — a cross-plugin coupling that only resolves on the client; unused but still graph-coupled on the server.
- `auth.server.js`'s `$auth` is a static dummy (non-reactive) — SSR code expecting reactive `$auth.user`/`loggedIn` updates won't see them; real auth state only exists client-side.
- `middleware/auth.js` checks `localStorage` directly instead of `$auth.loggedIn`/`$authReady`, so it can run before the auth plugin finishes initializing; fully no-ops in dev mode, so auth-gating isn't exercised locally.
- `auth.client.js` still has debug `console.log`/`console.trace` calls (including a trace on every `_user` clear and on `terminateAuthorizedSession`) — leftover debugging instrumentation.
- The real `fetchUser` API call is commented out with a `// TEMPORARY` fallback trusting `userStore.currentUser` from localStorage — user data isn't re-validated against the backend on reload yet.
- No token-expiry handling here; `utils/auth.js` references `tokenGeneratedAtLocalStorageKey` but it isn't set or checked anywhere in these plugin files.

Last synced: 209e98b
