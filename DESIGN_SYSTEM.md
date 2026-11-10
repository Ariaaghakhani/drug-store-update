# CAPSULE کپسول — Design System

> Single source of truth for the CAPSULE کپسول (capsulepharmacy.ir) online pharmacy. Values below are lifted verbatim from the codebase (`Ariaaghakhani/drug-store-update`) so this doc and the running app stay in sync.

**Stack:** Nuxt 3 · @nuxt/ui v3 · Tailwind CSS v4 · Pinia · @vite-pwa/nuxt
**Direction:** RTL (`dir="rtl"`, `lang="fa"`)
**Font:** Dana (self-hosted, 7 weights)
**Modes:** Light + Dark (`@nuxt/ui` color-mode, `.dark` class)
**Audiences:** Customer storefront + Pharmacist/staff panel

---

## 1. Design principles

1. **Clinical trust** — accurate, calm, regulatory-aware (Rx flags, dosage clarity, FDA approval marks).
2. **Everyday warmth** — friendly Persian copy, soft teal, approachable not sterile.
3. **Calm minimalism** — generous whitespace, one primary action per view, no decorative noise.

---

## 2. Color tokens

Two layers: **primitive** tokens (raw named values) and **semantic** tokens (role-based aliases). All defined as CSS custom properties.

### Brand / Teal (primary scale)

| Token | Hex | Typical use |
|---|---|---|
| `--teal-50`  | `#EBF6F3` | page tints, hover backgrounds |
| `--teal-100` | `#D6EDE7` | soft fills, `--primary-soft` |
| `--teal-200` | `#A8D8CE` | |
| `--teal-300` | `#6FBFB1` | gradient stops, accent on dark |
| `--teal-400` | `#3DA193` | dark-mode accent text |
| `--teal-500` | `#1A8073` | |
| `--teal-600` | `#0E6B5F` | **primary** — buttons, links, logo, icons |
| `--teal-700` | `#0A574D` | hover state for primary |
| `--teal-800` | `#08433C` | active/pressed |
| `--teal-900` | `#062F2A` | deepest brand |

PWA `theme_color` = `#0E6B5F` (= teal-600). Dark mode primary = `#5AC5B5`.

### Semantic accent colors

| Token | Value | Background tint | Meaning |
|---|---|---|---|
| `--leaf`   | `#3D8B4F` | `--leaf-bg: #D4EDDA`  | in-stock, success, confirmed (Nuxt UI: `success: 'green'`, use shade 700) |
| `--sky`    | `#1F6FB8` | `--sky-bg: #DAEAF6`   | informational notices |
| `--orange` | `#ea580c` | `--orange-bg: #ffedd5`| caution, warning, Rx flag, near-expiry (Nuxt UI: `warning: 'orange'`) |
| `--rose`   | `#B83A4B` | `--rose-bg: #FBE7EA`  | out-of-stock, destructive, allergy |

Dark mode tint overrides: `--orange-bg: #2D1A0A` · `--rose-bg: #3A1820` · `--sky-bg: #0F2944` · `--leaf-bg: #10301A`

### Neutral / Ink scale

`--ink-50..900`: `#F6F8F8 #EAEEEE #D7DEDE #B7C1C1 #8A9696 #5F6C6C #3F4B4B #2A3434 #1A2222 #0D1313`

### Semantic surface roles

| Token | Light | Dark |
|---|---|---|
| `--bg` (page) | `#F4F8F7` | `#0B1716` |
| `--surface` (card) | `#FFFFFF` | `#102322` |
| `--surface-2` (subtle) | `#EBF6F3` | `#0E1E1D` |
| `--surface-3` (inset) | `#F8FBFA` | `#152E2C` |
| `--border` | `#E1EAE8` | `#1E3835` |
| `--border-strong` | `#C9D6D3` | `#2B4D49` |
| `--text` | `#0F1A1A` | `#E9F2F0` |
| `--text-muted` | `#5F6C6C` | `#A7B8B5` |
| `--text-faint` | `#8A9696` | `#728381` |
| `--primary` | `#0E6B5F` (teal-600) | `#5AC5B5` |
| `--primary-hover` | `#0A574D` (teal-700) | `#7DD2C5` |
| `--primary-soft` | `#D6EDE7` (teal-100) | `#13332F` |
| `--on-primary` | `#FFFFFF` | `#062F2A` |

---

## 3. Typography

### Font stack

| Token | Family | Use |
|---|---|---|
| `--font-fa` | `'Vazirmatn', system-ui, sans-serif` | All Persian UI and Latin shared text |
| `--font-en` | `'Inter', system-ui, sans-serif` | Pharmacist panel with heavy English/technical content |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | IDs, codes, token labels |

Loaded via Google Fonts (`Vazirmatn:wght@300;400;500;600;700;800`, `Inter:wght@400;500;600;700`, `JetBrains Mono:wght@400;500`). Dana (self-hosted) remains the production app font — map `--font-fa` to Dana when integrating into the Nuxt project.

### Type scale (CSS custom properties)

| Token | Value | Role |
|---|---|---|
| `--t-display` | `64px` | Hero H1 (clamped: `clamp(40px, 5.2vw, 64px)`) |
| `--t-h1` | `40px` | Page titles |
| `--t-h2` | `28px` | Section headings |
| `--t-h3` | `22px` | Card/tile headings |
| `--t-h4` | `18px` | Sub-headings |
| `--t-body` | `16px` | Body text; inputs forced to 16px to avoid iOS zoom |
| `--t-sm` | `14px` | Captions, meta |
| `--t-xs` | `12px` | Timestamps, badges, token labels |

Headings use a 2-tone treatment: dark text with one word in `--primary` / `text-brand-500`, e.g. `محصولات <span style="color:var(--primary)">ویژه</span>`.

### Numbers

Always format with `Intl.NumberFormat('fa-IR')` / `.toLocaleString('fa-IR')` for customer-facing prices and counts → Persian digits with the `٬` thousands separator. Unit word follows the number: `۱۲۹٬۰۰۰ تومان`.

---

## 4. Spacing, radius, shadow, motion

### Spacing (4 px base)

`--s-1:4px` · `--s-2:8px` · `--s-3:12px` · `--s-4:16px` · `--s-5:20px` · `--s-6:24px` · `--s-7:32px` · `--s-8:40px` · `--s-9:48px` · `--s-10:64px` · `--s-11:80px` · `--s-12:96px`

Conventions: page container max-width `1320px`, section padding `--s-9` / `--s-11`. Card inner stacks `--s-3` / `--s-4`.

### Radii

| Token | Value | Use |
|---|---|---|
| `--r-xs` | `6px` | small chips, inner elements |
| `--r-sm` | `10px` | buttons, inputs, controls |
| `--r-md` | `14px` | cards, modals |
| `--r-lg` | `20px` | section panels, tiles |
| `--r-xl` | `28px` | hero panels, chat window |
| `--r-pill` | `999px` | badges, tags, category circles, avatars |

### Shadows (teal-tinted, layered)

| Token | Value |
|---|---|
| `--shadow-1` | `0 1px 2px rgba(8,67,60,.06), 0 1px 1px rgba(8,67,60,.04)` |
| `--shadow-2` | `0 4px 12px rgba(8,67,60,.08), 0 1px 2px rgba(8,67,60,.04)` |
| `--shadow-3` | `0 12px 28px rgba(8,67,60,.10), 0 2px 6px rgba(8,67,60,.05)` |
| `--shadow-4` | `0 24px 48px rgba(8,67,60,.14), 0 4px 10px rgba(8,67,60,.06)` |
| `--ring` | `0 0 0 3px color-mix(in oklab, var(--primary) 25%, transparent)` |

Cards use `--shadow-1` at rest, lift to `--shadow-3` on `hover`. Floating elements (cart, modals, chat) use `--shadow-3` / `--shadow-4`.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | entrances, expanding |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | state transitions |

**Icon hit targets:** header/action buttons `w-10 h-10` (40px); mobile bottom-nav items ≥ 44px tall.

---

## 5. Icons

Two sources, accessed through Nuxt UI's `<UIcon name="…" />`:
- **Heroicons** (default) — `i-heroicons-*`
- **MDI** (`@mdi/js`) — `mdi:*`

Common mappings actually used:

| Purpose | Icon name |
|---|---|
| Search | `i-heroicons-magnifying-glass` |
| Cart | `i-heroicons-shopping-cart` |
| OTC meds / shop | `i-heroicons-shopping-bag` |
| Prescription / document | `i-heroicons-document-text` |
| Product placeholder | `i-heroicons-cube` |
| AI assistant | `i-heroicons-sparkles` |
| Support | `mdi:headset` / `i-heroicons-chat-bubble-left-right` |
| Dark/light toggle | `i-heroicons-moon` / `i-heroicons-sun` |
| Account | `i-heroicons-user` / `i-heroicons-user-circle` |
| Delivery | `i-heroicons-truck` |
| Rating star | `i-heroicons-star-solid` (color `text-yellow-400`) |
| Add / remove | `i-heroicons-plus` / `i-heroicons-minus` |
| Shield / guarantee | `i-heroicons-shield-check` |
| Notifications / none | `i-heroicons-bell` / `i-heroicons-bell-slash` |

Sizing: `w-4` (16) inline · `w-5` (20) buttons · `w-6` (24) nav · `w-8`+ feature. Color via Tailwind (`text-brand-500`, `dark:text-brand-400`).

### Category icons (CategoriesCarousel.vue)

| # | Category (fa) | slug | icon |
|---|---|---|---|
| 1 | مسکن و ضد درد | pain-relief | `i-heroicons-heart` |
| 2 | ویتامین و مکمل | vitamins | `i-heroicons-beaker` |
| 3 | قلب و عروق | cardiovascular | `mdi:heart-pulse` |
| 4 | گوارش | digestive | `i-heroicons-sparkles` |
| 5 | پوست و مو | skin-hair | `i-heroicons-user` |
| 6 | اعصاب و روان | mental-health | `mdi:brain` |
| 7 | تنفسی | respiratory | `mdi:lungs` |
| 8 | کودکان | children | `mdi:baby-face-outline` |
| 9 | زنان | women | `mdi:gender-female` |
| 10 | دیابت | diabetes | `mdi:water` |
| 11 | آنتی بیوتیک | antibiotics | `i-heroicons-shield-check` |
| 12 | چشم و بینایی | eye-care | `i-heroicons-eye` |

Category circle: `w-16 h-16 md:w-20 md:h-20 rounded-full`, idle `bg-brand-100 dark:bg-brand-900` + `text-brand-600 dark:text-brand-400`, selected `bg-brand-500` + `text-white`.

---

## 6. Components

Built on `@nuxt/ui` primitives (`UButton`, `UCard`, `UBadge`, `UInput`, `UTextarea`, `UDropdownMenu`, `UModal`, `UPagination`, `USkeleton`, `UApp`/`UContainer`). App-specific config lives in `app.config.ts` (toast & modal slots are RTL-aligned with `font-dana`).

### ⚠ Valid Nuxt UI v3 color names

Only these strings are registered semantic tokens: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`.  
**Never pass** `"red"`, `"green"`, `"gray"`, `"teal"`, `"blue"`, `"orange"`, `"purple"` to Nuxt UI components — they silently produce unstyled output.

### Buttons (`UButton`)

**Variants**
- **Primary:** `color="primary"` — one CTA per view/card.
- **Secondary:** `color="neutral" variant="soft"` — secondary and cancel actions in panel pages. Prefer `soft` over `outline` or `ghost` for actions that must always be visible.
- **Outline:** `color="neutral" variant="outline"` — reserved for modal confirmation dialogs (e.g. "ادامه تغییر").
- **Ghost:** `variant="ghost"` — icon-only close/nav buttons only. Never use for labeled actions.
- **Danger:** `color="error" variant="soft"` — destructive actions (delete, terminate session). Use `variant="outline"` in danger zone cards.

**Sizes (panel pages)**
- `size="lg"` — standard for all panel card row buttons (inline actions, edit, verify).
- `size="md"` — modal footer buttons.
- `size="sm"` — card header actions (e.g. small "ویرایش" next to a section title).

**Layout patterns**
- **Single full-width:** `block` for standalone CTAs (add-to-cart, checkout, modal single-action steps like success).
- **Side-by-side equal:** `flex gap-3` container + `class="flex-1 justify-center"` on each button — used in modal step footers and two-action rows. Secondary button comes first in DOM (renders on the right in RTL = visually less prominent).
- **Icon + text:** add `icon="i-heroicons-*"` prop for row actions (e.g. edit, send link).
- **Icon-only close:** plain `<button>` with `w-8 h-8 rounded-lg` — not `UButton` — for modal header close targets.

**One primary per view.** Disabled add-to-cart flips label to "اطلاع‌رسانی موجودی".

### Badges (`UBadge`) — color map from `ProductCard.vue`

```js
const colorMap = {
  محبوب: 'green',      // popular      ← legacy raw color, avoid in new components
  پرفروش: 'blue',      // best-seller  ← legacy raw color, avoid in new components
  ویژه: 'purple',      // premium/special
  جدید: 'orange',      // new
  'تخفیف ویژه': 'red', // special discount
}
// fallback: 'primary'
```
> ⚠ The color map above uses raw Tailwind color names (legacy). For new badges use valid tokens: `success`, `info`, `warning`, `error`, `primary`.
- **Minimum text size:** `text-xs` (12px) at every badge size. `app.config.ts` overrides Nuxt UI's `xs`/`sm` (8px/10px), so `size` only changes padding below `md`.
- Discount badge: `color="error" variant="solid"` → `{n}٪ تخفیف`, placed on the product image (bottom-start), never beside the price.
- Prescription flag: `color="warning" variant="solid"` with `i-heroicons-document-text` → `نسخه‌دار`, positioned `absolute top-3 left-3` (LTR-left = visual left in RTL).

#### Badge contrast rules (light mode, white backgrounds)

Soft/outline variants use the `*-bg` tint tokens so the pill shape is visible on white. Borders use at least 50% color-mix opacity. Solid variants follow the table below — **warning (`--amber`) uses dark text**, not white, because amber is inherently light.

| Semantic | Token | Solid bg | Solid text | Soft bg | Soft text |
|---|---|---|---|---|---|
| primary | `--primary` | `#0E6B5F` | `#FFFFFF` | `#D6EDE7` (`--teal-100`) | `#08433C` (`--teal-800`) |
| success | `--leaf` | `#3D8B4F` | `#FFFFFF` | `#E2F1E4` (`--leaf-bg`) | `#0D1313` (`--ink-900`) |
| warning | `--orange` | `#ea580c` | `#FFFFFF` | `#ffedd5` (`--orange-bg`) | `#7c2d12` (orange-900) |
| error | `--rose` | `#B83A4B` | `#FFFFFF` | `#FBE7EA` (`--rose-bg`) | `#0D1313` (`--ink-900`) |
| info | `--sky` | `#1F6FB8` | `#FFFFFF` | `#E3EEF8` (`--sky-bg`) | `#0D1313` (`--ink-900`) |

> **Warning uses orange-600 (`#ea580c`)** — vivid and distinct, sufficient contrast with white text (~4.5:1). Nuxt UI config: `warning: 'orange'` in `app.config.ts`.

### Product card (`ProductCard.vue`)

Wrapped in `UCard` with `group hover:shadow-xl transition-all duration-300 h-full flex flex-col`; the whole card is a `NuxtLink` to `/medications/{linkId ?? id}` (the button inside stops the click). Build `product` with `utils/storefrontGoods.js::toProductCard`. Prop `product` shape:

```ts
interface Product {
  id: string | number
  linkId?: number            // product-page id (the model for a product with variants)
  image?: string             // real photo; absent → cube placeholder
  hasVariants?: boolean      // price prefixed "از", CTA becomes "انتخاب گزینه‌ها" (opens the product page)
  nameFa: string            // primary display name
  nameEn?: string           // not shown on the card (the Persian name only)
  brandTitle?: string       // top-right xs, bold
  category?: string         // top-left xs, brand-600, uppercase tracking-wider
  price: number             // toLocaleString('fa-IR') + ' تومان'
  originalPrice?: number     // struck-through above/below price
  discountPercent?: number   // red badge "{n}٪ تخفیف"
  rating?: number           // star + toFixed(1)
  reviewCount?: number       // "(۸۹۲ بازدید)"
  inStock: boolean          // false → red dot "ناموجود" + disabled CTA
  badge?: string            // see color map
  isPrescriptionRequired?: boolean  // orange "نسخه‌دار" flag
  minOrderQuantity?: number  // >1 → blue info "حداقل سفارش: N عدد"
  expiryLabel?: string      // from BACK ("کمتر از یک ماه") → warning notice with exclamation icon
}
```

Layout order (RTL): image (`aspect-square rounded-xl bg-gray-100`, `object-cover`, cube placeholder when none) → brand+category row (`h-4`, truncate) → `nameFa` (`text-lg` bold, `line-clamp-2`, `h-12`) → rating (`h-6`) → price (`text-xl font-black`, `h-7`, `whitespace-nowrap`) → original price (struck) + saved amount (`h-6`) → notice slot (`h-6`) → block primary add-to-cart. **Every row is a fixed-height slot that stays empty when the product lacks that detail, so all cards have the same height and their price/notice/button line up** — never make a row conditional (`v-if` on the row itself); put the `v-if` on its content. **Price type:** the amount is `font-black text-gray-900 dark:text-white` (discounted or not); the unit "تومان" and the "از" prefix are smaller and `font-medium`, same color. **Discounted price:** the old price is struck through in muted gray with `text-xs text-error` "{n} تومان صرفه‌جویی" beside it, and the `error solid` "{n}٪ تخفیف" badge sits on the image (`absolute bottom-3 start-3`, clear of the Rx badge top-start and the label badge top-end). The product page uses the same pattern (price block `text-3xl`, badge `size="lg"` on the main image, saved amount below the old price).

### Storefront listing patterns (`/medications`, `/brands/[id]`, `/near-expiry`, home)

- **Section header (home):** `text-2xl lg:text-3xl font-black` title with the section's BACK-supplied name, end-aligned `UButton color="neutral" variant="soft" trailing-icon="i-heroicons-arrow-left"` "مشاهده همه". Every second section sits on `bg-gray-50 dark:bg-gray-900/50 rounded-3xl px-6 lg:px-12`.
- **Product grid:** `ProductGrid` — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` (3 columns max beside the filter panel), skeleton cards `h-96 rounded-xl` through the `sk` transition, then the empty state (large gray icon + bold heading + muted line, optional neutral soft "clear filters" action).
- **Filter card (`SearchFilters`):** the standard panel card — header strip with `i-heroicons-adjustments-horizontal` + "فیلترها" and a `neutral soft sm` "حذف همه (n)" at the end; `divide-y` groups of `px-4 sm:px-6 py-4`, group title `text-sm font-bold`, `UCheckbox` rows with the option count `text-xs text-gray-500` at the end, long lists `max-h-56 overflow-y-auto`. Below `lg:` it collapses behind a `block neutral soft` "فیلترها (n)" button. Layout: `grid lg:grid-cols-4`, filters `lg:col-span-1` (right in RTL), results `lg:col-span-3`.
- **Sort:** `USelect w-48` end-aligned above the grid, next to a `text-sm` "n محصول یافت شد". The search form's "جستجو" button is the page's one primary action.
- **Category row (home):** the `CategoriesCarousel` circles from the category table above, fed by the store's category tree; hidden entirely when the tree isn't available. In the filter card, categories are a single-choice `UCheckbox` list (subcategories indented `ms-5`).
- **Brand tile:** `w-36 h-28 rounded-xl bg-white dark:bg-gray-800 border`, `hover:border-brand-300`, logo `max-h-12 object-contain` (or `i-heroicons-building-storefront`) over a `text-sm font-bold` name; strip scrolls horizontally with the scrollbar hidden.
- **Brand header:** `w-24 h-24 rounded-xl` logo tile + two-tone `font-black` title ("محصولات <brand>") + `text-sm` product count + description.
- **Variant picker (product page):** `UButton color="neutral"` per variant — `solid` when selected, `outline` otherwise, `disabled` when out of stock; CTA reads "ابتدا گزینه را انتخاب کنید" while none is chosen. Gallery = `aspect-square` main image + `w-16 h-16 rounded-lg` thumbnails, active one `border-brand-500`.
- **Specs / pharmacy info:** specs in a `UCard :ui="{ body: 'p-0' }"` `dl` with `divide-y`, label `w-40 text-gray-500`; each info section (روش مصرف, هشدارها, عوارض, نگهداری, ترکیبات) is its own `UCard` with a `font-bold` title and `whitespace-pre-line` text (never `v-html`).
- **Reviews:** summary `UCard` — big `text-5xl font-black` average with 5 `text-yellow-400` stars and "از n نظر", beside five bars (`h-2 rounded-full bg-gray-100`, fill `bg-yellow-400`); rating filter chips are `UButton size="sm" color="neutral"` (`solid` active / `soft` idle); each review is a `UCard`. **Store reply / answer callout:** `rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4` with a `text-xs font-bold text-brand-600 dark:text-brand-400` label ("پاسخ فروشگاه"). Load more = `neutral soft` "نمایش … بیشتر".

### Header (`Header.vue`)
- Sticky, `bg-white/50 backdrop-blur-sm dark:bg-gray-900`, height `h-16 lg:h-20`.
- Logo: always use `components/BrandLogo.vue` (props `size`, `showName`, `textClass`, `forceDark`) — never inline the SVG. Mark = circle (`#2C7A7B` light / `#14B8A6` dark) with a 45°-rotated capsule: white half + `#9EDEDE` (brand-200) half. Wordmark = "کپسول" only (Persian, no Latin text) in `text-brand-500 dark:text-brand-400`, `font-black`. Static assets: `public/logo.svg`, `public/favicon.svg`, `public/seo/pwa-*.png`.
- Desktop nav items with optional dropdown menus (`UDropdownMenu`, `dir="rtl"`). Nav data lives in `navItems` (داروها, سلامت و تندرستی, محصولات سلامت, درباره ما).
- Actions: search (`HeaderSearch`: `w-10 h-10` icon → `rounded-2xl` panel `sm:w-96` with `shadow-xl`, `lg` input, up to 5 result rows `p-2 rounded-xl hover:bg-teal-50` with a `w-12 h-12 rounded-lg` thumbnail, then a `neutral soft block` CTA to `/medications`), cart (with count badge `bg-red-500` top-left), dark toggle, profile, "تماس با پشتیبانی" `UButton`.
- Mobile: hamburger → full-screen slide-down menu; cart → teleported dropdown.
- Hover convention: `hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950`.

### Cart dropdown / cart page (`cart.vue`)
- Free-shipping threshold: **500,000 تومان**; below it, shipping = **59,900 تومان**, else رایگان.
- Order summary card: subtotal, shipping, bold total in `text-brand-300` 2xl.
- Empty state: centered `i-heroicons-shopping-cart` (w-24, gray-300) + "سبد خرید شما خالی است" + CTA to `/medications`.

### Chatbot (`ChatbotWidget.vue`)
- Floating `UButton` bottom-right (`fixed bottom-8 right-8`); opens a `rounded-2xl` panel.
- Header bar `bg-brand-500 text-white`; user bubbles `bg-brand-500 text-white` (justify-start in RTL), bot bubbles `bg-white dark:bg-gray-800` (justify-end).
- Typing indicator: three `animate-bounce` dots.
- Supports product recommendation cards and suggested-action buttons inside messages.

### Panel / pharmacist (`panel.vue` + `layouts/panel.vue`)
- Desktop: `UCard` sidebar (logo, nav from `useUserPanelTabs().getMenuItems()`, quick links, logout in red).
- Active link: `!bg-teal-50 dark:!bg-teal-900/20 !text-teal-600 dark:!text-teal-400 font-medium`.
- Grouped sidebar: menu entries with a `group` (key of `GROUP_LABELS` in `utils/panelMenus.js`) get a heading `<p class="px-4 pt-4 pb-1 text-xs font-medium text-gray-400 dark:text-gray-500">` when the group changes, and a `my-3 border-t border-gray-200 dark:border-gray-700` divider between grouped and ungrouped entries.
- Profile banner with gradient avatar `from-teal-400 to-teal-600`, initials.
- Mobile: fixed bottom nav (home / products / profile) + slide-up profile sheet.
- Roles: customer / admin / owner (labels مشتری / مدیر / مالک).

### Captcha field (public forms)
- `components/CaptchaField.vue` (v-model `{captchaId, captchaAnswer}`): hidden unless the backend says a captcha is required; then the challenge image, a `dir="ltr"` answer `UInput` and a `ghost` refresh icon button. On a `captcha.*` error call `force()` + `reset()` and show «کد امنیتی نادرست است».
- Login/register/reset: the field sits in the step that sends the request (password, register, reset-password). On the OTP step it is resend-only: hidden until a resend fails with `captcha.*`, then opened by `openCaptcha()` and closed after a successful resend. Verify-OTP never shows it.

### Jalali date input (panel forms)
- Use `components/panel/JalaliDateInput.vue` for every date field (v-model is a Gregorian ISO string; the user types `۱۴۰۵/۰۱/۰۱`, Persian or Latin digits). `dir="ltr"` text input in a `UFormField`, error text `تاریخ نامعتبر` on blur/Enter, optional clear `ghost` icon button; `withTime` adds `HH:mm`. Never use `<input type="date">` (Gregorian only).

### Notifications (bell, inbox row, push opt-in)
- **Bell (`NotificationBell.vue`):** icon-only `UButton color="neutral" variant="ghost" square size="lg" icon="i-heroicons-bell"` (`w-10 h-10`) wrapped in `UChip color="error" size="md" inset`: a dot only when anything is unread, never a number. Opens a `UPopover` (`align: 'end'`), `w-80` panel with `dir="rtl" font-dana`: header row (`text-sm font-bold` title + `neutral soft xs` "خواندن همه"), `max-h-96` scrolling list, footer link `text-brand-500 dark:text-brand-400` "مشاهده همه اعلان‌ها".
- **Mobile nav badge:** a dot only (`UChip color="error" size="md" inset`, no text) around the `w-6` nav icon.
- **Inbox row (`NotificationItem.vue`):** type icon tile `rounded-xl` (`w-11 h-11` page / `w-9 h-9` bell) tinted by type: `bg-{token}/10 dark:bg-{token}/20 text-{token}` for success/warning/info/error, brand uses `bg-brand-50 dark:bg-brand-900/20 text-brand-500`. Unread = `font-semibold` title + `w-2 h-2 rounded-full bg-brand-500` dot; read = `font-medium text-gray-600 dark:text-gray-300`. Body is plain text (`whitespace-pre-line`, `line-clamp-2` in the bell). Time is relative ("۵ دقیقه پیش") via `utils/notificationMeta.js`.
- **Ticket with a new message (`pages/panel/tickets/index.vue`):** row gets `border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10` plus a `UBadge color="primary" variant="solid" size="xs"` "پیام جدید" after the status/priority badges.
- **Push opt-in (`PushPermissionCard.vue`):** standard panel card header strip + one row: state tile (`w-10 h-10 rounded-xl`) + title/description + action. "فعال‌سازی" is the page's one `primary` CTA. "غیرفعال‌سازی" is `neutral soft`. The blocked state has no button, only browser-settings instructions. Never prompt for permission on page load, only from that button.

### UInput
- Global `min-h-9` (36px) applied to `input.slots.root` in `app.config.ts` — all inputs are exactly 36px tall regardless of size variant.
- Variants: `outline` (default), `soft`, `subtle`, `ghost`, `none`. Use `variant="none"` for inputs embedded in bordered cells.
- Match skeleton input placeholders with `h-9 w-full rounded-lg`.

### USwitch
- Valid colors: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`. `color="teal"` is not valid.
- For brand teal with a visible unchecked track, use the `:ui` override (applied in `app.config.ts` or inline):
  ```html
  <USwitch size="lg" :ui="{
    base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
  }" />
  ```
- Always use `size="lg"` for panel toggle rows.

### USelectMenu (multi-select)
- For multi-value pickers (e.g. product categories/tags against admin API lookups), bind `v-model` directly to an array of primitive ids and use `:items="[{ label, value }]"` with `multiple` + `value-key="value"` — keeps the model a plain `string[]`/`number[]` instead of an array of full item objects.
- Pattern: `<USelectMenu v-model="form.categoryIds" :items="categoryMenuItems" multiple value-key="value" placeholder="..." class="w-full" />`.
- Populate `items` from the corresponding list endpoint on mount; fall back to an empty array on fetch failure rather than blocking the form.

### Star rating (reviews)
- Display: `UIcon` `i-heroicons-star-solid` / `i-heroicons-star` at `w-4 h-4` (lists) or `w-5 h-5` (summaries), `text-yellow-400 dark:text-yellow-300`.
- Picker: five icon-only `UButton color="neutral" variant="ghost" square` with `i-heroicons-star-solid` for picked stars and `i-heroicons-star` otherwise; the tint is a `:class` (`text-yellow-400` vs `text-gray-300 dark:text-gray-600`) and each button has an `aria-label` like «۳ ستاره». Sits inside `UFormField` so its error shows under the stars.
- A storefront block whose page already has a primary CTA (product page add-to-cart) submits with `color="neutral" variant="solid"`, so the view keeps one primary.

### UCard (panel pattern)
- Default body padding: `p-4 sm:p-6`. Remove for edge-to-edge rows: `:ui="{ body: 'p-0' }"`.
- Panel card structure: header strip (`flex items-center gap-2 px-4 sm:px-6 py-4 border-b`) with `w-4 h-4 text-brand-500` icon + `text-sm font-medium` title, then `divide-y divide-gray-100 dark:divide-gray-800` rows with `px-4 sm:px-6 py-4` each.
- RTL column divider between grid columns: `md:border-e` on the first-in-DOM (right-rendered) cell.

### Admin page header
Icon container (`w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20`) + `w-5 h-5 text-brand-500` icon, next to a two-tone title (`text-lg font-black` with one word in `text-brand-500`) and a muted `text-xs` subtitle. The single primary CTA (`UButton color="primary" size="lg"`) is flex-end of the same row. Row wraps on mobile with `flex-wrap gap-4`.

### Admin data table
Wrapped in `UCard :ui="{ body: 'p-0' }"` with `overflow-x-auto`. `<thead>` uses `bg-gray-50 dark:bg-gray-800/50 border-b` with `text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3 text-start`. `<tbody>` rows use `border-b border-gray-100 dark:divide-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors`. Expandable rows: sibling `<tr>` with colspan rendered immediately after the parent, background `bg-gray-50/50 dark:bg-gray-800/20`. Row actions via `UDropdownMenu` with ghost trigger button.

**Tables with only row actions (no page-level create):** the header's end slot holds a secondary action (`color="neutral" variant="soft" size="lg"`, e.g. "به‌روزرسانی") and the page has no primary button. The one primary is the submit button inside the row action's modal. Example: `/panel/inventory`.

**Quantity inputs:** use a text `UInput` with `inputmode="numeric" dir="ltr"`, not `type="number"`, which rejects digits from a Persian keyboard. Parse with `parseQuantity` (`utils/inventoryMeta.js`) and show limits through `UFormField`'s `help`/`error`.

**Photo picker (uploads):** `components/panel/returns/ReturnPhotosField.vue` (v-model `File[]`; the field itself uploads nothing). A `grid-cols-3 sm:grid-cols-5 gap-3` grid of `aspect-square rounded-xl` thumbnails, each with a remove button that is always visible (not hover-only, so it works on touch), and a dashed `border-2 border-dashed` add tile that is hidden at the limit. Overflow past the limit and rejected files show an inline `text-xs text-error` line under the grid. Accept only the formats the backend takes (JPG/PNG/WebP), with the backend's size cap. Thumbnails are object URLs, revoked on removal and on unmount.

### Metric card grid (admin)
`grid grid-cols-2 lg:grid-cols-4 gap-4`. Each `UCard :ui="{ body: 'p-4' }"` holds `flex items-center gap-3`: icon container (`w-10 h-10 rounded-xl`) + div with `text-xs text-gray-500` label above `text-xl font-black` value formatted with `.toLocaleString('fa-IR')`.

**Panel form modal / confirm:** `components/panel/PanelFormModal.vue` (title row with an optional `w-5 h-5 text-brand-500` icon, `form` body with `space-y-4 font-dana`, footer = `neutral soft` cancel + one `primary` submit; `width` `md|lg|2xl`; the submit button points at the form with `form=`, so Enter and the button share one path) and `components/panel/PanelConfirmDialog.vue` (message + optional note `UTextarea` labelled by `noteLabel`; `noteRequired` disables confirm while the note is blank; the note resets on each open). Both are `dismissible="!loading"`. Destructive confirms pass `confirmColor="error"`.

**Money input:** `components/panel/MoneyInput.vue` (v-model Number|null, `UFormField` label «… (ریال)», `UInput inputmode="numeric" dir="ltr"`). Staff screens only (CONV A: amounts are Rial, shown as sent). Persian or Latin digits and `,`/`٬` separators are accepted; bad text shows «فقط عدد» and emits null. The help line under the field is `formatMoney()` («۱٬۲۰۰٬۰۰۰ ریال»). Read the value through `utils/money.js` (`parseMoney`, `formatMoney`), never `.toLocaleString` on its own.

**Section tabs:** `components/panel/PanelSectionTabs.vue` (horizontal `NuxtLink` pills, route-driven active state; `exact` for an index tab). Active = `bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400`; inactive = `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`. Use it to switch sub-pages inside one panel section, not as a page title.

### Empty / loading / error states
- **Empty (cart/search):** centered large gray icon + bold heading + muted line + CTA.
- **Loading grid:** `USkeleton` ×12, `h-80 w-full`, in the product grid columns.
- **No results (`medications/index.vue`):** `i-heroicons-magnifying-glass` w-20 + "محصولی یافت نشد".
- **Failed load (panel lists):** never show a failed fetch as "nothing here". Use the empty-state layout with `i-heroicons-exclamation-triangle` and a `neutral soft` retry button, or `i-heroicons-lock-closed` and no button for a 403, and hide metrics that would read as zero.
- **Toast:** top-center, 3s, RTL (`app.config.ts`); use `color: 'success'` and `color: 'error'`. Never pass `'green'` or `'red'`.

### USkeleton
- Default animation overridden globally in `app.config.ts` to use `.skeleton-shimmer` (replaces `animate-pulse`).
- Shimmer defined in `assets/style/main.css`: moving gradient `4.5s linear infinite`, light `#f1f5f9 → #e8ecf1`, dark `#1e2533 → #242e40`.
- **Skeleton sizes to match real content:**
  | Element | Skeleton class |
  |---|---|
  | Icon (w-4/h-4) | `w-4 h-4 rounded` |
  | Icon cell (w-9/h-9) | `w-9 h-9 rounded-lg` |
  | Input label | `h-5 w-*` |
  | Input field | `h-9 w-full rounded-lg` |
  | Toggle/switch | `h-6 w-11 rounded-full` |
  | Badge | `h-5 w-* rounded-full` |
  | Button | `h-9 w-* rounded-lg` |
- **Transition (panel pages):** wrap skeleton + content in `<Transition name="sk">` (no mode) inside a `relative` div. `.sk-leave-active` gets `position: absolute; inset: 0` so the skeleton floats out while real content fades in — no layout shift.

---

## 7. Layout & navigation map

Routes (from `pages/`):

```
/                       Home (Hero, Categories, Featured, Popular, Chatbot)
/medications            Product listing (URL-driven search, filters, sort, pagination)
/medications/[id]       Product detail (gallery, variants, specs, related, reviews, Q&A)
/brands/[id]            Brand page
/near-expiry            Near-expiry goods (only when the store tracks expiry)
/cart                   Cart + order summary
/login                  Auth (phone → OTP → password / register / reset)
/about                  About
/account                Account
/panel                  → redirects to /panel/dashboard
/panel/dashboard        Pharmacist/customer dashboard
/panel/orders           Orders
/panel/profile          Profile
/panel/address          Addresses
/panel/users            Users (admin)
/panel/inventory        Stock list, adjust, transfer (staff)
```

Layouts: `default.vue` (storefront), `panel.vue` (dashboard shell), `auth.vue` (login).

---

## 8. Content & voice

- Persian, warm but precise. Tagline: **سلامتی شما، در درب منزل** (one word — "در درب منزل" — in brand color).
- Trust markers repeated: تایید سازمان غذا و دارو · پشتیبانی ۲۴/۷ · ارسال رایگان · ضمانت اصالت کالا.
- Always surface Rx requirements and dosage/usage clearly. Never hide warnings.
- Pharmacy license line in footer: "داروخانه مجاز - شماره پروانه: …".

---

## 9. Backend / config notes

- `runtimeConfig.public.BACKEND_URL` (ngrok dev) and `CMS_URL` (Strapi) in `nuxt.config.ts`.
- Product list: `app.$api.search.searchGoods({ data: GoodsSearchRequestDTO })` (`POST api/elastic/search`) — 0-based `page`, response at `response.data.data.content` with `totalElements` / `totalPages`; one hit per product (variants grouped).
- Auth token in `localStorage['auth.local']`; `$auth` plugin guards `/panel`.
- PWA enabled (`@vite-pwa/nuxt`): name "دارو پلاس", `theme_color: #2C7A7B`, standalone.

---

## 10. Quick adoption checklist for new screens

- [ ] Wrap page in `UContainer`, RTL inherited from `app.vue`.
- [ ] Use `font-black` for titles, two-tone with one `text-brand-500` word.
- [ ] Primary action = `UButton color="primary"`; only one per view.
- [ ] Prices via `.toLocaleString('fa-IR')` + ` تومان`.
- [ ] Stock/Rx/discount → use the badge color map above.
- [ ] Every surface gets a `dark:` counterpart (`bg-white dark:bg-gray-900`, `text-gray-900 dark:text-white`).
- [ ] Loading → `USkeleton` (shimmer, not pulse — configured globally); skeleton input placeholders use `h-9`, switches `h-6 w-11 rounded-full`; wrap in `<Transition name="sk">` with absolute leave for CLS-free swap.
- [ ] Toast colors: `'success'` / `'error'` / `'primary'` — never `'green'` / `'red'` / `'teal'`.
- [ ] Nuxt UI component colors: only `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral` are valid.
- [ ] Icons through `UIcon`, Heroicons first, sized `w-5` in buttons.
