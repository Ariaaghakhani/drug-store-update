# Section: product-detail-page

Branch: `feat/api-2-product-detail-page`

## Module docs to read
- `services/api/CLAUDE.md`, `pages/CLAUDE.md` (medications section)
- `shared.md` (envelope asymmetry)

## Endpoints
- POST `/api/goods/get` body `{id}` → `ApiResponse<GoodsDTO>` — `product/controller/GoodsController.java`. `services/api/goods.js::getGoods` already calls this correctly (method + path match) — this task is new page code, not an API fix.

`GoodsDTO` fields relevant to a detail page: `id, goodCode, nameFa, nameEn, description, price, purchasePrice, holdCost, minOrderQuantity, barcode, isPrescriptionRequired, brandId, brandTitle, unitId, unitTitle, categoryIds, categoryTitles, expiryDate, viewsCount, rating, tagIds, tagNames, discountPercent, taxRate, attachments (AttachmentDTO[]), isModel, parentId, variants (GoodsVariantDTO[]), attributes`.

## FRONT files to touch
- `pages/medications/[id].vue` — currently an unimplemented stub (echoes `$route.params.id` only). Add `$api.goods.getGoods({ id: route.params.id })`, unwrap `response.data.data`, render.
- Note: no flat `images: string[]` or `inStock` boolean on `GoodsDTO` — images come from `attachments` (need URL extraction), and stock/availability isn't on this DTO at all (lives on `GoodsVariantDTO.availableQuantity` for variant products, or batch quantities otherwise — confirm with backend if a simple non-variant product exposes stock anywhere before assuming "always in stock").

## Acceptance criteria
- Visiting `/medications/:id` for a real goods id renders real product data (name, price, description, prescription flag).
- Handles a not-found id gracefully (BACK 404/error → a "not found" UI state, not a crash).
- Add-to-cart on this page uses the same `useCartStore().addItem()` pattern as `medications/index.vue`.

## Known gaps
- Stock/availability display may not be possible for all products without a follow-up question to backend about non-variant stock — if blocked, mark that sub-item `[!]` and note it in the section's "Runtime tests" rather than guessing a shape.
