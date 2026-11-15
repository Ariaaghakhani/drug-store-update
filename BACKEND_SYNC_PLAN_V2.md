# FINAL implementation queue: remaining BACKEND_SYNC items (C4…C22, B1, B2, B11)

Every endpoint, method, DTO field, paging base and module below was checked against the PouyanPlatform controllers and DTOs on `main` (5ed44a2a). Where this plan and `BACKEND_SYNC_PLAN.md` disagree, this plan wins.

## A. Decisions already made (no open questions)
- **Money:** BACK stores every amount in Rial (its javadocs say «به ریال» for goods price, shipping, discount FIXED, wallet, refunds, gateway `amount`).
  - **Staff screens:** show the number exactly as sent, through the new `formatMoney()` («ریال»). Money inputs use `MoneyInput` with the label «… (ریال)». Never convert.
  - **Customer and storefront screens** (CheckoutModal, customer prescription pages): keep the existing `useFormat().formatPrice` («تومان», no conversion) so the cart and checkout stay consistent.
  - The storefront calling Rial values «تومان» is an existing issue and is out of scope. The fix points are `useFormat.formatPrice`, `wallet.vue:198 ×10`, `checkout/result.vue:135 /10`, and the label `products/new.vue` «قیمت (تومان)». Record this in the checklist "Blocked" section as a follow-up note.
- **Workflow designer:** APPROVAL steps get a visual editor. ACTION/WAIT/AUTO steps get a JSON editor for their type-specific keys.
- **Platform-only features are skipped** (record in "Blocked"): backups, report builder `/api/admin/reports*`, official holidays `/holidays*`, `/api/admin/sms-campaign-quotas`, tenants, `admin/access`.
- **Report `select` parameters:** rendered as a free-text input. Add a BACKEND_REQUESTS.md entry asking BACK to expose the options (`optionsSql` is write-only).
- **Not in the checklist, not built:** editing goods attribute *values* on the product form.
- **Settings menu modules:** `[SYSTEM_SETTINGS, PAYMENT_GATEWAY, MY_ORGANIZATION]` only. STORE_PROFILE and PASSWORD_POLICY are left out because their READ grant also covers public GETs.
- **Gotcha:** SHIPPING READ is also the public methods GET. A staff user who holds only that grant sees the menu, then gets a 403 lock state. Acceptable.
- **Wallets menu** has no `flag`. The page shows an info alert when `walletEnabled` is off.
- **Workflow unavailable:** treat 403 or 404 on any workflow call as "unavailable". `PanelEmptyState` variant forbidden, title «گردش کار در دسترس نیست», text «یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست».

## B. Corrections to BACKEND_SYNC_PLAN.md (verified)
1. Shipping, discount, wallet, blog, contact, terms and insurance DELETEs answer 200 with `data:null`. PO delete, supplier delete, attribute delete and category unassign answer **204**.
2. `variantAxis` is allowed **only for SELECT** (not MULTI_SELECT). See `AttributeServiceImpl:168`.
3. Workflow step `key` must match `^[a-z][a-z0-9_]{0,29}$`. Custom event `code` must match `^[A-Z][A-Z0-9_]{1,49}$`.
4. Calendar day list `type` is `OFFICIAL_HOLIDAY|CLOSED|WORKING`. A create request takes only `CLOSED|WORKING`.
5. Report `jalali-date` parameters accept `1403/07/08` (Latin or Persian digits). `date` parameters need strict `yyyy-MM-dd`.
6. Prescription staff cancel is allowed in any status except DELIVERED. `ready`/`ship` need `paymentStatus` PAID when the payment method is CARD_TO_CARD. Receipt reject `reason` is required (enforced in the service).
7. Return approve `note` is optional. Reject `note` is required. Receive and refund bodies are optional.
8. The PO list response `page` is 1-based too. Stock-movements and audit request pages are 1-based. Every other paged GET is 0-based.
9. `GET /api/payment/gateways?amount` takes a Long. Admin About-us GET when never saved returns `id:null, active:false, defaultText:true`.
10. A `MOBILE_LIST` setting value is one comma-joined string.
11. Terms-acceptance `source` also has `PANEL_LOGIN`. Store-customer import, export, template and delete need **STORE_CUSTOMER_ADMIN**.
12. A blog comment can be replied to only after it is APPROVED. Insurances live under `/api/admin/prescriptions/insurances`.
13. A workflow task `status` is the string `OPEN` or `CLAIMED`. The task count is `{mine, claimable, overdue}`. The instance list `from`/`to` are `yyyy-MM-dd`; audit `from`/`to` are `yyyy-MM-ddTHH:mm:ss`.

## C. Shared conventions (paste "Follow CONV" into every step prompt)
1. **Read first:** the touched modules' `CLAUDE.md` files and `DESIGN_SYSTEM.md` (Admin page header, Admin data table, Empty/loading/error, USkeleton, USwitch, Jalali date input, the S0b patterns).
   - Reference list: `pages/panel/returns/index.vue`. Reference detail: `pages/panel/returns/[id].vue`. Reference self-contained modal: `components/panel/returns/ReturnRequestModal.vue`.
2. **Wrappers:** add methods to `services/api/<file>.js` as `name(…ids, config) { return apiCaller.<verb>('api/…', config) }`. Path ids are explicit arguments. Add a one-line contract comment.
   - Query string goes in `config.params`; request body goes in `config.data`.
   - Register a new file in `services/api/index.js` (import + `ns: ns(apiCaller)`).
   - The payload is `res.data.data`. Raw endpoints are marked **RAW**; their payload is `res.data`.
   - Blob calls pass `{ responseType: 'blob' }` and are consumed with `useFileDownload()`.
   - Multipart: the caller builds the `FormData` and passes `{ data: fd }`. Repeated file fields are `fd.append('files', f)` per file.
3. **Paged lists:** `usePagedList(fetchPage, { size: 20, filters, backendBase })` with `backendBase: 1` only where marked 1-BASED, plus `UPagination v-model:page :total :items-per-page`.
   - Render order: skeleton (`<Transition name="sk">` + scoped `.sk-*` CSS copied from `returns/index.vue`), then 403 `PanelEmptyState variant="forbidden"`, then error (variant error + `neutral soft` retry), then content, then empty.
   - Unpaged lists use local `loading`/`error`/`forbidden` refs with the same states.
4. **Writes:**
   ```
   const res = await …
   if (isPending(res)) { close(); reload(); return }   // the plugin already toasted
   toast.success('…'); reload()                          // or update the row from res.data.data
   ```
   - Errors: `toast.error(apiErrorMessage(e, '…'))`, or show the message inline in the modal. BACK messages are already translated (this includes 409 `workflow.action.pending`).
   - Disable buttons while busy. When the entity DTO has `workflow?.pending`, show `WorkflowPendingBadge` and disable the gated actions.
5. **Role:** `const isStaff = computed(() => useUserPanelTabs().getUserRole() !== 'customer')`. Optional UI per module uses `useModuleAccess().canRead('MODULE')`; when unsure, show it and let BACK decide.
6. **Formatting:**
   - Money: CONV A.
   - Dates: display with `formatJalali(iso, { withTime })` (utils/jalali.js), input with `JalaliDateInput` (emits ISO), send ISO.
   - Counts: `toLocaleString('fa-IR')`.
   - Quantity inputs: `UInput inputmode="numeric" dir="ltr"` + `parseQuantity`.
   - Codes, phones, URLs and keys: `dir="ltr"`.
7. **Store HTML:** never `v-html`. Edit it in a `UTextarea` labelled «… (HTML)»; preview with `htmlToText()`.
8. **Code style:** JS `<script setup>`, logical RTL classes, valid Nuxt UI colors only, a `dark:` variant on every surface, one `primary` per view, two-tone `font-black` titles via `PanelPageHeader`. Never create `pages/panel/foo.vue` next to `foo/`.
9. **Menus:** add the entry to `PANEL_MENUS` at its position in the target order (D), add the key to `FALLBACK_MENUS_BY_ROLE.owner`, and update the header comment. Never add an entry without its page.
10. **Docs, in the same change:**
    - `[api]` services/api/CLAUDE.md: Key-files line for the file + Last synced.
    - `[pp]` pages/panel/CLAUDE.md: one line per route.
    - `[cp]` components/panel/CLAUDE.md. `[c]` components/CLAUDE.md. `[p]` pages/CLAUDE.md.
    - `[ut]` utils/CLAUDE.md, including panelMenus changes. `[co]` composables/CLAUDE.md.
    - `[ds]` DESIGN_SYSTEM.md only when stated.
11. **CHECK:** `npx eslint <touched files>` (no new errors) + `npm run build`. In the report, say whether the screen was exercised against the dev backend. The main session commits and ticks the checklist item when its last sub-step lands.

## D. Target menu order (the `group` key in brackets)
dashboard, users, products, inventory, orders, tickets,
- [sales] returns, discounts, shipping, customers, wallets, prescriptions
- [stock] purchase-orders, attributes, imports, stock-movements
- [content] reviews, questions, blog, contact, pages
- [marketing] sms
- [insights] reports, insights, audit
- [workflow] tasks, workflow
- [settings] settings

Then wishlist, wallet, addresses, security, notifications, profile.

Customer fallback gains `{key:'prescriptions', label:'نسخه‌های من', group:''}` after returns. The admin fallback is unchanged.

---

## STEP 0: shared utilities (do these first)

### S0a: utils + composable
Files: new `utils/money.js`, `utils/enumMeta.js`, `utils/apiError.js`, `utils/weekdays.js`, `composables/useModuleAccess.js`. Docs: [ut] [co].
- **`money.js`:**
  - `MONEY_UNIT='ریال'`.
  - `formatMoney(v)`: null/'' → '—', else `Number(v).toLocaleString('fa-IR')+' ریال'`.
  - `parseMoney(text)`: `toLatinDigits` (utils/jalali.js), strip `[,٬\s]`, `/^\d+$/` → Number, else null.
  - `moneyLabel(l)` → `${l} (ریال)`.
  - Header comment states the CONV A rule.
- **`enumMeta.js`:**
  - `metaOf(map, v)` → `map[v]`, else `{label: v ?? '—', color:'neutral'}`.
  - `labelOf(map, v)`.
  - `selectItems(map, allLabel?)` → `[{value:'all', label:allLabel}?, …{value, label}]`. Accepts maps of shape `{K:{label,color}}` or `{K:'label'}`.
- **`apiError.js`:**
  - `apiErrorMessage(e, fallback)`: `e.response.data.message`; else status 403 «دسترسی به این کار ندارید»; else 413 «حجم فایل بیش از حد مجاز است»; else `fallback`.
  - `errorStatus(e)`.
  - `isPending(res)` → `res?.pending === true`.
- **`weekdays.js`:** `WEEKDAYS` = SATURDAY…FRIDAY with labels شنبه، یکشنبه، دوشنبه، سه‌شنبه، چهارشنبه، پنجشنبه، جمعه. Plus `weekdayLabel(v)`.
- **`useModuleAccess.js`:** `canRead(module)`: `userStore.permissions` null/empty → true, else `some(p => p.module === module)`. Plus `canReadAny(list)`.

### S0b: shared panel components
Files: new in `components/panel/`: `PanelPageHeader.vue`, `PanelFormModal.vue`, `PanelConfirmDialog.vue`, `StatusBadge.vue`, `MoneyInput.vue`, `FilePickButton.vue`, `PanelSectionTabs.vue`, `WorkflowPendingBadge.vue`. Docs: [cp] [ds] (add "Panel form modal / confirm", "Money input", "Section tabs").
- **PanelPageHeader:** props `icon, title, accent, subtitle`; slot `actions`. Markup = DESIGN "Admin page header".
- **PanelFormModal:** props `open, title, icon, submitLabel='ذخیره', loading, submitDisabled, width 'md'|'lg'|'2xl'`; emits `update:open`, `submit`.
  - `UModal :dismissible="!loading"`, body `<form dir="rtl" class="space-y-4 font-dana" @submit.prevent>`, default slot.
  - Footer: slot `footer-start`, cancel `neutral soft`, submit `primary type=submit :loading`.
- **PanelConfirmDialog:** props `open, title, message, confirmLabel='تأیید', confirmColor='primary', loading, noteLabel='', noteRequired=false, noteMax=500`; emits `update:open`, `confirm(note)`.
  - The textarea shows only when `noteLabel` is set. Confirm is disabled when `noteRequired` and the note is blank. The note resets on open.
- **StatusBadge:** prop `meta {label, color}`, size `xs`, `UBadge variant="subtle"`.
- **MoneyInput:** v-model Number|null; props `label, required, error, help, placeholder, disabled`. `UFormField` with label `moneyLabel(label)`, `UInput inputmode="numeric" dir="ltr"`, parses via `parseMoney`. Bad text → emits null + «فقط عدد». Default help = `formatMoney(value)`.
- **FilePickButton:** props `label, icon='i-heroicons-arrow-up-tray', accept, multiple, loading, disabled`. Hidden input + `neutral outline` button; emits `pick(File | File[])`; resets the input after pick.
- **PanelSectionTabs:** prop `tabs [{label, to, icon, exact?}]`. Horizontal NuxtLink pills. Active when `exact ? path===to : path===to || path.startsWith(to+'/')`.
  - Active classes: `bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400`.
  - Inactive classes: `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`.
- **WorkflowPendingBadge:** prop `state` (WorkflowStateDTO `{pending, instanceId, status, action, activeSteps[]}`). When `pending`: `UBadge warning subtle`, icon clock, «در انتظار تأیید» + `: activeSteps.join('، ')`.

---

## C4: shipping methods (module SHIPPING)

### C4a: wrappers, meta, list, menu
Files: new `services/api/shipping.js` (+index.js `shipping`), new `utils/shippingMeta.js`, new `pages/panel/shipping/index.vue`; edit `utils/panelMenus.js`. Docs: [api] [pp] [ut].

API (ApiResponse, unpaged):
- `adminListMethods()` GET `api/admin/shipping-methods` → `ShippingMethodDTO[]`, ordered by sortOrder, inactive included.
- `adminGetMethod(id)` GET `…/{id}`.
- `adminCreateMethod(cfg)` POST (201).
- `adminUpdateMethod(id, cfg)` PUT `…/{id}`: full replace; `active:null` = unchanged.
- `adminDeleteMethod(id)` DELETE.

`ShippingMethodDTO` fields: `id, title, description, type POST|CARRIER|STORE_COURIER|CUSTOMER_COURIER|PICKUP, deliveryMethod (out), sortOrder, cost, freeShippingThreshold, payOnDeliveryAllowed, cashOnDeliveryAllowed, trackingRequired, trackingUrlTemplate, minDeliveryDays, maxDeliveryDays, coverage ALL|LISTED, rates[{provinceId, provinceName, cityId, cityName, cost}], slotsEnabled, slotMinutes, slotCapacity, slotLeadMinutes, slotDaysAhead, pickupDeadlineDays, expressMinutes, pickupHours[{dayOfWeek, opensAt 'HH:mm', closesAt}], closedDates[yyyy-MM-dd], active, createdAt`.

`shippingMeta.js`:
- `SHIPPING_TYPE_META`: POST «پست» envelope; CARRIER «تیپاکس / شرکت حمل» truck; STORE_COURIER «پیک فروشگاه» map-pin; CUSTOMER_COURIER «پیک مشتری» user; PICKUP «تحویل حضوری» building-storefront.
- `COVERAGE_LABELS`: ALL «همه‌جا»; LISTED «فقط مقصدهای تعرفه‌دار».
- `typeHasCost` = POST|CARRIER|STORE_COURIER. `typeHasSlots` = STORE_COURIER|CUSTOMER_COURIER|PICKUP. `isPickupType` = PICKUP|CUSTOMER_COURIER.
- `toShippingRequest(dto)`: drop `id`, `deliveryMethod`, `createdAt`; rates → `{provinceId, cityId, cost}`.

Page:
- Header «روش‌های <ارسال>» (the primary «روش ارسال جدید» comes in C4b).
- Card rows: type icon tile, title, type label, active badge.
- Cost line: `typeHasCost` ? (cost ? formatMoney : «رایگان») + «رایگان از X» : «بدون هزینه‌ی ارسال». Also coverage label, «۲ تا ۴ روز», «زمان‌بندی» badge when `slotsEnabled`.
- Row `USwitch` for active: `adminUpdateMethod(id, {data: {...toShippingRequest(row), active: !row.active}})`, per-row loading.
- Delete via PanelConfirmDialog (`confirmColor="error"`).
- Empty: «هنوز روش ارسالی ندارید».

Menu: `{key:'shipping', label:'روش‌های ارسال', icon:'i-heroicons-truck', to:'/panel/shipping', modules:['SHIPPING'], group:'sales'}`. CHECK.

### C4b: form modal, basic fields
Files: new `components/panel/shipping/ShippingMethodFormModal.vue`; edit `shipping/index.vue` (header CTA + row «ویرایش»). Docs: [cp] [pp].

Self-contained modal: props `open`, `method` (DTO|null); emits `update:open`, `saved`. PanelFormModal width 2xl.

Fields:
- «اطلاعات پایه»: title (required, ≤100), description (≤500), type USelect, sortOrder (0..1000), active switch.
- When `typeHasCost`: cost MoneyInput (0..1e12; empty → 0), freeShippingThreshold MoneyInput (optional), payOnDeliveryAllowed «پس‌کرایه», trackingRequired, trackingUrlTemplate (≤500, ltr; if set it must start with http(s):// and contain `{code}`), minDeliveryDays and maxDeliveryDays (0..365, min ≤ max).
- All types: cashOnDeliveryAllowed with hint «پرداخت در محل فروشگاه هم باید روشن باشد».

Submit:
- Body = `toShippingRequest` of the original DTO merged with the form. This keeps rates, slots, hours and closed dates untouched until C4c.
- Create → `adminCreateMethod`; edit → `adminUpdateMethod`. Show 400 messages inline. Toast «روش ارسال ذخیره شد». CHECK.

### C4c: rates, slots, hours, closed dates
Files: new `components/panel/shipping/ShippingRatesField.vue`, new `components/panel/shipping/PickupHoursField.vue`; edit `ShippingMethodFormModal.vue`. Docs: [cp].
- **Coverage** (when `typeHasCost`): USelect ALL|LISTED + ShippingRatesField.
  - v-model `[{provinceId, cityId, cost}]` (max 500). Each row: province USelectMenu (`address.getState()`), optional city USelectMenu «همه‌ی شهرهای استان» (`address.getCity(provinceId)`), cost MoneyInput, remove.
  - Province required per row; no duplicate province/city pair; LISTED needs at least one row.
- **Slots** (when `typeHasSlots`): slotsEnabled.
  - When on: slotMinutes 15..720 (required), slotCapacity 1..10000 (optional = «بدون سقف»), slotLeadMinutes 0..10080, slotDaysAhead 1..60 (default 7), PickupHoursField with at least one row.
  - PickupHoursField: v-model `[{dayOfWeek, opensAt, closesAt}]`, max 50. Day USelect (WEEKDAYS), two `UInput type="time"`, opensAt < closesAt.
- **STORE_COURIER only:** expressMinutes 15..1440 «ارسال فوری تا … دقیقه». It excludes slotsEnabled (turning one on disables the other). Express also needs pickupHours.
- **isPickupType:** pickupDeadlineDays 1..60 «مهلت مراجعه (روز)».
- **closedDates** (when slots or express): JalaliDateInput list, unique, ≤366.
- Fields hidden for the chosen type are sent as null/[]. CHECK.

## C5: payment gateways (module PAYMENT_GATEWAY)

### C5a: settings shell + gateway list + menu
Files: edit `services/api/payments.js`; new `utils/paymentMeta.js`, `components/panel/settings/SettingsTabs.vue`, `pages/panel/settings/index.vue`, `pages/panel/settings/payment.vue`, `components/panel/settings/PaymentGatewaysCard.vue`; edit `utils/panelMenus.js`. Docs: [api] [pp] [cp] [ut].

API:
- `adminListGateways()` GET `api/admin/payment-gateways` → `[{gateway, merchantId, terminalId, username, clientId, passwordSet, clientSecretSet, configured, active, requiredFields[]}]` (unconfigured ones included).
- `adminSaveGateway(cfg)` PUT same path, body `{gateway (req), merchantId≤100, terminalId≤100, username≤100, password≤200 (empty = keep), clientId≤100, clientSecret≤200 (empty = keep), active (null = on)}`.
- `adminEnableGateway(g)` / `adminDisableGateway(g)` POST `…/{g}/enable|disable` → DTO.

`paymentMeta.js`:
- `GATEWAY_LABELS`: ZARINPAL زرین‌پال, MELLAT به‌پرداخت ملت, SAMAN سامان, SNAPPPAY اسنپ‌پی, DIGIPAY دیجی‌پی, MOCK درگاه آزمایشی.
- `GATEWAY_FIELD_LABELS`: merchantId مرچنت کد, terminalId شماره ترمینال, username نام کاربری, password رمز عبور, clientId Client ID, clientSecret Client Secret.
- `SECRET_FIELDS`: `['password', 'clientSecret']`.

Settings shell:
- SettingsTabs = PanelSectionTabs over a tab list filtered by `canRead(tab.module)`. For now only `{درگاه‌های پرداخت, /panel/settings/payment, PAYMENT_GATEWAY}`.
- `settings/index.vue`: `navigateTo('/panel/settings/payment', {replace:true})` (replaced in C12a).
- `payment.vue`: header «درگاه‌های <پرداخت>» + SettingsTabs + card.

Card rows: label, configured badge (success «ثبت شده» / neutral «ثبت نشده»), active switch (disabled when `!configured`, per-row loading). Empty `requiredFields` → «در این نسخه پشتیبانی نمی‌شود» and no actions.

Menu: `{key:'settings', label:'تنظیمات فروشگاه', icon:'i-heroicons-cog-6-tooth', to:'/panel/settings', modules:['SYSTEM_SETTINGS','PAYMENT_GATEWAY','MY_ORGANIZATION'], group:'settings'}`. CHECK.

### C5b: account modal
Files: new `components/panel/settings/GatewayFormModal.vue`; edit `PaymentGatewaysCard.vue`.
- Inputs = exactly `requiredFields`, all ltr.
- Secret fields: `type=password`, placeholder «••• بدون تغییر» when `*Set`; required only when not yet set; omitted when empty.
- Other fields prefilled. Active switch (default on).
- Save → `adminSaveGateway`; replace the row; toast «حساب درگاه ذخیره شد». CHECK.

## C3: discount codes (module DISCOUNT)

### C3a: wrappers, meta, list, menu
Files: new `services/api/commerceAdmin.js` (+index `commerceAdmin`), new `utils/discountMeta.js`, new `pages/panel/discounts/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listDiscountCodes(cfg)` GET `api/admin/discount-codes` params `{page (0-based), size ≤100}` → `PageResponse<{id, code, description, type PERCENT|FIXED, value, maxDiscountAmount, minPurchaseAmount, startsAt, endsAt, usageLimit, usageLimitPerCustomer, usedCount, active, createdAt}>`, newest first.
- `getDiscountCode(id)`.
- `createDiscountCode(cfg)` POST (201; duplicate code → 409).
- `updateDiscountCode(id, cfg)` PUT: full replace; `active:null` = unchanged.
- `deleteDiscountCode(id)` DELETE.

`discountMeta.js`:
- `DISCOUNT_TYPE_LABELS` {PERCENT درصدی, FIXED مبلغ ثابت}.
- `discountValueText(d)`: «۱۰٪» + « تا سقف formatMoney(max)», or formatMoney(value) for FIXED.
- `discountState(d)`, checked in this order: !active «غیرفعال» neutral; startsAt>now «زمان‌بندی‌شده» info; endsAt<now «منقضی» error; usageLimit && usedCount≥usageLimit «تمام‌شده» warning; else «فعال» success.

Page:
- Table columns: کد (mono, ltr), نوع/مقدار, حداقل خرید, اعتبار (range withTime, or «بدون محدودیت»), استفاده `usedCount/usageLimit|∞`, StatusBadge.
- Row menu: ویرایش, حذف (confirm error).

Menu: `{key:'discounts', label:'کدهای تخفیف', icon:'i-heroicons-ticket', to:'/panel/discounts', modules:['DISCOUNT'], group:'sales'}`. CHECK.

### C3b: form modal
Files: new `components/panel/discounts/DiscountFormModal.vue`; edit `discounts/index.vue` (primary «کد تخفیف جدید»).

Fields:
- code: required, ≤50, `/^[\p{L}\p{N}_-]+$/u`, ltr.
- description ≤200, type.
- value: PERCENT → numeric 1..100; FIXED → MoneyInput ≥1.
- maxDiscountAmount MoneyInput ≥1 (PERCENT only, else null). minPurchaseAmount MoneyInput ≥1, optional.
- startsAt / endsAt: JalaliDateInput withTime, clearable, endsAt > startsAt.
- usageLimit and usageLimitPerCustomer: ≥1, optional. active switch.

409 → inline under code «این کد قبلاً ثبت شده». CHECK.

## C6: wallet administration (module WALLET)

### C6a: list + menu
Files: edit `commerceAdmin.js`; new `pages/panel/wallets/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listWallets(cfg)` GET `api/admin/wallets` params `{minBalance?, page, size}` → `PageResponse<{personId, fullName, phone, balance, updatedAt}>`, highest balance first.
- `getWallet(personId)` GET `…/person/{personId}` → `{personId, balance, enabled}`.
- `listWalletTransactionsAdmin(personId, cfg)` GET `…/person/{personId}/transactions` params `{page, size}` → `PageResponse<{id, amount (signed), balanceAfter, type ORDER_PAYMENT|ORDER_RELEASE|REFUND|ADJUSTMENT|TOP_UP, typeLabel, orderId, refundId, note, createdAt}>`.
- `adjustWallet(personId, cfg)` POST `…/person/{personId}/adjust` body `{amount (non-zero; + credit / − debit; Rial), note (required, ≤500)}`. Debit above the balance → 409 `wallet.insufficient`.

Page:
- Switch «فقط کیف پول‌های دارای موجودی» → `minBalance=1`.
- Table: نام, موبایل (ltr), موجودی (formatMoney), آخرین تغییر, «جزئیات» → `/panel/wallets/<personId>?name=<fullName>`.
- Info alert when `profile && !walletEnabled`.

Menu: `{key:'wallets', label:'کیف پول مشتریان', icon:'i-heroicons-banknotes', to:'/panel/wallets', modules:['WALLET'], group:'sales'}`. CHECK.

### C6b: detail + adjust
Files: new `pages/panel/wallets/[personId].vue`, new `components/panel/wallets/WalletAdjustModal.vue`.
- Detail: name from `route.query.name` (fallback «مشتری #id»), balance card, transactions via usePagedList.
- Transaction row: typeLabel, ±formatMoney (success/error color), balanceAfter, order link, note, date.
- Primary «اصلاح موجودی» opens the modal: URadioGroup افزایش/کاهش, MoneyInput ≥1 (required), note (required, ≤500). Sends `amount = sign × value`. 409 inline. Reload both after success. CHECK.

## B1: checkout shipping (storefront)

### B1a: extract CheckoutModal (pure refactor)
Files: new `components/checkout/CheckoutModal.vue`; edit `pages/cart.vue`. Docs: [c] [p].
- Move the checkout `UModal` block and all its state/handlers into the component: addresses, quote, deliveryMethod, payShippingOnDelivery, paymentMethod, gateway, acceptedTerms, orderPlaced, loadAddresses, fetchQuote, watchers, confirmCheckout, close.
- Props `open`; emit `update:open`; on open it loads addresses + quote.
- `cart.vue` keeps the list/summary and renders `<CheckoutModal v-model:open>`.
- Zero behaviour change. CHECK + manual: the checkout still works.

### B1b: shipping methods in the modal
Files: edit `services/api/shipping.js`, `CheckoutModal.vue`. Docs: [api] [c].

API (public):
- `listMethods(cfg)` GET `api/shipping/methods` params `{amount (items total, Rial), provinceId?, cityId?}` → `[{id, title, description, type, deliveryMethod DELIVERY|PICKUP, coverage, covered, cost, freeShippingThreshold, payOnDeliveryAllowed, cashOnDeliveryAllowed, slotsEnabled, expressMinutes, deliverBy, trackingRequired, minDeliveryDays, maxDeliveryDays}]`.
- `listSlots(id)` GET `api/shipping/methods/{id}/slots` → `[{start, end, label, remaining, available}]`.

Flow:
1. First quote as today, to get `itemsTotal`.
2. `listMethods({params:{amount: quote.itemsTotal, provinceId, cityId}})`. provinceId/cityId come from the selected AddressDTO. Refetch when the address changes. Hide `covered===false`.
3. Radio cards replace the DELIVERY/PICKUP toggle. Each card: title, description, window («ارسال فوری تا X دقیقه» or «X تا Y روز»), cost (0 «رایگان», else formatPrice), «ارسال رایگان برای خرید بالای X».
4. The selection sets `shippingMethodId`. `deliveryMethod` = `method.deliveryMethod`. The address picker shows only for DELIVERY.
5. Quote and checkout bodies send `{items, shippingMethodId, addressId (DELIVERY only), payShippingOnDelivery}`. Drop `deliveryMethod`.

Default = first method. Skeleton while loading. Empty → «روش ارسالی برای این آدرس وجود ندارد», pay disabled. `quote.shippingCovered===false` → warning. CHECK.

### B1c: slots, courier, COD rules
Files: edit `CheckoutModal.vue`, `pages/cart.vue`.
- **Slots** (`slotsEnabled`): `listSlots` → button grid (label; disabled when `!available`; `remaining` badge when not null). Required. Send `pickupSlotStart = slot.start` as-is. Empty → «فعلاً بازه‌ی آزادی نیست».
- **CUSTOMER_COURIER:** optional courierName (≤100) and courierPhone (≤20; `normalizeIranianMobile` + `isValidPhoneNumber` when set).
- **Pay-shipping-on-delivery** switch only when `method.payOnDeliveryAllowed`.
- **COD** radio only when `quote.cashOnDeliveryEnabled && method.cashOnDeliveryAllowed && quote.cashOnDeliveryAllowed !== false`.
- Pay stays disabled until a method is chosen (+ address for DELIVERY, + slot when required), `minOrderAmountMet !== false` and `shippingCovered !== false`.
- Quote refetch debounced 300 ms.
- `cart.vue`: remove the fake `shippingCost` computed; the summary row reads «در مرحله‌ی بعد محاسبه می‌شود». CHECK.

## B2: checkout discount, gateways, wallet

### B2a: discount code + gateways
Files: edit `services/api/payments.js`, `CheckoutModal.vue`. Docs: [api] [c].

API: `listGateways(cfg)` GET `api/payment/gateways` params `{amount (Long)}` → `[{gateway, eligible (null = no check), title, description}]`. Hide `eligible===false`. Label = `title || GATEWAY_LABELS[g] || g`.
- **Discount:** UInput «کد تخفیف» + «اعمال» sends `discountCode` in the quote.
  - `quote.discountCodeError` → inline `text-error`, not a toast.
  - Accepted → row «تخفیف کد X: −formatPrice(discountAmount)» + «حذف کد».
  - Checkout sends only an accepted code. A checkout 400 → toast.
- **Gateways:** fetch on open and when `quote.total` changes (debounced) with `amount = Math.round(total)`. Default = first. Empty with ONLINE → «درگاه پرداختی فعال نیست», ONLINE disabled. CHECK.

### B2b: wallet + terms
Files: edit `CheckoutModal.vue`.
- **Wallet:** shown when `walletEnabled && quote.walletBalance > 0 && paymentMethod==='ONLINE'`.
  - USwitch «پرداخت از کیف پول (موجودی X)» → `useWallet:true`. Show covered = min(balance, total) and the rest.
  - Rest 0 → hide the gateway select. Not offered with CASH_ON_DELIVERY (BACK answers 400 `wallet.cashOnDelivery`).
  - Response `paidByWallet:true` (no `paymentUrl`) → success state like cashOnDelivery and clear the cart.
- **Terms:** on open call `$api.auth.getPendingTerms()`.
  - Non-empty list or a failed call → required checkbox, send `acceptedTerms:true`.
  - Empty list → hide the checkbox, omit `acceptedTerms`. CHECK.

## C1: returns admin + refunds (ORDER_RETURN, ORDER_REFUND)

### C1a: staff wrappers + list branch
Files: edit `services/api/returns.js`, `pages/panel/returns/index.vue`. Docs: [api] [pp].

API (all return `OrderReturnDTO`; wrong status → 409):
- `createReturnForCustomer(cfg)` POST `api/admin/returns` `{orderId, reason, details≤1000, items:[{orderItemId, quantity}]}` (201; any paid order; exempt from the window, delivery and change-of-mind rules).
- `approveReturn(id, cfg)` POST `…/{id}/approve` `{returnMethod CUSTOMER_SENDS|STORE_PICKUP|CUSTOMER_BRINGS (req), note≤500}`.
- `rejectReturn(id, cfg)` POST `…/{id}/reject` `{note (req, ≤500)}`.
- `receiveReturn(id, cfg)` POST `…/{id}/receive` `{items?:[{returnItemId, restockedQuantity≥0, damagedQuantity≥0}], note≤500}`.
- `refundReturn(id, cfg)` POST `…/{id}/refund` `{amount? ≥0 (empty = suggestedRefund, 0 = none), note≤500}`.
- Existing `cancelReturn(true, id, {data:{note}})`.

DTO extras for staff: `personId, customerName, byStaff, refundPolicyTermsId/Version/AcceptedAt, suggestedRefund, workflow`.

Page:
- `STAFF = isStaff.value`; staff title «<مرجوعی>‌ها».
- Extra numeric filter: orderId.
- Rows add customerName, byStaff badge «ثبت توسط فروشگاه», refundAmount (formatMoney), WorkflowPendingBadge.
- The customer branch is unchanged. CHECK.

### C1b: detail staff: approve / reject / cancel
Files: edit `pages/panel/returns/[id].vue`; new `components/panel/returns/ReturnApproveModal.vue`. Docs: [pp] [cp].
- `STAFF = isStaff` for get, photos and cancel.
- Staff header: customerName, order link, byStaff, refundPolicyVersion + acceptedAt, WorkflowPendingBadge. The customer tracking code is read-only.
- REQUESTED:
  - «تأیید» → modal: returnMethod URadioGroup (`RETURN_METHOD_LABELS`) + note «توضیح برای مشتری».
  - «رد» → PanelConfirmDialog, required note «دلیل رد (به مشتری نشان داده می‌شود)», error color.
  - «لغو» → PanelConfirmDialog with optional note.
- APPROVED: «لغو».
- All disabled when `workflow?.pending`. After each action replace the return from the response (or reload when pending). CHECK.

### C1c: receive + refund
Files: new `components/panel/returns/ReturnReceiveModal.vue`, new `ReturnRefundModal.vue`; edit `returns/[id].vue`.
- **Receive** (APPROVED): per item goodsName, quantity, restocked input, damaged input.
  - Defaults: reason CHANGE_OF_MIND → all restocked, else all damaged.
  - restocked + damaged ≤ quantity (inline). Note.
- **Refund** (RECEIVED): show suggestedRefund (formatMoney). Optional MoneyInput «خالی = مبلغ پیشنهادی، ۰ = بدون بازپرداخت» + note. Omit `amount` when empty.
- COMPLETED: refundAmount + link `/panel/orders/<orderId>#refunds`.
- The staff items table adds restocked/damaged columns. CHECK.

### C1d: order refunds card
Files: edit `services/api/orders.js`, `utils/returnMeta.js`; new `components/panel/orders/OrderRefundsCard.vue`, new `components/panel/orders/RefundFormModal.vue`; edit `pages/panel/orders/[id].vue`. Docs: [api] [cp] [pp] [ut].

API:
- `listOrderRefunds(orderId)` GET `api/admin/orders/{id}/refunds` → `[{id, orderId, amount, reason ORDER_CANCELLED|SHIPPING_CHANGE|LOST|DAMAGED|RETURN|OTHER, status PENDING|PAID, note, reference, paidAt, toWallet, createdAt, createdBy, workflow}]`.
- `createOrderRefund(orderId, cfg)` POST same path `{amount ≥1 (req), reason (req), note≤500}` (201; total ≤ paid amount).
- `markOrderRefundPaid(refundId, cfg)` POST `api/admin/order-refunds/{refundId}/paid` `{reference≤100, note≤500, toWallet}` (workflow-bindable → 202).

`returnMeta.js` additions:
- `REFUND_REASON_LABELS`: لغو سفارش، تغییر ارسال، گم شدن مرسوله، آسیب مرسوله، مرجوعی، سایر.
- `REFUND_STATUS_META`: PENDING «در انتظار پرداخت» warning; PAID «پرداخت شد» success.

Card (staff only, `id="refunds"`, hidden on 403):
- Rows: amount, reason, status, «به کیف پول» badge, reference, dates, WorkflowPendingBadge.
- PENDING rows: «پرداخت شد» → PanelFormModal with reference, note, and a toWallet switch shown only when `walletEnabled`. Disabled while `workflow.pending`.
- Header «ثبت بازپرداخت» → RefundFormModal: MoneyInput ≥1 (required), reason USelect excluding RETURN, note. CHECK.

### C1e: cancel paid order + staff-created return
Files: edit `orders.js`; new `components/panel/orders/CancelPaidOrderModal.vue`; edit `components/panel/returns/ReturnRequestModal.vue` (prop `staff`), `pages/panel/orders/[id].vue`.

API: `cancelPaidOrder(orderId, cfg)` POST `api/admin/orders/{id}/cancel` `{note≤500, refundAmount? ≥0 (empty = full, 0 = none), restock (null = yes)}` → OrderDTO.
- Staff buttons when `statusCode==='PAID'`:
  - «ثبت مرجوعی برای مشتری» → `ReturnRequestModal :staff="true"`: `getReturnable(true, …)`, ignores `open`/deadline, always offers CHANGE_OF_MIND, no photos, submit `createReturnForCustomer`, then navigate to the return.
  - «لغو سفارش» (error outline), only when `fulfillmentStatus ∉ {SHIPPED, DELIVERED}`: note, MoneyInput refundAmount (optional), restock switch (default on). Reload the order and the refunds card after. CHECK.

## C2: purchase orders (module PURCHASE_ORDER; ids go in the body)

### C2a: wrappers fix + list + menu
Files: edit `services/api/orders.js` (replace the PO functions), `services/api/organization.js`; new `utils/purchaseOrderMeta.js`, new `pages/panel/purchase-orders/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

PO API:
- `listPurchaseOrders(cfg)` POST `api/purchase-orders/list` `{supplierId?, status?, page (1-BASED), size≤100}`. The response page is also 1-based.
- `getPurchaseOrder(cfg)` POST `/get {id}`.
- `createPurchaseOrder(cfg)` POST `api/purchase-orders` (201) and `updatePurchaseOrder(cfg)` PUT `api/purchase-orders` (DRAFT only). Body `{id (update only), supplierId (req), dateExpected?, note≤1000, items:[{goodsId, quantityOrdered>0, unitCost≥0}] (non-empty)}`.
- `submitPurchaseOrder` `/submit {id}`: DRAFT → ORDERED; workflow-bindable 202.
- `receivePurchaseOrder` `/receive`.
- `closePurchaseOrder` `/close {id}` (PARTIALLY_RECEIVED).
- `cancelPurchaseOrder` `/cancel {id}` (DRAFT|ORDERED).
- `deletePurchaseOrder` `/delete {id}` (DRAFT|CANCELLED; 204).
- Delete the five `*PurchaseOrderItem*` functions.

`PurchaseOrderDTO`: `{id, supplierId, supplierName, status, dateCreated, dateExpected, note, totalAmount, items[{id, goodsId, goodsCode, goodsName, quantityOrdered, quantityReceived, remainingQuantity, unitCost, lineTotal}], workflow, createdAt, createdBy}`.

`organization.js`:
- `listSuppliers()` GET `api/suppliers` → `[{id, name, contactName, phone, email, address, nationalId, economicCode, postalCode, iban}]`.
- `createSupplier(cfg)` POST `api/suppliers` (name required; 201).
- `getSupplier` POST `api/suppliers/get-by-id {id}`.
- Keep `updateSupplier` and `deleteSupplier` (POST `/update` and `/delete`).
- Remove `rateSupplier` / `getSupplierRating` (no such endpoints).

`purchaseOrderMeta.js` `PO_STATUS_META`: DRAFT پیش‌نویس neutral; ORDERED ثبت‌شده info; PARTIALLY_RECEIVED دریافت ناقص warning; RECEIVED دریافت کامل success; CLOSED بسته‌شده neutral; CANCELLED لغوشده error.

List: `backendBase:1`. Filters status + supplier (hidden if suppliers fail). Table: # link, تأمین‌کننده, وضعیت, مبلغ (formatMoney totalAmount), تاریخ ثبت, تاریخ مورد انتظار, WorkflowPendingBadge.

Menu: `{key:'purchase-orders', label:'سفارش‌های خرید', icon:'i-heroicons-clipboard-document-list', to:'/panel/purchase-orders', modules:['PURCHASE_ORDER'], group:'stock'}`. CHECK.

### C2b: form + new page + supplier quick-create
Files: new `components/panel/purchase-orders/PurchaseOrderForm.vue`, new `components/panel/purchase-orders/SupplierModal.vue`, new `pages/panel/purchase-orders/new.vue`; edit `index.vue` (primary CTA). Docs: [cp] [pp].
- **Form** (props `initial`, `saving`; emits `submit(body)`):
  - Supplier USelectMenu + «تأمین‌کننده جدید» → SupplierModal (name required ≤255, contactName, phone ≤50, email) → `createSupplier` → select it.
  - dateExpected: JalaliDateInput, clearable. note ≤1000.
  - Item rows: goods USelectMenu with debounced 300 ms search via `goods.filterGoods({data:{page:1, size:20, nameFa:q}})`, label «goodCode – nameFa»; quantity via parseQuantity ≥1; unitCost MoneyInput ≥0; lineTotal; add/remove; warn on duplicate goods.
  - Grand total. Requires a supplier, at least one row, and every row complete.
- **new.vue:** `createPurchaseOrder` → `/panel/purchase-orders/<id>`. CHECK.

### C2c: detail + state actions
Files: new `pages/panel/purchase-orders/[id].vue`.
- Header: #, status, WorkflowPendingBadge, supplier, dates, createdBy, note.
- Items table: code, name, ordered, received, remaining, progress bar, unitCost, lineTotal; total.
- DRAFT: «ویرایش» shows PurchaseOrderForm inline → `updatePurchaseOrder({data:{id, …}})`; «ثبت نهایی» (primary, confirm) → submit; «حذف» (confirm error) → back to list.
- ORDERED: «لغو» (confirm). PARTIALLY_RECEIVED: «بستن سفارش» (confirm «باقیمانده دیگر دریافت نمی‌شود»). CANCELLED: «حذف».
- All disabled while `workflow?.pending`. CHECK.

### C2d: receive modal
Files: new `components/panel/purchase-orders/ReceiveModal.vue`; edit `[id].vue` (button «دریافت کالا» for ORDERED|PARTIALLY_RECEIVED).
- Warehouse USelect (`inventory.listWarehouses()`, default `isDefault`).
- Rows for items with remaining > 0: quantity (0/empty = skip, ≤ remaining), batchNumber ≤255, manufactureDate and expiryDate (JalaliDateInput).
- `profile.expiryRequired` → expiryDate required on rows with a quantity. `profile.batchRequired` → batchNumber required.
- Body `{purchaseOrderId, warehouseId, note≤500, lines:[{itemId, quantity, batchNumber?, manufactureDate?, expiryDate?}]}`, at least one line. CHECK.

## C7: store customers (STORE_CUSTOMER; delete/import/export STORE_CUSTOMER_ADMIN)

### C7a: wrappers + list + menu
Files: new `services/api/crm.js` (+index `crm`), new `pages/panel/customers/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listStoreCustomers(cfg)` GET `api/admin/store-customers` params `{q?, marketingSms? true|false, source? IN_STORE|IMPORT, page, size}` → `PageResponse<{id, firstName, lastName, phone, marketingSms, source, birthDate, description, createdAt, updatedAt}>`.
- `getStoreCustomer(id)`.
- `createStoreCustomer(cfg)` POST (201; duplicate phone → 409).
- `updateStoreCustomer(id, cfg)` PUT: full; `marketingSms:null` = unchanged.
- `deleteStoreCustomer(id)` DELETE.
- `importStoreCustomers(cfg)` POST `…/import` multipart `file` → `{totalRows, created, skipped, errors:[{rowNumber, phone, message}]}`.
- `downloadCustomerTemplate()` GET `…/import-template` (blob).
- `exportStoreCustomers()` GET `…/export` (blob).

List:
- Filters: q (debounced 400 ms), marketing (همه / دریافت می‌کنند / لغو کرده‌اند), source.
- Table: نام, موبایل (ltr), پیامک تبلیغاتی badge, منبع {IN_STORE: ثبت در فروشگاه, IMPORT: فایل اکسل}, تاریخ تولد, تاریخ ثبت.

Menu: `{key:'customers', label:'باشگاه مشتریان', icon:'i-heroicons-user-group', to:'/panel/customers', modules:['STORE_CUSTOMER','STORE_CUSTOMER_ADMIN'], group:'sales'}`. CHECK.

### C7b: form modal + delete
Files: new `components/panel/customers/StoreCustomerFormModal.vue`; edit `customers/index.vue`.
- Fields: firstName (required ≤100), lastName ≤100, phone (required; `normalizeIranianMobile` + `isValidPhoneNumber`), marketingSms (default on), birthDate (JalaliDateInput, clearable, not in the future), description ≤500.
- 409 → inline under phone.
- Delete only when `canRead('STORE_CUSTOMER_ADMIN')`. CHECK.

### C7c: import / export
Files: new `components/panel/ImportResultSummary.vue` (shared), new `components/panel/customers/CustomerImportModal.vue`; edit `customers/index.vue`. Docs: [cp] [ds] (import result pattern).
- **ImportResultSummary:** props `counts [{label, value, color}]`, `errors []`, `columns [{key, label}]` → tiles + a scrollable errors table.
- **Modal:**
  - «دانلود قالب» → `download(downloadCustomerTemplate(), 'store-customers-template.xlsx')`.
  - FilePickButton `.xlsx` → upload `FormData{file}` → counts کل / ثبت‌شده / تکراری / خطا; error columns rowNumber, phone, message.
  - Reload the list on close if `created > 0`.
- Header buttons (when STORE_CUSTOMER_ADMIN): «ورود از اکسل», «خروجی اکسل» → `download(exportStoreCustomers(), 'store-customers.xlsx')`. CHECK.

## C8: moderation

### C8a: reviews (GOODS_REVIEW)
Files: new `services/api/contentAdmin.js` (+index `contentAdmin`); edit `pages/panel/reviews/index.vue` (staff branch); new `components/panel/reviews/ReviewReplyModal.vue`; edit `panelMenus.js` (owner fallback: reviews, questions). Docs: [api] [pp] [cp] [ut].

API:
- `listReviewsAdmin(cfg)` GET `api/admin/reviews` params `{status? PENDING|APPROVED|REJECTED, goodsId?, rating? 1..5, page, size}` → `PageResponse<{id, rating, comment, authorName, createdAt, storeReply, storeReplyAt, goodsId, goodsName, status, updatedAt, userId, storeReplyBy}>`.
- `approveReview(id)` / `rejectReview(id)` POST `…/{id}/approve|reject`.
- `replyReview(id, cfg)` PUT `…/{id}/reply` `{reply (req, ≤1000, plain)}`.
- `removeReviewReply(id)` DELETE `…/{id}/reply`.
- `deleteReview(id)` DELETE `…/{id}`.

Staff branch:
- Title «مدیریت <نظرات>». Filters status (default PENDING) + rating.
- Rows: stars, goods link, author, comment, date, status, reply block.
- Actions: تأیید (PENDING/REJECTED), رد (PENDING/APPROVED), پاسخ (modal), حذف پاسخ (confirm), حذف (confirm). Update rows in place. CHECK.

### C8b: questions (GOODS_QUESTION)
Files: edit `contentAdmin.js`, `pages/panel/questions/index.vue` (staff branch); new `components/panel/questions/QuestionAnswerModal.vue`.

API:
- `listQuestionsAdmin(cfg)` GET `api/admin/questions` params `{status? PENDING|ANSWERED|REJECTED, goodsId?, privateQuestion?, page, size}` (PENDING = queue, oldest first) → `{id, question, authorName (the real name even when anonymous), anonymous, createdAt, answer, answeredAt, answerSignature, goodsId, goodsName, privateQuestion, status, userId, answeredBy}`.
- `answerQuestion(id, cfg)` PUT `…/{id}/answer` `{answer (req, ≤2000)}`.
- `removeQuestionAnswer(id)` DELETE `…/{id}/answer`.
- `rejectQuestion(id)` POST `…/{id}/reject`.
- `deleteQuestion(id)` DELETE.

Staff branch:
- Default PENDING «صف پاسخ». Private filter. Badges خصوصی / ناشناس.
- Actions: پاسخ, حذف پاسخ, رد, حذف.
- Show an info alert, not the disabled state, when Q&A is off. CHECK.

## C9: blog (BLOG_POST, BLOG_TAG, BLOG_COMMENT)

### C9a: posts list + tabs shell + menu
Files: edit `contentAdmin.js`; new `utils/blogMeta.js`, new `pages/panel/blog/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listBlogPostsAdmin(cfg)` GET `api/admin/blog/posts` params `{status? DRAFT|PUBLISHED, categoryId?, tagId?, q? ≤100, sort LATEST|POPULAR, page, size}` → `PageResponse<{id, title, slug, excerpt, author, coverImageUrl, categoryId, categoryName, tags[{id, name}], status, publishedAt, viewCount, createdAt, updatedAt}>`.
- `getBlogPostAdmin(id)` → detail: + `content, images[AttachmentDTO {id, fileName, url, isPrimary,…}], metaTitle, metaDescription, noIndex, seo`.
- `createBlogPost(cfg)` POST (201; always DRAFT).
- `updateBlogPost(id, cfg)` PUT.
- `publishBlogPost(id, cfg)` POST `…/{id}/publish`, optional body `{publishedAt}` (a future time = scheduled).
- `unpublishBlogPost(id)`.
- `deleteBlogPost(id)` DELETE.
- `reindexBlog()` POST `…/reindex` → string.
- `uploadBlogImages(id, cfg)` POST `…/{id}/images` multipart `files` (repeated) → AttachmentDTO[].

`blogMeta.js`:
- `BLOG_POST_STATUS_META` {DRAFT پیش‌نویس neutral, PUBLISHED منتشرشده success}.
- `postStateMeta(p)`: PUBLISHED with a future `publishedAt` → «زمان‌بندی‌شده» info.
- `BLOG_COMMENT_STATUS_META` {PENDING در انتظار تأیید warning, APPROVED تأییدشده success, REJECTED ردشده error}.

Page:
- UTabs on query `tab`; only the posts tab in this step.
- Filters: status, category (`blog.listCategories()`), q (debounced), sort.
- Table: cover thumbnail, title (link to `/panel/blog/<id>`), status, category, tag chips, views, publishedAt.
- Row menu: مشاهده در سایت (PUBLISHED → `/blog/<slug>`), ویرایش, حذف.
- Header secondary «بازسازی جستجو» → reindex toast.

Menu: `{key:'blog', label:'وبلاگ', icon:'i-heroicons-newspaper', to:'/panel/blog', modules:['BLOG_POST','BLOG_COMMENT','BLOG_TAG'], group:'content'}`. CHECK.

### C9b: post form + new/edit + publish
Files: new `components/panel/blog/BlogPostForm.vue`, new `pages/panel/blog/new.vue`, new `pages/panel/blog/[id].vue`, new `components/panel/blog/PublishPostModal.vue`; edit `contentAdmin.js` (add `listBlogTags()` GET `api/admin/blog/tags` → `[{id, name}]`); edit `blog/index.vue` (primary «پست جدید»).
- **Form:**
  - title (required ≤200), slug (≤200, ltr, «خالی = از عنوان»), excerpt ≤500.
  - content: required, UTextarea rows 14 «متن پست (HTML)», with a collapsible `htmlToText` preview.
  - author ≤100, category USelect (optional), tags USelectMenu multiple (value-key).
  - metaTitle ≤100, metaDescription ≤300, noIndex.
  - Body: `{title, slug, excerpt, content, author, metaTitle, metaDescription, noIndex, categoryId, tagIds}`.
- **new.vue:** create → editor.
- **[id].vue:** load, save (update), status badge.
  - DRAFT: «انتشار» → modal with JalaliDateInput withTime «خالی = همین حالا».
  - PUBLISHED: «برگرداندن به پیش‌نویس» (confirm).
  - «حذف» (confirm → list), «مشاهده». CHECK.

### C9c: post images
Files: new `components/panel/blog/BlogImagesCard.vue`; edit `blog/[id].vue`.
- Grid of `images` with a «کاور» badge on `isPrimary`.
- FilePickButton multiple, JPG/PNG/WebP → `uploadBlogImages` → reload.
- Per image: «کاور کن» → `attachment.setPrimary({data:{id}})`; «حذف» → `attachment.deleteAttachment({data:{id}})` (confirm). CHECK.

### C9d: tags tab
Files: edit `contentAdmin.js` (`createBlogTag` POST `api/admin/blog/tags` `{name (req, ≤100)}`; `updateBlogTag(id, cfg)` PUT `…/{id}`; `deleteBlogTag(id)` DELETE); new `components/panel/blog/BlogTagsTab.vue`; edit `blog/index.vue` (tab).
- Inline add, inline row edit, delete with confirm. CHECK.

### C9e: comments tab
Files: edit `contentAdmin.js`; new `components/panel/blog/BlogCommentsTab.vue`; edit `blog/index.vue`.

API:
- `listBlogCommentsAdmin(cfg)` GET `api/admin/blog/comments` `{status?, postId?, page, size}` → `{id, authorName, content, status, createdAt, parentId, staffReply, replies, postId, postTitle, userId}`.
- `approveBlogComment(id)` / `rejectBlogComment(id)` POST `…/{id}/approve|reject`.
- `replyBlogComment(id, cfg)` POST `…/{id}/reply` `{content (req, ≤2000)}`: APPROVED comments only.
- `deleteBlogComment(id)` DELETE (soft delete, replies included).

UI: default PENDING. Post link, «پاسخ فروشگاه» badge, «پاسخ به نظر #». Reply via PanelConfirmDialog (required note, max 2000). CHECK.

## C10: contact (module CONTACT)

### C10a: messages + modal + menu
Files: edit `contentAdmin.js`; new `utils/contactMeta.js`, new `pages/panel/contact/index.vue`, new `components/panel/contact/ContactMessageModal.vue`; edit `panelMenus.js`. Docs: [api] [pp] [cp] [ut].

API:
- `listContactMessages(cfg)` GET `api/admin/contact-messages` `{status? NEW|READ|REPLIED|CLOSED, q? ≤100, page, size}` → `{id, fullName, email, phone, subject, message, status, userId, ticketId, createdAt, updatedAt}`.
- `getContactMessage(id)`.
- `setContactMessageStatus(id, cfg)` POST `…/{id}/status` `{status}`.
- `convertContactToTicket(id, cfg)` POST `…/{id}/convert-to-ticket`, optional body `{category TECHNICAL|FINANCIAL|GENERAL, priority LOW|MEDIUM|HIGH}` → DTO with `ticketId`. 400 = sender is not a store user; 409 = already converted.
- `deleteContactMessage(id)`.

`contactMeta.js`: NEW جدید primary, READ خوانده‌شده neutral, REPLIED پاسخ داده شد success, CLOSED بسته neutral.

List: status + q filters. NEW rows use the ticket "new message" highlight. Click opens the modal:
- Full text (`whitespace-pre-line`), mailto/tel links, status USelect.
- «تبدیل به تیکت» with category/priority (`ticketMeta` labels) → `/panel/tickets/<ticketId>`; «مشاهده تیکت» when `ticketId` exists.
- Delete.
- Opening a NEW message sets it to READ.

Menu: `{key:'contact', label:'پیام‌های تماس', icon:'i-heroicons-envelope', to:'/panel/contact', modules:['CONTACT'], group:'content'}`. CHECK.

### C10b: notify phones
Files: edit `contentAdmin.js` (`getContactSettings` GET `api/admin/contact-settings` → `{phones[]}`; `saveContactSettings(cfg)` PUT `{phones ≤5}`, [] = SMS off); new `components/panel/contact/ContactSettingsModal.vue`; edit `contact/index.vue` (secondary «تنظیمات اطلاع‌رسانی»).
- Chips + add input (normalize + validate), max 5, dedupe. CHECK.

## C11: info pages (ABOUT_US, RETURN_POLICY, TERMS)

### C11a: shell + About us + menu
Files: edit `contentAdmin.js`; new `pages/panel/pages/index.vue`, new `components/panel/pages/AboutUsForm.vue`; edit `panelMenus.js`. Docs: [api] [pp] [cp] [ut].

API:
- `getAboutUsAdmin()` GET `api/admin/about-us` → `{id (null = never saved), title, content, mission, vision, contactEmail, contactPhone, address, logoUrl, workingHours, instagram, telegram, whatsapp, latitude, longitude, active, defaultText, updatedAt}`.
- `saveAboutUs(cfg)` PUT, full replace. Rules: title required ≤200; content required (HTML ≤100000); mission/vision ≤2000; email format; contactPhone `[0-9+\- ]{0,50}`; address/logoUrl ≤255; workingHours ≤500; socials ≤255; lat −90..90; lng −180..180; `active:null` = on.
- `deleteAboutUs()` DELETE (404 when never saved).

UI:
- UTabs on query `tab`, gated by canRead: درباره ما | شرایط مرجوعی (C11b) | قوانین (C11c).
- `defaultText` → info alert. «حذف متن» only when `id` is set. Link to `/about`.

Menu: `{key:'pages', label:'صفحات اطلاع‌رسانی', icon:'i-heroicons-document-duplicate', to:'/panel/pages', modules:['ABOUT_US','TERMS','RETURN_POLICY'], group:'content'}`. CHECK.

### C11b: return policy tab
Files: edit `contentAdmin.js`; new `components/panel/pages/ReturnPolicyTab.vue`; edit `pages/index.vue`.

API:
- `getReturnPolicyAdmin()` GET `api/admin/return-policy` → `{id, title, content, version, active, defaultText, publishedAt, updatedAt}`.
- `listReturnPolicyVersions()` GET `…/versions` (newest first).
- `saveReturnPolicy(cfg)` PUT `{title (req ≤200), content (req, HTML ≤100000), active (null = publish and archive the previous one; false = hidden)}`.
- `resetReturnPolicy()` DELETE → publishes the default text (returns the DTO).

UI: editor + switch «منتشر شود» + versions table (جاری / پیش‌فرض badges) + «بازگشت به متن پیش‌فرض» (confirm). CHECK.

### C11c: terms tab
Files: edit `contentAdmin.js`; new `utils/termsMeta.js`, new `components/panel/pages/TermsTab.vue`, new `TermsFormModal.vue`; edit `pages/index.vue`.

API:
- `listTermsAdmin(cfg)` GET `api/admin/terms` params `{type? TERMS_OF_USE|PRIVACY_POLICY|REFUND_POLICY, status? DRAFT|PUBLISHED|ARCHIVED}` → `[{id, type, title, version, content, effectiveDate, status, publishedAt, defaultText, updatedAt}]`.
- `getTermsAdmin(id)`.
- `createTerms(cfg)` POST (201) `{type, title ≤200, version ≤50 (unique per type, 409), content (HTML ≤200000), effectiveDate?}`.
- `updateTerms(id, cfg)` PUT (DRAFT only).
- `publishTerms(id)`: the previous version is archived and customers get the A4 dialog.
- `unpublishTerms(id)`.
- `deleteTerms(id)` (not PUBLISHED).

`termsMeta.js`:
- Type labels: قوانین استفاده، حریم خصوصی، شرایط بازپرداخت.
- `TERMS_STATUS_META`: DRAFT neutral, PUBLISHED success, ARCHIVED warning «بایگانی».

Actions: ویرایش (DRAFT); انتشار (DRAFT|ARCHIVED, confirm «کاربران باید نسخه‌ی تازه را بپذیرند»); لغو انتشار (PUBLISHED); حذف (not PUBLISHED); «نسخه‌ی جدید». CHECK.

### C11d: acceptances on the user page
Files: edit `contentAdmin.js` (`listTermsAcceptances(cfg)` GET `api/admin/terms-acceptances` params `{userId}` (required) → `[{id, termsId, type, version, title, username, source REGISTRATION|CHECKOUT|PROMPT|PANEL_LOGIN, ipAddress, acceptedAt}]`); new `components/panel/users/TermsAcceptancesCard.vue`; edit `pages/panel/users/[id].vue` (only when `canRead('TERMS')`).
- Source labels: ثبت‌نام، ثبت سفارش، پنجره‌ی قوانین جدید، ورود به پنل. CHECK.

## C12: store settings

### C12a: generic settings editor (SYSTEM_SETTINGS)
Files: new `services/api/storeSettings.js` (+index `storeSettings`), new `utils/settingsMeta.js`, new `components/panel/settings/SettingField.vue`; replace `pages/panel/settings/index.vue`; edit `SettingsTabs.vue` (add `{تنظیمات عمومی, /panel/settings, exact, SYSTEM_SETTINGS}` first), `composables/useStoreProfile.js` (add `refresh()`). Docs: [api] [pp] [cp] [ut] [co].

API:
- `listSettings()` GET `api/admin/settings` → `[{key, label, group, groupLabel, scope, type BOOLEAN|INTEGER|TEXT|URL|MOBILE_LIST|CARD_NUMBER|CHOICE, editable, min, max, defaultValue, value, ownValue, source OWN|PLATFORM|DEFAULT, choices[]}]`.
- `updateSetting(cfg)` PUT `{key, value (string)}` → DTO.
- `resetSetting(cfg)` POST `api/admin/settings/reset` `{key}` → DTO.

Page:
- Group USelect in this order: SECURITY, PASSWORD, SMS, SUPPORT, ORDER, PAYMENT, PRESCRIPTION, STORE_PROFILE, STOREFRONT, STOREFRONT_FEATURES, REPORT, SEARCH, BACKUP. Only groups that have editable rows; label = `groupLabel`.
- Search over label/key. Shows editable rows only.

SettingField:
- Label + key (ltr, muted). Source badge: OWN «مقدار فروشگاه» primary; PLATFORM «پیش‌فرض پلتفرم» neutral; DEFAULT «پیش‌فرض» neutral.
- By type:
  - BOOLEAN: switch, saves on change (`'true'`/`'false'`).
  - CHOICE: USelect, saves on change.
  - INTEGER: numeric input, «بین min و max».
  - TEXT: textarea, maxlength = `max`.
  - URL: ltr, http(s).
  - MOBILE_LIST: comma-separated, each normalized + validated, count ≤ `max`, saved joined by `','`.
  - CARD_NUMBER: 16 digits.
- Non-boolean fields get a «ذخیره» ghost button when dirty. «بازگشت به پیش‌فرض» when `ownValue != null`.
- After saving in groups STOREFRONT_FEATURES, STORE_PROFILE or ORDER → `useStoreProfile().refresh()`.
- `refresh = async () => { profile.value = null; await load() }`. CHECK.

### C12b: store type (STORE_PROFILE)
Files: edit `storeSettings.js` (`saveStoreProfile(cfg)` POST `api/store-profile` `{storeType (req) PHARMACY|SUPERMARKET|CLOTHING|ELECTRONICS|GENERAL, batchRequired, expiryRequired, prescriptionEnabled, variantsEnabled}` (null = template default) → StoreProfileDTO), `settingsMeta.js`; new `pages/panel/settings/store.vue`; edit `SettingsTabs.vue` (`{نوع فروشگاه, /panel/settings/store, SYSTEM_SETTINGS}`).

`STORE_TYPE_META` labels and template defaults (batch, expiry, prescription, variants):

| Type | Label | Batch | Expiry | Prescription | Variants |
|---|---|---|---|---|---|
| PHARMACY | داروخانه | ✓ | ✓ | ✓ | – |
| SUPERMARKET | سوپرمارکت | – | ✓ | – | – |
| CLOTHING | پوشاک | – | – | – | ✓ |
| ELECTRONICS | لوازم الکترونیکی | – | – | – | ✓ |
| GENERAL | فروشگاه عمومی | – | – | – | ✓ |

UI:
- Radio cards for the type. Changing the type prefills the four switches with the template defaults; all four are sent.
- Confirm «این تغییر کل فروشگاه را تغییر می‌دهد», then `refresh()`.
- Note: the other storefront flags live in «تنظیمات عمومی». CHECK.

### C12c: password policy (PASSWORD_POLICY)
Files: edit `storeSettings.js` (`getPasswordPolicyAdmin` GET `api/admin/password-policy` → `{policy:{minLength, maxLength, requireUppercase, requireLowercase, requireDigit, requireSpecialChar}, platformMinimum:{…}}`; `savePasswordPolicy(cfg)` PUT `{minLength 6..64 (req), requireUppercase, requireLowercase, requireDigit, requireSpecialChar}` (weaker than the platform → 400)); new `pages/panel/settings/password.vue`; edit `SettingsTabs.vue` (`{سیاست رمز عبور, …/password, PASSWORD_POLICY}`).
- minLength lower bound = max(6, platform). A rule that the platform requires is locked on with «الزام پلتفرم». maxLength is read-only.
- After save: `useState('password-policy').value = null`. CHECK.

### C12d: organization + logo (MY_ORGANIZATION)
Files: edit `storeSettings.js`; new `pages/panel/settings/organization.vue`, new `components/panel/settings/StoreLogoCard.vue`; edit `SettingsTabs.vue` (`{اطلاعات سازمان, …/organization, MY_ORGANIZATION}`).

API:
- `getMyOrganization` GET `api/admin/my-organization` → `{id (null = none), name, personType LEGAL|NATURAL, nationalId, registrationNumber, economicCode, address, postalCode, phone, email, website, establishedAt}`.
- `saveMyOrganization(cfg)` PUT, full. Rules: name required ≤255; nationalId 11 digits for LEGAL / 10 for NATURAL; economicCode 10–14 digits; postalCode 10 digits; phone `[0-9+\- ]{0,20}`; email; website ≤255; establishedAt not in the future.
  - Once saved, nationalId and economicCode are locked: inputs disabled, send null (= unchanged). A different value → 409.
- `getStoreLogo` GET `…/logo` → `{url}`.
- `uploadStoreLogo(cfg)` POST `…/logo` multipart `file` (PNG/JPEG ≤1 MB).
- `deleteStoreLogo` DELETE `…/logo`.

CHECK.

## C13: attributes + variants

### C13a: wrappers + list + menu (GOODS_ATTRIBUTE)
Files: new `services/api/catalogAdmin.js` (+index `catalogAdmin`), new `utils/attributeMeta.js`, new `pages/panel/attributes/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listAttributes()` GET `api/attributes` → `[{id, name, type TEXT|NUMBER|BOOLEAN|SELECT|MULTI_SELECT, unit, options[{id, value, sortOrder}]}]`.
- `getAttribute(cfg)` POST `api/attributes/get {id}`.
- `createAttribute(cfg)` POST `api/attributes` (201) `{name (req ≤100), type, unit ≤30 (NUMBER), options (SELECT types only) [{id?, value (req ≤100), sortOrder}]}`.
- `updateAttribute(cfg)` PUT `api/attributes`: `id` required; an option without `id` is new; an omitted option is removed.
- `deleteAttribute(cfg)` POST `api/attributes/delete {id}` (204; fails while goods use it).

`attributeMeta.js`: TEXT متن, NUMBER عدد, BOOLEAN بله/خیر, SELECT انتخاب تکی, MULTI_SELECT انتخاب چندتایی; `hasOptions(type)`.

Page: UTabs on query `tab`: ویژگی‌ها | دسته‌بندی‌ها (C13c). Table: name, type, unit, up to 5 option chips + «+N», edit/delete.

Menu: `{key:'attributes', label:'ویژگی‌های کالا', icon:'i-heroicons-adjustments-horizontal', to:'/panel/attributes', modules:['GOODS_ATTRIBUTE'], group:'stock'}`. CHECK.

### C13b: attribute modal
Files: new `components/panel/attributes/AttributeFormModal.vue`; edit `attributes/index.vue` (primary «ویژگی جدید»).
- Fields: name, type, unit (NUMBER only).
- Options repeater for option types: value, ↑/↓, remove/add; `sortOrder` = index; values unique; at least one option.
- Non-option types send `options: null`. CHECK.

### C13c: category assignments
Files: edit `catalogAdmin.js`; new `components/panel/attributes/CategoryAttributesTab.vue`, new `AssignAttributeModal.vue`; edit `attributes/index.vue`.

API:
- `listCategoryAttributes(cfg)` POST `api/attributes/category/list {categoryId}` (public) → `[{id, categoryId, categoryName, inherited, attribute:{…}, required, filterable, variantAxis, sortOrder}]`.
- `assignCategoryAttribute(cfg)` POST `…/category/assign {categoryId, attributeId, required, filterable, variantAxis, sortOrder}` (creates or updates).
- `unassignCategoryAttribute(cfg)` POST `…/category/unassign {categoryId, attributeId}` (204).

UI:
- Category USelectMenu from `catalog.listCategories({params:{scope:'PRODUCT'}})`, label `fullPath || name`.
- Inherited rows are read-only with «از دسته‌ی والد: X».
- Assign modal: attribute select (excluding direct assignments), required, filterable, variantAxis (enabled only when `variantsEnabled && attribute.type==='SELECT'`), sortOrder. Edit = same modal. Remove with confirm. CHECK.

### C13d: model products + variants list (GOODS)
Files: edit `catalogAdmin.js` (`listVariants(cfg)` POST `api/goods/variants/list {modelId}` → `[{id, goodCode, barcode, nameFa, price, purchasePrice, discountPercent, discountStartsAt, discountEndsAt, activeDiscountPercent, finalPrice, isActive, availableQuantity, axes[{attributeId, attributeName, optionId, optionValue}]}]`), `pages/panel/products/new.vue`; new `components/panel/products/VariantsCard.vue`; edit `pages/panel/products/[id].vue`. Docs: [cp] [pp].
- **new.vue** (when `variantsEnabled`): switch «محصول دارای تنوع (رنگ، سایز، …)» → `isModel:true` (create only; hint «بعد از ساخت قابل تغییر نیست؛ مدل خودش فروخته نمی‌شود»).
- **[id].vue:** when `product.isModel`, VariantsCard lists code, axes text, price/finalPrice (formatMoney), stock, active, and an edit link `/panel/products/<variantId>`. CHECK.

### C13e: generate / create variants
Files: edit `catalogAdmin.js`; new `components/panel/products/GenerateVariantsModal.vue`, new `VariantCreateModal.vue`; edit `VariantsCard.vue`.

API:
- `generateVariants(cfg)` POST `api/goods/variants/generate {modelId, axes:[{attributeId, optionIds[] (non-empty)}]}` (201; every new combination, code = model code + n, price = model price, existing combinations skipped).
- `createVariant(cfg)` POST `api/goods/variants/create {modelId, goodCode? ≤255, barcode? ≤255, price? ≥0, purchasePrice? ≥0, axes:[{attributeId, optionId}]}` (one per axis).

UI:
- Axes = `listCategoryAttributes` for each of `product.categoryIds`, keep `variantAxis`, dedupe by attribute id.
- No axes → message + link `/panel/attributes?tab=categories`.
- Generate modal: options per axis + combination count (warn above 100).
- Create modal: one USelect per axis + code, barcode, MoneyInput price/purchasePrice. CHECK.

## C14: imports

### C14a: goods Excel + menu
Files: edit `catalogAdmin.js`, `services/api/goods.js` (remove the stale `importGoods`); new `pages/panel/imports/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `downloadGoodsTemplate()` GET `api/import/downloadTemplate` (blob).
- `importGoodsExcel(cfg)` POST `api/import/goodsImport` multipart `file`. **RAW** result `res.data = {totalRows, successCount, errors:[{rowNumber, message, goodCode, nameFa}]}`. A 400 (missing file) has the same shape; 413 = too large.

UI:
- Hint «ترتیب: ۱ کالاها، ۲ عکس‌ها، ۳ موجودی اولیه».
- Card 1: template download (`goods-template.xlsx`), FilePickButton `.xlsx`, upload (buttons disabled while uploading) → ImportResultSummary.

Menu: `{key:'imports', label:'ورود گروهی', icon:'i-heroicons-arrow-up-tray', to:'/panel/imports', modules:['GOODS'], group:'stock'}`. CHECK.

### C14b: images + opening stock
Files: edit `catalogAdmin.js`, `imports/index.vue`.

API:
- `importGoodsImages(cfg)` POST `api/import/goods-images` multipart `files` (repeated) + `replaceExisting` (`'true'`/`'false'`). ApiResponse payload `{totalFiles, attachedCount, failedCount, files:[{fileName, goodCode, goodsId, attachmentId, url, primary, error}]}`.
- `importOpeningStock(cfg)` POST `api/import/opening-stock` multipart `file`. **RAW** `{totalRows, successCount, errors}` (INVENTORY CREATE; columns good_code, batch_number, expiry_date yyyy-MM-dd, quantity; default warehouse).

UI:
- Card 2: naming rule (12345.jpg = primary; 12345-2.jpg …), multi-pick image/*, count + total size, switch «جایگزینی عکس‌های قبلی», per-file table (product link, primary badge, error).
- Card 3: `.xlsx` (no template endpoint; list the columns) → summary. CHECK.

## C15: stock movements + insights

### C15a: stock movements (INVENTORY)
Files: edit `catalogAdmin.js`, `utils/inventoryMeta.js` (`MOVEMENT_TYPE_META`); new `pages/panel/stock-movements/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API: `listStockMovements(cfg)` POST `api/stock-movements/list {goodsId?, warehouseId?, batchId?, inventoryId?, type?, fromDate?, toDate? (yyyy-MM-dd), page (1-BASED), size≤100}` → `PageResponse<{id, inventoryId, goodsId, goodsCode, goodsName, warehouseId, warehouseName, batchId, batchNumber, type, quantity (signed), balanceAfter, reason, note, referenceType ORDER|TRANSFER|PURCHASE_ORDER, referenceId, unitCost, createdAt, createdBy}>`.

`MOVEMENT_TYPE_META`: OPENING موجودی اولیه info; ADJUSTMENT تعدیل warning; IMPORT ورود از فایل info; RECEIPT رسید خرید success; SALE فروش neutral; RETURN مرجوعی info; TRANSFER_OUT انتقال خروجی warning; TRANSFER_IN انتقال ورودی success.

UI:
- `backendBase:1`. Filters: type, warehouse, goods picker (as in C2b), from/to; preset from `?goodsId=`.
- Columns: date (withTime), goods, warehouse, batch, type, ±quantity (colored), balance, reason (`ADJUSTMENT_REASON_META`) + note, reference link (ORDER/PO), unitCost, createdBy.

Menu: `{key:'stock-movements', label:'کاردکس موجودی', icon:'i-heroicons-arrows-right-left', to:'/panel/stock-movements', modules:['INVENTORY'], group:'stock'}`. CHECK.

### C15b: insights (WISHLIST, STOCK_ALERT, GLOBAL_SEARCH)
Files: edit `catalogAdmin.js`; new `pages/panel/insights/index.vue`; edit `panelMenus.js`.

API:
- `topWishlist(cfg)` GET `api/admin/wishlist/top {size ≤100, default 20}` → `[{goodsId, goodsName, wishCount}]`.
- `topStockAlerts(cfg)` GET `api/admin/stock-alerts/top {size}` → `[{goodsId, goodsName, waitingCount, sellableQuantity}]`.
- `popularSearches(cfg)` / `zeroResultSearches(cfg)` GET `api/admin/search/queries/popular|zero-results {days 1..365 (7), limit 1..100 (20)}` → `[{queryText, count}]`.

UI:
- UTabs gated by canRead + store flags (`wishlistEnabled`, `stockAlertsEnabled`; flag off → note inside the tab).
- size/limit select 20/50/100; days select 7/30/90/365.
- Rank, product link, counts. `sellableQuantity 0` → «ناموجود» error badge. Zero-result rows link to `/medications?search=`.
- Each tab has its own states.

Menu: `{key:'insights', label:'تحلیل تقاضا', icon:'i-heroicons-light-bulb', to:'/panel/insights', modules:['WISHLIST','STOCK_ALERT','GLOBAL_SEARCH'], group:'insights'}`. CHECK.

## B11: customer prescriptions (only when `prescriptionEnabled`)

### B11a: wrappers, meta, customer list, menu
Files: new `services/api/prescription.js` (+index `prescription`), new `utils/prescriptionMeta.js`, new `pages/panel/prescriptions/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API, with `base(staff) = staff ? 'api/admin/prescriptions' : 'api/prescriptions/my'`:
- `listPrescriptions(staff, cfg)` GET base. Customer params `{status?, page, size}`; staff adds `personId?, insuranceId?, createdFrom?, createdTo?, q? ≤100`.
- `getPrescription(staff, id)`.
- `imageRequest(staff, id)` GET `base/{id}/image` (blob; 404 when `!hasImage`).
- `receiptRequest(staff, id)` (blob).
- `cancelPrescription(staff, id, cfg)` POST `base/{id}/cancel`. Customer: no body, only SUBMITTED|AVAILABLE|PARTIALLY_AVAILABLE. Staff: optional `{reason ≤500}`, any status except DELIVERED.
- Customer only:
  - `getPrescriptionOptions()` GET `api/prescriptions/my/options` → `{prescriptionEnabled, storeCourierEnabled, cardToCardEnabled, cardNumber, cardHolder, insurances[{id, name, kind BASIC|SUPPLEMENTARY, sortOrder, active}]}`.
  - `submitPrescription(cfg)` multipart POST `api/prescriptions/my`.
  - `confirmPrescription(id, cfg)`.
  - `uploadPrescriptionReceipt(id, cfg)` (multipart `file`).

`PrescriptionDTO`: `id, status, patientFirstName, patientLastName, patientNationalCode, trackingCode, doctorName, doctorLicense, dateIssued, notes, insuranceId, insuranceName, supplementaryInsuranceId, supplementaryInsuranceName, hasImage, responseNote, drugPrice, courierFee, respondedAt, deliveryMethod, shippingAddress{fullAddress,…}, courierName, courierPhone, paymentMethod, paymentStatus, payableAmount, hasReceipt, receiptRejectReason, confirmedAt, paidAt, readyAt, shippedAt, deliveredAt, cancelledAt, cancelReason, createdAt, updatedAt` + staff-only `personId, personName, personPhone, respondedById, respondedByName`.

`prescriptionMeta.js`:
- Status: SUBMITTED در انتظار بررسی warning; AVAILABLE موجود success; PARTIALLY_AVAILABLE بخشی موجود info; UNAVAILABLE ناموجود error; INVALID نامعتبر error; CONFIRMED تأیید شده info; READY آماده‌ی تحویل success; SHIPPED ارسال شد info; DELIVERED تحویل شد success; CANCELLED لغو شده neutral.
- Payment status: UNPAID neutral; AWAITING_RECEIPT منتظر رسید warning; RECEIPT_SUBMITTED info; RECEIPT_REJECTED error; PAID success.
- Delivery: PICKUP مراجعه‌ی حضوری; STORE_COURIER پیک داروخانه; CUSTOMER_COURIER پیک خودم.
- Payment method: ON_DELIVERY پرداخت هنگام تحویل; CARD_TO_CARD کارت به کارت.
- Insurance kind: پایه / تکمیلی.
- `CUSTOMER_CANCELLABLE`.

Customer page:
- `profile && !prescriptionEnabled` → disabled state.
- Primary «ثبت نسخه» → `/new`. Status filter. Rows: patient, tracking code, status, payment badge, date.

Menu: `{key:'prescriptions', label:'نسخه‌ها', icon:'i-heroicons-document-text', to:'/panel/prescriptions', modules:['PRESCRIPTION'], flag:'prescriptionEnabled', group:'sales'}` + the customer fallback entry. CHECK.

### B11b: submit form
Files: new `pages/panel/prescriptions/new.vue`, new `components/panel/prescriptions/PrescriptionForm.vue`.
- Load options.
- Sections:
  - بیمار: patientFirstName and patientLastName (required ≤100), patientNationalCode (required, `validateIranianNationalCode`).
  - نسخه: trackingCode ≤30 (ltr) **or** image (FilePickButton `image/*,application/pdf`, ≤10 MB); at least one is required.
  - پزشک: doctorName ≤200, doctorLicense ≤50, dateIssued (JalaliDateInput, not in the future).
  - بیمه: insuranceId (active BASIC, «آزاد» = null) and supplementaryInsuranceId (active SUPPLEMENTARY).
  - notes ≤1000.
- FormData appends non-empty values only. 400 → show the message; 409 → toast.
- Success → detail page. CHECK.

### B11c: customer detail
Files: new `pages/panel/prescriptions/[id].vue`, new `components/panel/prescriptions/CustomerPrescriptionDetail.vue`, new `components/panel/prescriptions/PrescriptionFileView.vue`.
- `[id].vue`: customers → CustomerPrescriptionDetail; staff → placeholder until C17b.
- PrescriptionFileView (prop `loader`): an image via `previewUrl`; a PDF blob → «باز کردن PDF» (`window.open`). Revoke on unmount.
- Detail:
  - Stepper. CANCELLED/UNAVAILABLE/INVALID show an alert with `cancelReason`/`responseNote`.
  - Info blocks. Response card: drugPrice, courierFee, payableAmount via `formatPrice`.
  - File view.
  - «لغو نسخه» (confirm) for `CUSTOMER_CANCELLABLE`.
  - Confirmed choices + `shippingAddress.fullAddress`. CHECK.

### B11d: confirm + receipt
Files: new `components/panel/prescriptions/PrescriptionConfirmModal.vue`, new `ReceiptUploadModal.vue`; edit `CustomerPrescriptionDetail.vue`.
- **Confirm** (AVAILABLE|PARTIALLY_AVAILABLE):
  - Delivery radio: STORE_COURIER only when `storeCourierEnabled`, with a required address USelect from `address.getAddresses({data:{personId}})`; CUSTOMER_COURIER with optional courierName ≤100 / courierPhone 09….
  - Payment radio: CARD_TO_CARD only when `cardToCardEnabled && drugPrice != null`; shows cardNumber (ltr + copy) and cardHolder.
  - Estimate = drugPrice + (STORE_COURIER ? courierFee : 0).
  - Body `{deliveryMethod, addressId?, courierName?, courierPhone?, paymentMethod}`.
- **Receipt** (AWAITING_RECEIPT|RECEIPT_REJECTED): show `receiptRejectReason`; FilePickButton → `FormData{file}`. «مشاهده رسید» when `hasReceipt`. CHECK.

## C17: prescriptions admin (module PRESCRIPTION)

### C17a: staff list + insurances
Files: edit `prescription.js` (`listInsurances()` GET `api/admin/prescriptions/insurances`; `createInsurance(cfg)` POST (201) `{name (req ≤100; duplicate per kind → 409), kind, sortOrder 0..10000, active}`; `updateInsurance(id, cfg)` PUT `…/{id}`; `deleteInsurance(id)` DELETE), `prescriptions/index.vue` (staff branch); new `components/panel/prescriptions/InsurancesModal.vue`.
- Filters: status, q (debounced), insurance, createdFrom/To.
- Table: #, patient + national code, sender name/phone, insurance, status, payment, date. SUBMITTED rows highlighted.
- Header secondary «بیمه‌ها» → modal with inline-editable rows, add, delete. CHECK.

### C17b: staff detail + respond
Files: edit `prescription.js` (`respondPrescription(id, cfg)` POST `api/admin/prescriptions/{id}/respond {status (req) AVAILABLE|PARTIALLY_AVAILABLE|UNAVAILABLE|INVALID, note≤1000, drugPrice≥0, courierFee≥0}` (after a customer confirm or a cancel → 409)); new `components/panel/prescriptions/StaffPrescriptionDetail.vue`, new `PrescriptionRespondModal.vue`; edit `[id].vue`.
- Blocks: sender, patient, doctor, insurance, file (staff), response (respondedByName/At), customer choices.
- «پاسخ به نسخه» (primary) while status is SUBMITTED or one of the four response statuses.
- Modal: status radio, note, MoneyInput drugPrice, MoneyInput courierFee «فقط برای پیک داروخانه». CHECK.

### C17c: receipt review + lifecycle
Files: edit `prescription.js` (`approveReceipt(id)` POST `…/{id}/receipt/approve`; `rejectReceipt(id, cfg)` `{reason (req ≤500)}`; `markReady`, `markShipped`, `markDelivered` POST `…/{id}/ready|ship|deliver`; `deletePrescription(id)` DELETE), `StaffPrescriptionDetail.vue`.
- RECEIPT_SUBMITTED: receipt view + approve / reject (required note).
- CONFIRMED with PICKUP|CUSTOMER_COURIER → «آماده‌ی تحویل». CONFIRMED with STORE_COURIER → «ارسال با پیک». For CARD_TO_CARD both need PAID: disabled with a hint.
- READY|SHIPPED → «تحویل شد».
- Not DELIVERED/CANCELLED → «لغو» (optional note).
- «حذف» → back to the list. CHECK.

## C16: SMS account + campaigns

### C16a: account + shell + menu (SMS_ACCOUNT)
Files: edit `crm.js`; new `pages/panel/sms/index.vue`, new `components/panel/sms/SmsAccountCard.vue`; edit `panelMenus.js`. Docs: [api] [pp] [cp] [ut].

API:
- `getSmsAccount()` GET `api/admin/sms-account` → `{allowed, configured, active, inUse, apiKeyHint, senderNumber, marketingSenderNumber, credit:{remainCredit (Rial), expireDate, type}|null, problem INVALID_KEY|ACCOUNT_DISABLED|NO_CREDIT|INVALID_SENDER|IP_NOT_ALLOWED|TRIAL_ACCOUNT|null, problemMessage, problemAt}`.
- `saveSmsAccount(cfg)` PUT `{apiKey ≤200 (empty = keep), senderNumber (req) \d{4,20}, marketingSenderNumber (\d{4,20})?, active (null = on)}` (the key is verified with Kavenegar; `!allowed` → 403).
- `checkSmsAccount()` POST `…/check` → credit.
- `testSmsAccount(cfg)` POST `…/test {phone 09\d{9}, marketing}`.
- `deleteSmsAccount()` DELETE.

UI:
- UTabs on query `tab`: کمپین‌ها (C16b) | حساب پیامک.
- Card: badges, credit, problem UAlert.
- Form, disabled with an info note when `!allowed`: apiKey (password field, placeholder = hint), sender numbers (ltr), active.
- Buttons: ذخیره, «بررسی اعتبار», «پیامک آزمایشی» (modal: phone + marketing), «بازگشت به حساب پلتفرم» (confirm).

Menu: `{key:'sms', label:'پیامک و کمپین', icon:'i-heroicons-chat-bubble-bottom-center-text', to:'/panel/sms', modules:['SMS_ACCOUNT','SMS_CAMPAIGN'], group:'marketing'}`. CHECK.

### C16b: campaigns tab + usage (SMS_CAMPAIGN)
Files: edit `crm.js` (`getCampaignUsage()` GET `api/admin/sms-campaigns/usage` → `{tenantCode, period, monthlyQuota (0 = off), used, remaining, ownAccountAllowed, unlimited, ownAccountProblem}`; `listCampaigns(cfg)` GET `api/admin/sms-campaigns {page, size}` → `PageResponse<{id, title, message, fullText, parts, audience STORE_CUSTOMERS|ONLINE_CUSTOMERS|ALL, kind MANUAL|BIRTHDAY, occasionDate, discountCodeId, ownAccount, status QUEUED|SENDING|DONE|CANCELLED, recipientCount, sentCount, failedCount, cancelledCount, pendingCount, createdBy, createdAt, scheduledAt, startedAt, finishedAt}>`); new `utils/smsMeta.js`, new `components/panel/sms/CampaignsTab.vue`; edit `sms/index.vue` (tab + primary «کمپین جدید»).

`smsMeta.js`:
- Campaign status: QUEUED در صف info; SENDING در حال ارسال warning; DONE پایان یافته success; CANCELLED لغو شده neutral.
- Recipient status: PENDING / SENT / FAILED / CANCELLED.
- Audience: مشتریان باشگاه / مشتریان سایت / همه. Kind: دستی / تبریک تولد.

UI:
- Usage card: «نامحدود» when `unlimited`; otherwise progress used/quota; quota 0 → warning.
- Rows: title link, kind, audience, status, sent/recipients progress, failed, dates. CHECK.

### C16c: campaign detail
Files: edit `crm.js` (`getCampaign(id)`; `listCampaignRecipients(id, cfg)` GET `…/{id}/recipients {status?, page, size (default 50)}` → `{id, storeCustomerId, personId, phone, name, text, status, providerStatus, error, sentAt}`; `cancelCampaign(id)` POST `…/{id}/cancel` (finished → 409); `retryCampaignFailed(id)` POST `…/{id}/retry-failed`); new `pages/panel/sms/[id].vue`.
- Counter grid, fullText, dates, ownAccount badge.
- «لغو کمپین» (QUEUED|SENDING). «ارسال دوباره‌ی ناموفق‌ها» (failedCount > 0 and not CANCELLED).
- Recipients table: status filter, size 50.
- Poll the campaign every 15 s while QUEUED|SENDING; stop on unmount. CHECK.

### C16d: new campaign
Files: edit `crm.js` (`previewCampaign(cfg)` POST `…/preview {message (req ≤500), audience?, discountCodeId?}` → `{fullText, characters, parts, recipientCount, totalParts}`; `testCampaign(cfg)` POST `…/test` (same body) → phone string; `createCampaign(cfg)` POST `api/admin/sms-campaigns {title (req ≤100), message, audience, discountCodeId?, scheduledAt? (≤90 days; empty = now)}` (201; 400 = no recipients / quota / time)); new `pages/panel/sms/new.vue`, new `components/panel/sms/CampaignForm.vue`.
- Form:
  - title, message with counter (hint: the footer is appended; `{discountCode}` placeholder).
  - audience (default STORE_CUSTOMERS).
  - Discount USelect: `commerceAdmin.listDiscountCodes({params:{page:0, size:100}})`, active codes only; hidden on 403/empty; hint «فقط اگر تنظیم کد تخفیف کمپین روشن باشد».
  - scheduledAt: JalaliDateInput withTime, clearable (quiet hours 22–08, ≤90 days).
- Preview, debounced 600 ms. Warn when `totalParts > remaining` and not `unlimited`.
- «ارسال آزمایشی به خودم» → toast with the phone.
- Submit: confirm showing totals → create → detail page. CHECK.

## C18: reports + audit

### C18a: reports (module REPORT; all POST)
Files: new `services/api/reports.js` (+index `reports`), new `pages/panel/reports/index.vue`, new `components/panel/reports/ReportRunModal.vue`; edit `panelMenus.js`, `BACKEND_REQUESTS.md` (request: expose `select` options). Docs: [api] [pp] [cp] [ut].

API:
- `listReports()` POST `api/report/all` → `[{code, title, parameters:{name:{type string|number|date|jalali-date|select, label, required, defaultValue}}, reportType REPORT|DASHBOARD, chartType BAR|LINE|PIE|AREA|TABLE, defaultOutputType, hasTemplate}]`.
- `getReportData(cfg)` POST `api/report/data {code, inputParams}` → `{code, title, reportType, chartType, columns[], rows[{col:val}]}`.
- `generateReport(cfg)` POST `api/report/generate {code, outputType PDF|EXCEL|HTML, inputParams}` with `responseType:'blob'`.

UI:
- Card grid; click opens the modal. Parameter inputs by type:
  - string → input; number → numeric.
  - date → JalaliDateInput, send ISO.
  - jalali-date → JalaliDateInput, send `${jy}/${mm}/${dd}` via `isoToJalali` (Latin digits).
  - select → text input + «فهرست گزینه‌ها از سرور در دسترس نیست؛ شناسه را وارد کنید».
  - Prefill `defaultValue`; required checks.
- Buttons:
  - «نمایش»: scrollable table, fa-IR numbers, no chart library.
  - «اکسل»: `download` as `<code>.xlsx`.
  - «PDF» (only when `hasTemplate`): `previewUrl` → `window.open`, revoke after 60 s.

Menu: `{key:'reports', label:'گزارش‌ها', icon:'i-heroicons-chart-bar', to:'/panel/reports', modules:['REPORT'], group:'insights'}`. CHECK.

### C18b: audit (module AUDIT)
Files: replace `services/api/audit.js` with only `searchAudit`; new `pages/panel/audit/index.vue`; edit `panelMenus.js`.

API: `searchAudit(cfg)` POST `api/admin/audit/search {entityName?, entityId?, action?, outcome? SUCCESS|FAILED, userId?, performedBy?, from?, to? ('YYYY-MM-DDTHH:mm:ss'), page (1-BASED), size≤100}` → `PageResponse<{id, entityName, entityId, action, outcome, errorMessage, oldValue, newValue, performedBy, userId, performedAt, ipAddress, userAgent}>`.

UI:
- Filters are applied with a «جستجو» button that copies them into the `applied` reactive watched by usePagedList. `backendBase:1`.
- Expandable rows show errorMessage, IP, user agent, and old/new values in `<pre dir="ltr" class="font-mono text-xs whitespace-pre-wrap">` (pretty JSON when it parses).

Menu: `{key:'audit', label:'لاگ ممیزی', icon:'i-heroicons-clipboard-document-check', to:'/panel/audit', modules:['AUDIT'], group:'insights'}`. CHECK.

## C19: workflow task inbox

Common to C19–C22: `taskId` is a string (`encodeURIComponent` in URLs). Instance and definition ids are numbers.

### C19a: wrappers, meta, inbox, menu (WORKFLOW_TASK)
Files: new `services/api/workflow.js` (+index `workflow`), new `utils/workflowMeta.js`, new `pages/panel/tasks/index.vue`; edit `panelMenus.js`. Docs: [api] [pp] [ut].

API:
- `listTasks(cfg)` GET `api/admin/workflow/tasks {scope MINE|CLAIMABLE (default MINE), page, size}` → `PageResponse<{taskId, instanceId, stepKey, stepTitle, subject, subjectTitle, entityId, action, summary:{title, lines[{label, value}]}, status OPEN|CLAIMED, mine, assigneeUserId, startedBy, createdAt, dueAt, overdue, startedByName, assigneeName}>`.
- `getTaskCount()` GET `…/count` → `{mine, claimable, overdue}`.
- `getTask(taskId)` GET `…/{taskId}` → `{task, instance, timeline[{stepKey, stepTitle, decision APPROVE|REJECT|RETURN|COMMENT, comment, actorUserId, actorUsername, actorRoles, decidedAt, actorName, actorRoleTitles}], attachments NONE|OPTIONAL|REQUIRED, attachedFiles}`.
- `claimTask` / `unclaimTask` POST `…/{taskId}/claim|unclaim`.
- `commentTask(taskId, cfg)` POST `…/comments {comment (req ≤1000)}` → task detail.
- `attachToTask(taskId, cfg)` POST `…/attachments` multipart `file`.
- `decideTask(taskId, cfg)` POST `…/decide {decision APPROVE|REJECT|RETURN, comment≤1000 (required for REJECT/RETURN)}` → `WorkflowInstanceDTO {id, subject, entityId, action, definitionId, definitionTitle, definitionVersion, status RUNNING|COMPLETED|REJECTED|RETURNED|CANCELLED|FAILED, startedByUserId, startedBy, startedAt, endedAt, endReason, activeSteps[], startedByName}`.
- `reassignTask(taskId, cfg)` POST `…/reassign {userId}` (WORKFLOW_MONITOR).
- `getInstance(id)` GET `api/admin/workflow/instances/{id}` → `{instance, timeline, openTasks, incidents[{jobId, stepKey, message, failedAt}], waits[{stepKey, stepTitle, eventCode, since}], attachments[], answers[{stepKey, stepTitle, key, title, value}]}`.
- `listInstancesByEntity(cfg)` GET `…/instances/by-entity {subject, entityId}`.
- `instanceAttachment(id, attId)` GET `…/instances/{id}/attachments/{attId}` (blob).

`workflowMeta.js` (labels copied from BACK `WorkflowPageLabels.java`):
- `INSTANCE_STATUS_META`: RUNNING در جریان info; COMPLETED تأییدشده success; REJECTED ردشده error; RETURNED برگشت برای اصلاح warning; CANCELLED لغوشده neutral; FAILED خطا در اعمال نتیجه error.
- `DECISION_META`: APPROVE success; REJECT error; RETURN warning; COMMENT «یادداشت» neutral.
- `DEFINITION_STATUS_META`: DRAFT پیش‌نویس; PUBLISHED منتشرشده; RETIRED بازنشسته.
- `DAY_TYPE_META`: OFFICIAL_HOLIDAY تعطیل رسمی error; CLOSED تعطیلی فروشگاه warning; WORKING کار در روز تعطیل info.
- Label maps: STEP_TYPE, APPROVER_TYPE, COMPLETION, ATTACHMENT_MODE, OPERATOR, DEADLINE_UNIT, OVERDUE_ACTION, AUTO_DECISION, WAIT_TIMEOUT.
- `entityLink(subject, id)`: PURCHASE_ORDER → `/panel/purchase-orders/<id>`; ORDER_RETURN → `/panel/returns/<id>`; else null.
- `isWorkflowUnavailable(e)`: 403 || 404.

Inbox:
- UTabs «کارهای من (n)» / «قابل برداشت (n)» with counts from `getTaskCount`.
- Switch «فقط دیرشده‌ها» filters the current page client-side, with a note.
- Cards: summary.title (fallback subjectTitle #entityId), up to 3 lines, step/subject chips, starter, createdAt, dueAt + overdue badge, assignee. Link to the task.
- Empty: «کاری در کارتابل شما نیست».

Menu: `{key:'tasks', label:'کارتابل', icon:'i-heroicons-inbox-stack', to:'/panel/tasks', modules:['WORKFLOW_TASK'], group:'workflow'}`. CHECK.

### C19b: task detail (read-only)
Files: new `pages/panel/tasks/[taskId].vue`, new `components/panel/workflow/TaskTimeline.vue`. Docs: [pp] [cp].
- **TaskTimeline:** actorName (fallback actorUsername) + actorRoleTitles, decision badge, stepTitle, comment (pre-line), decidedAt (withTime). COMMENT entries tinted gray.
- **Page:** summary title, instance status, entity link, summary lines, step card (due/overdue, assignee, starter), definition title + version, timeline.
- 404 → «این کار پیدا نشد یا دیگر در کارتابل شما نیست». CHECK.

### C19c: task actions
Files: new `components/panel/workflow/TaskDecisionCard.vue`; edit `tasks/[taskId].vue`.
- OPEN && !mine → «برداشتن». mine && CLAIMED → «رها کردن».
- Decision card (when mine or OPEN):
  - Radio تأیید / رد / برگشت برای اصلاح. Comment ≤1000, required for رد/برگشت.
  - Unless attachments are NONE: FilePickButton → `attachToTask` (counter). REQUIRED with 0 files → تأیید disabled with «برای تأیید دست‌کم یک فایل پیوست کنید».
  - Submit → toast → `/panel/tasks`.
- «ثبت یادداشت» → PanelConfirmDialog (required note) → `commentTask` → replace the detail.
- Every error → backend message toast. CHECK.

### C19d: reassign + menu badge
Files: new `components/panel/workflow/ReassignModal.vue`, new `composables/useWorkflowTaskCount.js`; edit `pages/panel.vue`, `tasks/[taskId].vue`, `tasks/index.vue`. Docs: [cp] [co] [pp].
- **ReassignModal:** `user.listStaff()` (GET `api/users/staff` → `[{id, firstName, lastName, phone}]`) in a searchable USelectMenu. On 403 → numeric «شناسه کاربر» input. → `reassignTask`. The button shows only when `canRead('WORKFLOW_MONITOR')`.
- **useWorkflowTaskCount:** `useState`. `refresh()` swallows errors; 403/404 → null and stop. `start()`/`stop()` poll every 60 s, skipped while the tab is hidden; staff with WORKFLOW_TASK only.
- **panel.vue:** item `tasks` gets `badge = mine + claimable` (undefined when 0). Start/stop like notifications. The tasks pages call `refresh()` after actions. CHECK.

### C19e: entity workflow card
Files: new `components/panel/workflow/EntityWorkflowCard.vue`; edit `pages/panel/purchase-orders/[id].vue`, `pages/panel/returns/[id].vue` (staff only).
- Props `subject` (PURCHASE_ORDER | ORDER_RETURN), `entityId`.
- `listInstancesByEntity`; hidden on empty or any error.
- Each run: definition + version, status, starter/date, active steps. Link to `/panel/workflow/instances/<id>` only when `canRead('WORKFLOW_MONITOR')`. CHECK.

## C20: workflow run monitoring (WORKFLOW_MONITOR)

### C20a: instances list + tabs + menu
Files: edit `workflow.js` (`listInstances(cfg)` GET `api/admin/workflow/instances {status?, subject?, entityId?, definitionId?, startedByUserId?, from?, to? (yyyy-MM-dd inclusive), page, size}`; `listSubjects()` GET `api/admin/workflow/subjects` → `[{code, title, actions[{code, title}], fields[{key, title, type NUMBER|TEXT|BOOLEAN|ID}], events[{code, title}]}]` (WORKFLOW_DESIGN)); new `components/panel/workflow/WorkflowTabs.vue`, new `pages/panel/workflow/index.vue`, new `pages/panel/workflow/instances/index.vue`; edit `panelMenus.js`, `tasks/index.vue` (WorkflowTabs). Docs: [api] [pp] [cp] [ut].
- **WorkflowTabs** (filtered by canRead): کارتابل `/panel/tasks` (TASK), اجراها `/panel/workflow/instances` (MONITOR). Later steps append: فرایندها, اتصال‌ها, رویدادها (DESIGN), تقویم (CALENDAR).
- **`workflow/index.vue`:** `navigateTo` the first accessible of instances, definitions, calendar (replace).
- **List:**
  - Filters: status, subject (USelect from `listSubjects`; error → text input), entityId, from/to.
  - Columns: # link, definition + «v»version, subject title (from subjects) + entity link, action title, status, active steps, starter, start/end.

Menu: `{key:'workflow', label:'گردش کار', icon:'i-heroicons-arrow-path-rounded-square', to:'/panel/workflow', modules:['WORKFLOW_MONITOR','WORKFLOW_DESIGN','WORKFLOW_CALENDAR'], group:'workflow'}`. CHECK.

### C20b: instance detail + actions
Files: edit `workflow.js` (`retryInstance(id)` POST `…/instances/{id}/retry` → detail (409 when not running or no incident); `cancelInstance(id, cfg)` POST `…/{id}/cancel {reason (req ≤500)}` (RUNNING only); `publishEvent(cfg)` POST `api/admin/workflow/events {subject≤50, entityId≤64, event≤50}` → Integer (0 = nothing was waiting; unknown event → 400)); new `pages/panel/workflow/instances/[id].vue`.
- Header: definition, entity link, status, starter, dates, endReason. Active steps.
- Open tasks: assignee or «برداشته نشده», due/overdue, «ارجاع» (ReassignModal), link to the task.
- Incidents alert + «تلاش دوباره» (RUNNING with incidents).
- Waits + «اعلام رویداد» (confirm) → `publishEvent({subject, entityId, event: eventCode})` → toast `n` steps advanced, or «مرحله‌ای منتظر نبود».
- Answers table (objects shown via `JSON.stringify`).
- Attachments → `download(instanceAttachment(id, a.id), a.fileName)`.
- Timeline. «لغو اجرا» (RUNNING; required reason; error color). CHECK.

## C21: bindings, calendar, custom events

### C21a: bindings (WORKFLOW_DESIGN)
Files: edit `workflow.js` (`listBindings()` GET `api/admin/workflow/bindings` → `[{subject, subjectTitle, action, definitionId, definitionKey, definitionTitle, publishedVersion, definitionStatus}]`; `bindWorkflow(cfg)` PUT same path `{subject, action, definitionId}` (published definition of the same subject+action only; replaces the previous binding); `unbindWorkflow(subject, action)` DELETE same path with `params {subject, action}`; `listDefinitions(cfg)` GET `api/admin/workflow/definitions {status?, subject?, page, size}`); new `pages/panel/workflow/bindings.vue`, new `components/panel/workflow/BindModal.vue`; edit `WorkflowTabs.vue`.
- Search box. Subjects shown as an accordion; `API_*` subjects grouped under «درخواست‌های API».
- Each action row: title + code (ltr) and the binding (title, v, status) or «بدون فرایند».
- «اتصال/تغییر» → BindModal: `listDefinitions({params:{status:'PUBLISHED', subject, size:100}})` filtered by action; empty → hint + link to definitions.
- «برداشتن اتصال» (confirm). CHECK.

### C21b: calendar (WORKFLOW_CALENDAR)
Files: edit `workflow.js` (`getCalendar()` GET `api/admin/workflow/calendar` → `{workingDays[], startTime 'HH:mm', endTime, defaults}`; `saveCalendar(cfg)` PUT `{workingDays (non-empty), startTime, endTime}` (start < end); `listCalendarDays(cfg)` GET `…/calendar/days {year (Jalali)}` → `[{id, date, type, title, store}]`; `addCalendarDay(cfg)` POST `…/calendar/days {date, type CLOSED|WORKING, title≤200}` (one row per date → 409); `deleteCalendarDay(id)` DELETE (store rows only)); new `pages/panel/workflow/calendar.vue`; edit `WorkflowTabs.vue`.
- Card 1: `defaults` note, WEEKDAYS checkboxes, `type=time` start/end, save.
- Card 2: year select (`currentJalaliYear()` ±2), days table, delete only when `store`, «افزودن روز» (PanelFormModal: date, CLOSED/WORKING radio, title). CHECK.

### C21c: custom events (WORKFLOW_DESIGN)
Files: edit `workflow.js` (`listCustomEvents()` GET `api/admin/workflow/custom-events` → `[{id, subject, subjectTitle, code, title}]`; `createCustomEvent(cfg)` POST `{subject≤50, code≤50, title≤200}` (201; 409 duplicate); `deleteCustomEvent(id)` DELETE); new `pages/panel/workflow/events.vue`; edit `WorkflowTabs.vue`.
- List grouped by subject. Info: «این رویدادها در مرحله‌ی انتظار قابل انتخاب‌اند و با «اعلام رویداد» در صفحه‌ی اجرا جلو می‌روند».
- Add modal: subject select, code (auto-uppercase, `^[A-Z][A-Z0-9_]{1,49}$`, ltr), title. Delete with confirm. CHECK.

## C22: workflow designer (WORKFLOW_DESIGN)

### C22a: definitions list + create + export + retire/delete
Files: edit `workflow.js` (`getDefinition(id)` → `{id, key, title, subject, subjectTitle, action, status, publishedVersion, publishedAt, draftChanged, steps[], version (Long), createdAt, updatedAt}`; `createDefinition(cfg)` POST `api/admin/workflow/definitions {title≤200, subject, action, steps≤20 (non-null, may be incomplete)}` (201; also used for import); `retireDefinition(id)` POST `…/{id}/retire` (PUBLISHED only; bound → 409); `deleteDefinition(id)` DELETE (never-published DRAFT only); `exportDefinition(id)` GET `…/{id}/export` → `{title, subject, action, steps}`); new `pages/panel/workflow/definitions/index.vue`, new `components/panel/workflow/DefinitionCreateModal.vue`; edit `WorkflowTabs.vue`.
- List: `steps` are empty in list responses.
  - Filters: status, subject.
  - Columns: title link, subject title + action title, status, published version, «تغییر منتشرنشده» badge, updatedAt.
- Row menu:
  - ویرایش.
  - «خروجی JSON»: `Blob(JSON.stringify(data, null, 2), 'application/json')` → `<key>.json`.
  - بازنشسته کردن (PUBLISHED; confirm «برگشت‌پذیر نیست»).
  - حذف (DRAFT with publishedVersion null).
- Primary «فرایند جدید»: title + subject + action selects → create with `steps:[]` → editor. CHECK.

### C22b: import + versions/BPMN
Files: edit `workflow.js` (`listDefinitionVersions(id)` GET `…/{id}/versions` → `[{version, publishedAt, publishedBy, deploymentId}]`; `getDefinitionBpmn(id, cfg)` GET `…/{id}/bpmn {version?}` → payload = XML string); new `components/panel/workflow/DefinitionImportModal.vue`, new `DefinitionVersionsModal.vue`; edit `definitions/index.vue`.
- **Import:** `.json` file (FileReader) or a pasted ltr mono textarea. `JSON.parse`; check title/subject/action are strings and `steps` is an array ≤20; preview → create → editor. Note «نقش‌ها و کارمندان را دوباره انتخاب کنید».
- **Versions modal:** table + «دانلود BPMN» per version (`<key>-v<n>.bpmn`). CHECK.

### C22c: editor shell
Files: edit `workflow.js` (`updateDefinition(id, cfg)` PUT `…/{id} {title, steps≤20, version}` (409 `workflow.definition.conflict` / retired); `validateDefinition(id)` POST `…/{id}/validate` → `{valid, errors[{stepKey|null, message}]}`; `publishDefinition(id)` POST `…/{id}/publish` (invalid → 400)); new `pages/panel/workflow/definitions/[id].vue`, new `components/panel/workflow/StepCard.vue`.
- Load the definition + `listSubjects`. Title input, badges, read-only subject/action. RETIRED = read-only banner.
- **StepCard:** index, key, title, type, approver summary, completion, deadline, condition flag, per-step errors. Buttons ↑ ↓, ویرایش (disabled until C22d), حذف.
- «افزودن مرحله» (max 20): `{key:'s<n>', title:'مرحله‌ی تازه', type:'APPROVAL', approvers:[], completion:'ANY'}`.
- «ذخیره»: PUT with `version`; store the response `version`. 409 → confirm reload.
- «اعتبارسنجی»: save if dirty, then validate → errors by stepKey; global errors in a top UAlert.
- «انتشار»: save → validate → publish → toast «نسخه‌ی N منتشر شد».
- Dirty guard: `onBeforeRouteLeave` + `beforeunload`. CHECK.

### C22d: approval step editor
Files: edit `workflow.js` (`getApproverOptions(cfg)` GET `api/admin/workflow/approver-options {q?}` → `{roles[{id, name, description, title}], users[{id, username, fullName}] (≤100), systemActions[{code, title, params[{key, title, type, required, choices{}, maxLength}], outputs[{key, title, type}]}]}`); new `composables/useApproverOptions.js` (cached first load + debounced `searchUsers(q)`), new `components/panel/workflow/StepEditorModal.vue`; edit `definitions/[id].vue`. Docs: [co] [cp].
- key: `^[a-z][a-z0-9_]{0,29}$`, unique. title required. type limited to APPROVAL until C22f.
- Approvers (at least one): ROLE → role select (label `title || name`); USER → searchable user select; STARTER / PREVIOUS_ACTOR → nothing extra.
- completion; starterMayDecide; attachments (OPTIONAL = send null, NONE, REQUIRED).
- Deadline toggle: amount ≥1, unit, onOverdue. ESCALATE → escalateToRoleId (required), optional repeatEvery and escalateAgainToRoleId.
- `condition` is kept as-is (builder in C22e). Null keys omitted. CHECK.

### C22e: condition builder
Files: new `components/panel/workflow/ConditionBuilder.vue` (recursive); edit `StepEditorModal.vue`, `utils/workflowMeta.js` (`operatorsFor(type)`).
- Toggle «شرط اجرای مرحله» (off = null). A node is a group `{join ALL|ANY, items[1..10]}` or a leaf `{field, operator, value}`.
- **Fields:** the subject's `fields` plus, for each earlier ACTION step, `systemActions[code].outputs` → `step.<key>.<outputKey>`.
- **Operators:** NUMBER all; TEXT/ID → EQ, NE, IN; BOOLEAN → EQ, NE.
- **Values:** typed. IN = comma list → array (numbers for NUMBER).
- Add leaf / add group (depth ≤3) / remove. CHECK.

### C22f: non-approval steps (JSON editor)
Files: new `components/panel/workflow/StepJsonEditor.vue`; edit `StepEditorModal.vue` (type select now includes ACTION, WAIT, AUTO).
- key/title/type and the condition builder work as before. A ltr mono textarea edits only `systemAction | waitEvent | deadline | autoDecision | goTo`.
- Templates:
  - ACTION `{"systemAction":{"code":"","params":{}}}`
  - WAIT `{"waitEvent":{"code":"","onTimeout":"CONTINUE"},"deadline":{"amount":1,"unit":"WORKING_DAYS","onOverdue":"NONE"}}`
  - AUTO `{"autoDecision":"APPROVE"}`, or GOTO + `"goTo":"<later key>"`
- `JSON.parse` on blur with inline errors; merge only the allowed keys.
- Side reference: systemActions (params and outputs), subject events (custom ones included), later step keys.
- Param ref hint: `{"ref":"amount"}`, `{"ref":"step.<key>.<answer>"}`, `{"ref":"@starter"}`, `{"ref":"@instance"}`, `{"ref":"@entity"}`. CHECK.

---

## Execution order (one Haiku run per step)
1. S0a, S0b
2. C4a, C4b, C4c
3. C5a, C5b
4. C3a, C3b
5. C6a, C6b
6. B1a, B1b, B1c
7. B2a, B2b
8. C1a, C1b, C1c, C1d, C1e
9. C2a, C2b, C2c, C2d
10. C7a, C7b, C7c
11. C8a, C8b
12. C9a, C9b, C9c, C9d, C9e
13. C10a, C10b
14. C11a, C11b, C11c, C11d
15. C12a, C12b, C12c, C12d
16. C13a, C13b, C13c, C13d, C13e
17. C14a, C14b
18. C15a, C15b
19. B11a, B11b, B11c, B11d
20. C17a, C17b, C17c
21. C16a, C16b, C16c, C16d
22. C18a, C18b
23. C19a, C19b, C19c, C19d, C19e
24. C20a, C20b
25. C21a, C21b, C21c
26. C22a, C22b, C22c, C22d, C22e, C22f

Each checklist item is ticked when its last sub-step lands. On that tick, add to "Blocked": the platform-only list, report select options, and the storefront تومان-label follow-up.

### Critical Files for Implementation
- C:\Users\Aria Aghakhani\WebstormProjects\drug-store\utils\panelMenus.js
- C:\Users\Aria Aghakhani\WebstormProjects\drug-store\services\api\index.js
- C:\Users\Aria Aghakhani\WebstormProjects\drug-store\composables\usePagedList.js
- C:\Users\Aria Aghakhani\WebstormProjects\drug-store\pages\panel\returns\[id].vue
- C:\Users\Aria Aghakhani\WebstormProjects\drug-store\pages\cart.vue
