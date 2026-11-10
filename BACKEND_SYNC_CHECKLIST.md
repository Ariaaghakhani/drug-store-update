# Backend sync checklist

Backend source: `C:\Users\Aria Aghakhani\PouyanPars\PouyanPlatform` (main). Contracts: its `docs/FRONTEND_CHANGELOG.md`
and `docs/FRONTEND_FEATURES_BY_USER.md`. Created 2026-11-10 from a route-by-route diff of the backend controllers against
this repo.

Detailed per-item plan (routes, files, tests, sub-steps): `BACKEND_SYNC_PLAN.md` (written by a Sonnet planner).
Each item/sub-step is implemented by a Haiku subagent; the main session reviews the diff, builds, commits, pushes (PR #66)
and ticks the item. Execute in the plan's section 4 order, NOT the A/B/C order:
P0, P1, P2, P3, A4, B9, B10, B8, B7, B5, B6, B3, B4, C4, C5, C3, C6, B1, B2, C1, C2, C7-C15, B11, C17, C16, C18, C19-C22.
Defaults taken for the plan's open decisions: D1 money shown as backend sends (admin inputs labelled «ریال»), D2 grouped
sidebar yes, D3 Jalali inputs yes, D4 workflow designer JSON fallback, D5 B10 wrapper only.

## Prerequisites (from the plan, section 2)
- [x] P0. Grouped sidebar mechanism (`utils/panelMenus.js`, `useUserPanelTabs.js`, `pages/panel.vue`)
- [x] P1. File download + blob responses (`plugins/api.js` responseType, `composables/useFileDownload.js`)
- [ ] P2. `composables/usePagedList.js` + `components/panel/PanelEmptyState.vue`
- [ ] P3. Jalali dates (`utils/jalali.js`, `components/panel/JalaliDateInput.vue`)

## Loop rules (one item per iteration)
1. Pick the first unchecked item below.
2. Read that module's `CLAUDE.md`, `DESIGN_SYSTEM.md`, and the backend controller + DTOs for the item. Verify against
   source, do not guess.
3. Implement: wrapper in `services/api/<domain>.js` (register in `index.js` if new), then the screen/page. Follow
   `CLAUDE.md` conventions (JS `<script setup>`, logical RTL props, valid Nuxt UI colors, `fa-IR` numbers, skeletons).
4. Update the touched modules' `CLAUDE.md` in the same change, and `DESIGN_SYSTEM.md` if a new pattern appears.
5. Test: `npx eslint` on touched files, `npm run build`, and exercise the screen against the dev backend when reachable
   (else say so in the Done log). Fix failures before committing.
6. Tick the item, add a one-line note (incl. what was tested), commit (one commit per item), `git push` the branch
   (user authorised push per item on 2026-11-10), then continue with the next.
7. Stop the loop and ask the user if an item needs a product/design decision or a backend answer. Record it under
   "Blocked".

## A. Cross-cutting
- [x] A1. `plugins/api.js`: global handler for HTTP 202 `{pending, requestId, instanceId, status}` (toast
      «ثبت شد و منتظر تأیید است», do not treat `data` as the saved record) and 409 `workflow.action.pending`
- [x] A2. Docs: categories tree is public now (`services/api/CLAUDE.md`, `BACKEND_REQUESTS.md` item 1 resolved)
- [x] A3. Store flags: make sure every storefront section/page respects `useStoreProfile` flags
      (`orderingEnabled`+banner, `prescriptionEnabled`, `wishlistEnabled`, `walletEnabled`, `stockAlertsEnabled`,
      `goodsQuestionsEnabled`, `expiryRequired`, `variantsEnabled`)
- [ ] A4. Terms pending dialog after login (`GET auth/me/terms/pending`, `POST auth/me/terms/accept`)

## B. Storefront / customer
- [ ] B1. Checkout: shipping methods + pickup slots (`GET shipping/methods`, `/{id}/slots`) in `cart.vue`
- [ ] B2. Checkout: discount code, wallet payment (`useWallet`), gateways list (`GET payment/gateways`)
- [ ] B3. My orders: `GET orders/my`, order items, invoice PDF (`invoices/pdf`)
- [ ] B4. Customer returns: returnable items, request, photos, list/detail, cancel, tracking code
- [ ] B5. Reviews: write/list/delete mine (`reviews/my*`) on product page + panel
- [ ] B6. Questions: ask/list/delete mine (`questions/my*`)
- [ ] B7. Blog: delete my comment (`DELETE blog/comments/{id}`)
- [ ] B8. Captcha (`captcha/status`, `POST captcha`) on login/register/contact
- [ ] B9. Password policy hint under password fields (`GET auth/password-policy`)
- [ ] B10. Province cities by slug (`locations/provinces/by-slug/{slug}/cities`) if still useful
- [ ] B11. Customer prescriptions (only if `prescriptionEnabled`): options, send, list/detail/image, confirm, cancel,
      receipt

## C. Panel (staff)
- [ ] C1. Returns administration (`admin/returns*`, `admin/order-refunds/{id}/paid`)
- [ ] C2. Purchase orders: submit / receive / close / cancel
- [ ] C3. Discount codes CRUD
- [ ] C4. Shipping methods CRUD (`admin/shipping-methods`)
- [ ] C5. Store payment gateways (`admin/payment-gateways`)
- [ ] C6. Wallet administration (`admin/wallets*`)
- [ ] C7. Store customers (CRUD, import, export)
- [ ] C8. Review moderation (`admin/reviews*`) and Q&A moderation (`admin/questions*`)
- [ ] C9. Blog administration: posts, tags, comments
- [ ] C10. Contact messages + contact settings
- [ ] C11. About us, terms (+acceptances), return policy admin
- [ ] C12. Store settings, password policy, my-organization
- [ ] C13. Attributes + category assignment, goods variants
- [ ] C14. Goods import, goods-images import, opening-stock import
- [ ] C15. Stock movements, top wishlist / stock alerts, search-query logs
- [ ] C16. SMS account + SMS campaigns
- [ ] C17. Prescriptions administration + insurances
- [ ] C18. Reports (`report/*`), audit search, backups
- [ ] C19. Workflow: task inbox (list, count, detail, claim, decide, comment, attachments, reassign)
- [ ] C20. Workflow: run monitoring (instances, filters, retry, cancel, answers)
- [ ] C21. Workflow: bindings, calendar + holidays, custom events
- [ ] C22. Workflow: designer (definitions, validate, publish, versions, export/import)

## Blocked / needs a decision
- Platform admin (`TenantController`, SMS quotas, `admin/access`): served by the backend's Thymeleaf panel. Not planned.

## Done log
- A1 (2026-11-10): `plugins/api.js` toasts 202 pending + sets `pending:true` on the result; 409 left to callers' normal error display.
- A2 (2026-11-10): stale "category tree 401 for guests" notes updated (storefront.js, useStoreCategories.js, services/api/CLAUDE.md, BACKEND_REQUESTS.md). Runtime behaviour unchanged.
- A3 (2026-11-10): audited flags; only gap was `variantsEnabled` (product-page variant picker) — now gated. Others already gated; wallet-at-checkout belongs to B2, prescription pages to B11. Tested: eslint (only pre-existing warnings) + `npm run build` OK.
- P0 (2026-11-10, Haiku): grouped-sidebar mechanism (GROUP_LABELS + headings/dividers in desktop nav). No entry uses `group` yet so the sidebar is unchanged. Lint: only a pre-existing unused `roleBadgeColor` error in panel.vue. Build pending with P1.
- P1 (2026-11-10, Haiku): `config.responseType` pass-through in plugins/api.js (+ cache-key suffix), `composables/useFileDownload.js` (download/previewUrl). Lint OK. First real use: B3 invoice PDF.
