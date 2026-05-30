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

Defined in `assets/style/main.css` under `@theme static`. Available as Tailwind utilities (`bg-brand-500`, `text-brand-600`, etc.).

### Brand (primary, with shades)

| Token | Hex | Typical use |
|---|---|---|
| `--color-brand-50`  | `#e7f7f7` | tints, hover backgrounds (`bg-brand-50`) |
| `--color-brand-100` | `#c3ebeb` | category circles, soft fills |
| `--color-brand-200` | `#9edede` | |
| `--color-brand-300` | `#79d2d2` | gradient stops, accent text on dark |
| `--color-brand-400` | `#5cbcbc` | dark-mode accent text (`dark:text-brand-400`) |
| `--color-brand-500` | `#2c7a7b` | **primary** — buttons, links, logo, icons |
| `--color-brand-600` | `#256b6b` | hover state for primary |
| `--color-brand-700` | `#1f5c5c` | active/pressed |
| `--color-brand-800` | `#194d4d` | |
| `--color-brand-900` | `#133e3e` | deepest brand |

PWA `theme_color` = `#2C7A7B` (= brand-500). In **dark mode the logo fill switches to `#14B8A6`** (Tailwind teal-500).

### Semantic (single tone, no shades)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--color-success` | `#22c55e` | `#4ade80` | in-stock, confirmed, success toast |
| `--color-info`    | `#3b82f6` | `#60a5fa` | informational notices (min-order qty) |
| `--color-warning` | `#f59e0b` | `#fcd34d` | caution, near-expiry, prescription flag |
| `--color-danger`  | `#ef4444` | `#fca5a5` | out-of-stock, destructive, discount badge |
| `--color-secondary` | `#6b7280` | `#9ca3af` | muted/neutral UI |

### Neutrals (backgrounds & text)

`--color-neutral-50..900`: `#fafafa #f5f5f5 #e5e5e5 #d4d4d4 #a3a3a3 #737373 #525252 #404040 #262626 #171717`

> The app also uses Tailwind's stock `gray-*` for surfaces (e.g. `bg-gray-50`, `dark:bg-gray-900`, `dark:bg-gray-950`). Treat `gray-*` and `neutral-*` as interchangeable greys.

### Semantic surface roles (recommended additions)

These aren't yet in `main.css` but encode the patterns the components already follow — add them to keep usage consistent:

| Role | Light | Dark |
|---|---|---|
| `bg` (page) | `#fafafa` | `#0a0a0a` |
| `surface` (card) | `#ffffff` | `#171717` |
| `surface-2` (subtle) | `#f5f5f5` | `#262626` |
| `border` | `#e5e5e5` | `#262626` |
| `text` | `#171717` | `#fafafa` |
| `text-muted` | `#525252` | `#a3a3a3` |
| `primary` | `#2c7a7b` | `#14b8a6` |

---

## 3. Typography

Font family **Dana**, self-hosted from `assets/fonts/` via `assets/style/fonts.css`. Utility class `.font-dana` (`font-family: 'Dana', sans-serif`). Applied globally on `<div class="font-dana" dir="rtl">` in `app.vue`.

### Weights available

| Weight | File | Tailwind |
|---|---|---|
| 100 | Dana-Thin.ttf | `font-thin` |
| 300 | Dana-Light.ttf | `font-light` |
| 400 | Dana-Regular.ttf | `font-normal` |
| 500 | Dana-Medium.ttf | `font-medium` |
| 600 | Dana-DemiBold.ttf | `font-semibold` |
| 700 | Dana-Bold.ttf | `font-bold` |
| 800 | Dana-ExtraBold.ttf | `font-extrabold` |
| 900 | Dana-Black.ttf | `font-black` |

(Also shipped: Dana-Hairline, Dana-UltraLight for weights 100/200.)

### Scale (as used in pages/components)

| Role | Tailwind classes | Notes |
|---|---|---|
| Display / page H1 | `text-4xl lg:text-5xl xl:text-7xl font-black` | hero, page titles |
| Section H2 | `text-3xl lg:text-4xl font-black` | "محصولات ویژه" etc. |
| Card title H3 | `text-lg font-bold` | product name |
| Body | `text-base` (16px) | inputs forced to 16px to avoid iOS zoom |
| Small | `text-sm` | meta, captions |
| Tiny | `text-xs` | brand/category row, timestamps |

Headings frequently use a 2-tone treatment: black text with one word in `text-brand-500`, e.g. `محصولات <span class="text-brand-500">ویژه</span>`.

### Numbers

Always format with `Intl.NumberFormat('fa-IR')` / `.toLocaleString('fa-IR')` for customer-facing prices and counts → Persian digits with the `٬` thousands separator. Unit word follows the number: `۱۲۹٬۰۰۰ تومان`.

---

## 4. Spacing, radius, shadow

Tailwind defaults (4px base). Observed conventions:

- **Container:** `UContainer` (Nuxt UI) for page width; section padding `py-12` / `py-16`.
- **Card padding:** `UCard` default; inner stacks use `space-y-3` / `space-y-4`.
- **Radius:** `rounded-lg` (controls, ~8px), `rounded-xl` (cards/images, ~12px), `rounded-2xl`/`rounded-3xl` (hero panels, chat window), `rounded-full` (badges, category circles, avatars, icon buttons).
- **Shadow:** `shadow-lg` / `shadow-2xl` for floating elements (cart dropdown, chat, modals); cards lift on hover `hover:shadow-xl transition-all duration-300`.
- **Icon hit targets:** header/action buttons are `w-10 h-10` (40px); mobile bottom-nav items ≥ 44px tall.

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
- **Primary:** `color="primary"` (= brand). Default CTA. Sizes used: `size="xl"` for main actions, `size="lg"` filters, `size="sm"` inline.
- **Outline/white:** `color="neutral" variant="outline"` for secondary actions.
- **Soft:** `variant="soft"` (e.g. "پیگیری سفارش").
- **Ghost:** `variant="ghost"` for icon-only and tertiary. Invisible at rest — avoid for actions that must always be visible; use `outline` or `soft` instead.
- **Danger:** `color="error" variant="outline"` or `variant="soft"` for destructive actions.
- **Square icon:** `square icon="…"` for +/- quantity, send, close.
- **Block:** `block` for full-width (add-to-cart, checkout).
- One primary per view. Disabled add-to-cart flips label to "اطلاع‌رسانی موجودی".

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
- [ ] Loading → `USkeleton`; empty → centered icon + heading + CTA.
- [ ] Icons through `UIcon`, Heroicons first, sized `w-5` in buttons.
