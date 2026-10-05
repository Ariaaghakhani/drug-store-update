# middleware/

## Purpose
Route guards intended to protect authenticated/role-gated pages: `auth.js` for generic "must be logged in," `panel-access.js` for login + pharmacist-panel role/route access. Both are named (non-global) Nuxt middleware, meant to be opted into via `definePageMeta({ middleware: [...] })`.

## Key files
- `auth.js` — `defineNuxtRouteMiddleware`, client-only token check, redirects to `/login?redirect=<path>`.
- `panel-access.js` — `defineNuxtRouteMiddleware` (async), client-only, checks token + `userStore.currentUser`, awaits `$authReady`, redirects bare `/panel` to `/panel/dashboard`, gates other `/panel/*` paths via `useUserPanelTabs().hasAccessToRoute`.

## Public surface
**Neither file is currently referenced by name anywhere in `pages/`** (no `definePageMeta({ middleware: 'auth' })` or `'panel-access'`, and neither has a `.global.js` suffix, so Nuxt won't auto-apply them). Routes that are actually protected do it with their own inline middleware instead:
- `pages/login.vue` sets `layout: 'auth'` only.
- [`pages/panel.vue`](../pages/panel/CLAUDE.md) sets `layout: 'panel'` and supplies its own inline `middleware: (to) => {...}` in `definePageMeta` that **re-implements** the token check + redirect + `hasAccessToRoute` gating directly, duplicating `panel-access.js` rather than importing it.
- `pages/panel/users.vue`, `pages/panel/products/*.vue` set only `layout: 'panel'`, no middleware of their own.

## Data flow and dependencies
- `auth.js` reads only `localStorage.getItem('auth.local')`, no store.
- `panel-access.js` reads `useUserStore()` (`userStore.currentUser?.person?.id`), [`useUserPanelTabs()`](../composables/CLAUDE.md) (`hasAccessToRoute`, `getAccessiblePaths`), and awaits `$authReady` injected by [`plugins/auth.client.js`](../plugins/CLAUDE.md).
- `useUserPanelTabs.ts` derives role (`customer | admin | owner`, defaulting unknown roles to `'admin'`) from `userStore.currentUser?.role` and defines a per-role whitelist of panel sub-routes.

## Gotchas
- **Both files appear to be dead/unused code as currently wired**: nothing in `pages/` names them in `middleware`, neither has `.global.js`. The actual `/panel` protection lives in `pages/panel.vue`'s inline duplicate logic — editing `panel-access.js` expecting it to affect behavior won't work until it's actually referenced.
- Both `return` early (no-op) when `import.meta.dev` is true — guards are disabled in dev, so broken access rules won't surface locally. The same pattern is duplicated in `pages/panel.vue`'s inline middleware.
- `panel-access.js` has an unreachable second `if (import.meta.dev) return` placed *after* the `$authReady` await — dead code within the file itself.
- `getUserRole()` silently falls back to `'admin'` for any unrecognized/missing role rather than the more restrictive `'customer'`.
- Redirect query param naming is inconsistent: `auth.js` uses `?redirect=`, `panel-access.js` and the inline `pages/panel.vue` middleware use `?next=`.
- `panel-access.js` awaits `$authReady` before checking `userStore.currentUser`; the inline middleware in `pages/panel.vue` does **not** await `$authReady`, so it can race the auth plugin on first load — a real behavioral difference between the "real" middleware file and what's actually running.

Last synced: 209e98b
