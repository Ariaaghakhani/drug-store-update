# Daro Plus — Claude Code Instructions

## Project overview

Online pharmacy storefront + pharmacist panel built with **Nuxt 3**, **@nuxt/ui v3**, **Tailwind CSS v4**, **Pinia**, and **@vite-pwa/nuxt**. Always follow `DESIGN_SYSTEM.md` for visual rules. This file covers code behavior and conventions.

---

## Design system

**Always read `DESIGN_SYSTEM.md` before implementing any UI.**

When you encounter a pattern not covered there:
1. Implement it using the closest matching existing rule
2. Add the new rule to `DESIGN_SYSTEM.md` under the relevant section
3. Mention what you added at the end of your response

---

## Stack & versions

- **Nuxt 3** (latest)
- **@nuxt/ui v3** — UButton, UCard, UInput, UBadge, UModal, USkeleton, UIcon, USwitch, UDropdownMenu, UPagination, UContainer
- **Tailwind CSS v4** — use logical properties (`ms-`, `me-`, `ps-`, `pe-`) instead of `ml-`/`mr-`/`pl-`/`pr-` for RTL correctness. Every `--color-*` token defined in `@theme static` automatically becomes a first-class utility (`text-error`, `ring-error/25`, `bg-success`, etc.) — never use `[var(--color-*)]` when a named class exists.
- **Pinia** for state management
- **@vite-pwa/nuxt** for PWA

---

## Vue/Nuxt conventions

- Always use `<script setup lang="ts">` — never Options API
- Composition API only (`ref`, `computed`, `watch`, `onMounted`, etc.)
- TypeScript for all props, emits, and composable return types
- Define props with `defineProps<{}>()` and emits with `defineEmits<{}>()`
- Composables go in `composables/`, named `useXxx.ts`
- Server-only logic goes in `server/` — never import server code in components
- Use `useFetch` / `useAsyncData` for data fetching in pages
- Avoid `process.env` — use `import.meta.env` or `useRuntimeConfig()`

---

## RTL & internationalization

- The app is **RTL-first** (`dir="rtl"`, `lang="fa"` on root)
- Use Tailwind logical properties everywhere: `ms-`, `me-`, `ps-`, `pe-`, `border-s`, `border-e`, `rounded-s-`, `rounded-e-`, `start-`, `end-`
- Persian is the **default locale**; English is secondary
- All customer-facing numbers → `Intl.NumberFormat('fa-IR')` or `.toLocaleString('fa-IR')` → Persian digits with `٬` separator
- Price format: `۱۲۹٬۰۰۰ تومان` (number first, unit after)
- Never hardcode Arabic-Indic digits — always use the formatter

---

## Nuxt UI rules (critical)

**Valid color names:** `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`

**Never pass raw Tailwind colors** (`'red'`, `'green'`, `'gray'`, `'teal'`, `'blue'`, etc.) to any Nuxt UI component prop — they silently produce unstyled output.

Quick mapping:
- success states → `color="success"`
- error / destructive / out-of-stock → `color="error"`
- warning / prescription / caution → `color="warning"`
- informational → `color="info"`
- muted / secondary → `color="neutral"`
- brand CTA → `color="primary"`

Toast: always `color: 'success'` or `color: 'error'` — never `'green'` / `'red'`.

---

## Component patterns

### Buttons
- One `color="primary"` CTA per view
- Secondary → `color="neutral" variant="outline"`
- Destructive → `color="error" variant="outline"` or `variant="soft"`
- Icon-only → `variant="ghost" square icon="…"`
- Full-width → add `block`

### Skeleton / loading
- Use `USkeleton` with shimmer (configured globally — do not add `animate-pulse`)
- Match skeleton size exactly to real element (`h-9` for inputs, `h-6 w-11 rounded-full` for switches)
- Wrap skeleton + content in `<Transition name="sk">` inside a `relative` div; `.sk-leave-active` uses `position: absolute; inset: 0` to prevent layout shift

### Dark mode
- Every surface needs a `dark:` counterpart
- Page bg: `bg-gray-50 dark:bg-gray-900`
- Card: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Muted: `text-gray-500 dark:text-gray-400`
- Brand accent in dark: `dark:text-brand-400` (not brand-500)

### Icons
- Always via `<UIcon name="…" />`
- Heroicons first (`i-heroicons-*`), MDI second (`mdi:*`)
- Sizes: `w-4` inline · `w-5` in buttons · `w-6` in nav · `w-8`+ for features
- Color via Tailwind text utilities (`text-brand-500`, `dark:text-brand-400`)

---

## New screen checklist

Before considering a screen done, verify:

- [ ] Wrapped in `UContainer`; RTL inherited — no manual `dir` needed
- [ ] Page title uses `font-black`; one key word in `text-brand-500`
- [ ] Single primary `UButton color="primary"` CTA
- [ ] All prices use `.toLocaleString('fa-IR')` + ` تومان`
- [ ] All Nuxt UI color props use valid token names only
- [ ] Every `bg-*` / `text-*` / `border-*` has a `dark:` variant
- [ ] Loading state uses `USkeleton` shimmer, not `animate-pulse`
- [ ] Skeleton transition uses `<Transition name="sk">` with absolute leave
- [ ] Spacing uses logical properties (`ms-`, `ps-`, `border-e`, etc.)
- [ ] Icons sized and colored correctly
- [ ] Empty state: large gray icon + bold heading + muted line + CTA

---

## File structure

```
assets/
  fonts/          ← Dana font files (do not move)
  style/
    main.css      ← @theme static color tokens + shimmer keyframes
    fonts.css     ← @font-face declarations
components/
composables/
layouts/
  default.vue     ← storefront
  panel.vue       ← pharmacist/admin shell
  auth.vue        ← login
pages/
  panel/          ← guarded by $auth plugin
stores/           ← Pinia stores
server/
app.vue           ← root: font-dana + dir="rtl" wrapper
app.config.ts     ← Nuxt UI overrides (toast RTL, modal slots, input min-h)
nuxt.config.ts    ← runtimeConfig, PWA, i18n
DESIGN_SYSTEM.md  ← visual source of truth ← always read before building UI
```

---

## What NOT to do

- No Options API, no `export default { … }`
- No `process.env` — use `import.meta.env` or `useRuntimeConfig()`
- No raw Tailwind color names in Nuxt UI props
- No `animate-pulse` on skeletons (shimmer is global)
- No `ml-` / `mr-` / `pl-` / `pr-` — use logical equivalents
- No inline styles for spacing/color — use Tailwind utilities
- No arbitrary Tailwind values (`[...]`) when a named utility or scale step exists — check spacing (`p-4` not `p-[16px]`), sizing (`w-5` not `w-[20px]`), colors, radii, etc. before reaching for brackets
- No hardcoded Latin digits in customer-facing text
- No `color="teal"` on `USwitch` — use the `:ui` override pattern from `DESIGN_SYSTEM.md`
