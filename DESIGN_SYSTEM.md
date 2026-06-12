# دارو پلاس — Design System

> Single source of truth for the Daroo Plus online pharmacy. Values below are lifted verbatim from the codebase (`Ariaaghakhani/drug-store-update`) so this doc and the running app stay in sync.

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
- Discount badge: `color="error" variant="solid"` → `{n}٪ تخفیف`.
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

Wrapped in `UCard` with `group hover:shadow-xl transition-all duration-300 h-full flex flex-col`. Prop `product` shape:

```ts
interface Product {
  id: string | number
  nameFa: string            // primary display name
  nameEn?: string           // sub-label, LTR
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
  expiryDate?: string       // within 3 months → orange "نزدیک به انقضا"
}
```

Layout order (RTL): image (`aspect-square rounded-xl bg-gray-100`, cube placeholder) → brand+category row → `nameFa` (text-lg bold, line-clamp-2) → `nameEn` (xs gray) → rating → spacer → price block → fixed `min-h-[24px]` notice slot → block primary add-to-cart.

### Header (`Header.vue`)
- Sticky, `bg-white/50 backdrop-blur-sm dark:bg-gray-900`, height `h-16 lg:h-20`.
- Logo: inline SVG (two concentric circles) + "دارو پلاس" `font-black`. Outer circle fill `#2C7A7B` (light) / `#14B8A6` (dark), inner white at half radius.
- Desktop nav items with optional dropdown menus (`UDropdownMenu`, `dir="rtl"`). Nav data lives in `navItems` (داروها, سلامت و تندرستی, محصولات سلامت, درباره ما).
- Actions: search, cart (with count badge `bg-red-500` top-left), dark toggle, profile, "تماس با پشتیبانی" `UButton`.
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
- Profile banner with gradient avatar `from-teal-400 to-teal-600`, initials.
- Mobile: fixed bottom nav (home / products / profile) + slide-up profile sheet.
- Roles: customer / admin / owner (labels مشتری / مدیر / مالک).

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

### UCard (panel pattern)
- Default body padding: `p-4 sm:p-6`. Remove for edge-to-edge rows: `:ui="{ body: 'p-0' }"`.
- Panel card structure: header strip (`flex items-center gap-2 px-4 sm:px-6 py-4 border-b`) with `w-4 h-4 text-brand-500` icon + `text-sm font-medium` title, then `divide-y divide-gray-100 dark:divide-gray-800` rows with `px-4 sm:px-6 py-4` each.
- RTL column divider between grid columns: `md:border-e` on the first-in-DOM (right-rendered) cell.

### Empty / loading / error states
- **Empty (cart/search):** centered large gray icon + bold heading + muted line + CTA.
- **Loading grid:** `USkeleton` ×12, `h-80 w-full`, in the product grid columns.
- **No results (`medications/index.vue`):** `i-heroicons-magnifying-glass` w-20 + "محصولی یافت نشد".
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
/medications            Product listing (search, category filter, pagination)
/medications/[id]       Product detail
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
- Product list: `app.$api.products.fetchProductsList({ data: { page, rows } })` — 0-based page index, response at `response.data.data.content` with `totalElements` / `totalPages`.
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
