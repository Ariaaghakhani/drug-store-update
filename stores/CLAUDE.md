# stores/

## Purpose
Centralized Pinia client-state layer for the storefront: shopping cart, AI chatbot widget state, a product catalog mock/demo store, RBAC role/permission definitions, and the logged-in user record. None of these stores call `services/api/*` directly — data is local/mocked or synced via `localStorage`; real API calls happen in plugins/composables/pages, which then push results into these stores (notably [`plugins/auth.client.js`](../plugins/CLAUDE.md) calling `useUserStore().setUser()`).

## Key files
- `cart.js` — `useCartStore` (id `cart`), Options API store. Owns `items` and `isOpen`. Persists to `localStorage` key `cart`.
- `chat.js` — `useChatStore` (id `chat`), Options API store. Owns chatbot `currentSession`, `sessions`, UI flags, and a canned/rule-based response engine. Persists to `localStorage` key `chat-sessions`.
- `globalStore.js` — `useGlobalStore` (id `globalStore`). Empty scaffold (`state: { data: 'store' }`, no getters/actions) — appears unused/dead code.
- `products.js` — `useProductsStore` (id `products`), setup-style store. Hardcoded demo pharmacy `products` array (Farsi/English, pricing, stock, prescription flags) plus static `categoryItems`. In-memory CRUD only, no persistence, no API.
- `roles.ts` — `useRolesStore` (id `roles`), setup-style store, **TypeScript**. Hardcoded `roles` array (owner/admin/pharmacist/support/customer), each with a `permissions` matrix (users/products/orders × create/read/update/delete). In-memory only.
- `user.js` — `useUserStore` (id `userStore`), setup-style store. Owns `currentUser`. Persists to `localStorage` key `user.data`, with cross-tab sync via a `storage` event listener plus a 500ms same-tab polling fallback.

## Public surface
- **cart.js** — state: `items[]`, `isOpen`. Getters: `itemCount`, `subtotal`, `total` (adds flat $5.99 shipping unless subtotal > 50), `hasItems`. Actions: `loadCartItems()`/`loadFromStorage()`, `addItem(product)`, `removeItem(id)`, `updateQuantity(id, qty)`, `incrementQuantity(id)`, `decrementQuantity(id)`, `clearCart()`, `toggleCart()/openCart()/closeCart()`, `saveToStorage()`.
- **chat.js** — state: `currentSession`, `sessions[]`, `isOpen`, `isTyping`, `isMinimized`. Getters: `currentMessages`, `hasMessages`, `sessionCount`. Actions: `initSession()`, `sendMessage(content)`, `generateAIResponse(msg)`, `getContextualResponse(msg)`, `clearCurrentSession()`, `toggleChat()/minimizeChat()/maximizeChat()/closeChat()`, `saveToStorage()/loadFromStorage()`.
- **globalStore.js** — no usable surface.
- **products.js** — state: `products`, `categoryItems`. Actions: `getById(id)`, `addProduct(data)`, `updateProduct(updated)`, `removeProduct(id)`. Consumed by `pages/panel/products/*.vue`, `pages/medications/index.vue`, `components/FeaturedProducts.vue`, `components/HeroSection.vue`.
- **roles.ts** — state: `roles`. Action: `updatePermission(roleId, domain, action, value)`. Consumed by `pages/panel/users.vue`, `pages/panel/products/{index,new,[id]}.vue`, `components/panel/users/EditUserModal.vue`, [`composables/useUpdateRolePermission.ts`](../composables/CLAUDE.md).
- **user.js** — state: `currentUser`. Actions: `setUser(user)`, `clearUser()`. Consumed by [`plugins/auth.client.js`](../plugins/CLAUDE.md), `middleware/panel-access.js`, [`composables/useUserPanelTabs.ts`](../composables/CLAUDE.md), `pages/panel/{profile,address}.vue`, `components/dashboard/customer/CustomerDashboard.vue`, `components/Header.vue`, `pages/panel.vue`.

## Data flow and dependencies
- No store here imports from `services/api/*` directly. Real backend calls happen in [`plugins/auth.client.js`](../plugins/CLAUDE.md) (`$api.auth.fetchUser`), which writes into `user.js`. [`services/api/products.js`](../services/api/CLAUDE.md), `orders.js`, etc. exist but aren't wired to `products.js`/`cart.js` — those stores are self-contained demo/mock data. This is a tracked gap for Phase 2 integration.
- `roles.ts` feeds authorization only indirectly: `middleware/panel-access.js` and [`composables/useUserPanelTabs.ts`](../composables/CLAUDE.md) gate `/panel/*` routes using `userStore.currentUser` plus a separate hardcoded `roleBasedRoutes` map — not sourced from `roles.ts`'s `permissions` matrix, which is only consumed by the admin "Roles" management UI itself.
- Consumers: cart UI (`pages/cart.vue`, `components/Header.vue`), chatbot widget (`components/ChatbotWidget.vue`), product listing/detail/admin pages, user/auth-dependent panel pages.

## Gotchas
- **`roles.ts` is still TypeScript** despite the project's TS→JS revert (`209e98b`) — same drift as its consumers `useUpdateRolePermission.ts` and `useUserPanelTabs.ts` in [`composables/`](../composables/CLAUDE.md).
- `user.js` persistence is explicitly marked `// TEMPORARY`, standing in until a real `/api/auth/me` endpoint exists.
- `user.js` runs a `setInterval` poll every 500ms (never cleared) in addition to a `storage` event listener — redundant mechanism for the same purpose.
- **No cart merge-on-login**: `cart.js` is fully decoupled from auth state — cart contents aren't cleared or merged across login/logout, so they can leak across accounts sharing a browser.
- `getUserRole()` (in `useUserPanelTabs.ts`) falls back to `'admin'`, not `'customer'`, when the role is missing/invalid.
- Route gating uses a hardcoded table separate from `roles.ts`'s permission matrix — the two sources of truth can drift.
- `globalStore.js` is dead/empty — safe candidate for removal.
- `chat.js`'s "AI" responses are hardcoded keyword matching with a fake delay, not a real API/LLM call.
- `products.js` and `roles.ts` data is in-memory only — a page refresh discards any admin edits.

Last synced: 209e98b
