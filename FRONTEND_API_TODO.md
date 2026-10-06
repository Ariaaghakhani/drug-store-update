# Frontend API TODO

Gaps found while wiring `pages/panel/products/*` to real `services/api/goods.js` / `catalog.js` endpoints (Phase 3, admin products). Each entry is something that couldn't be cleanly wired without inventing a backend contract.

## Stock availability (inStock) for simple goods
- Status: missing
- Needed by: pages/panel/products/{index,new,[id]}.vue, components/panel/products/ProductsTable.vue
- Endpoint: none today — `GoodsDTO` (`product/dto/GoodsDTO.java`) has no boolean/quantity stock field; actual stock lives in the separate Inventory domain (`services/api/inventory.js`, per-warehouse rows), not on the goods record itself.
- Request: n/a
- Expected response: ideally `GoodsDTO` gaining a derived field like `inStock: boolean | null` (aggregated across warehouses) or the admin product list joining `inventory.js::listInventory` per goods id.
- Current behavior: `GoodsController`/`GoodsServiceImpl` return no stock info; `ProductBatchDTO`/`InventoryDTO` exist but are keyed by goods/warehouse, not summarized per-good.
- Why: admin product table previously showed a mocked "موجود/ناموجود" badge; without a real field we now render a neutral "نامشخص" badge instead of fabricating true/false.
- Date: 2026-10-06

## Product image / attachment upload
- Status: needs-change
- Needed by: pages/panel/products/{new,[id]}.vue, components/panel/products/ProductImagesField.vue
- Endpoint: proposed `POST /api/attachments/upload` (multipart) — `services/api/attachment.js::uploadAttachment` is scaffolded but unverified against `AttachmentController` in this task.
- Request: multipart file + `{ referenceType: 'GOODS', referenceId: <goodsId> }` (per `GoodsAttachmentOwner.REFERENCE_TYPE` used server-side in `GoodsServiceImpl`).
- Expected response: `AttachmentDTO` (id, url, etc.) to push into `GoodsDTO.attachments`.
- Current behavior: `GoodsDTO.attachments` is a `List<AttachmentDTO>` populated server-side from `AttachmentService.findByReference`; it is not accepted as raw data on create/update, and `ProductImagesField.vue` only produces local `FileReader` data-URLs with no id.
- Why: kept `ProductImagesField.vue`'s existing data-URL picker for UI continuity but stopped sending `images` to `createGoods`/`updateGoods` (BACK doesn't expect it there) rather than guessing an upload flow.
- Date: 2026-10-06

## Brand selection (brandId) for product form
- Status: mismatch
- Needed by: pages/panel/products/{new,[id]}.vue
- Endpoint: likely `GET /api/catalogs?type=BRAND` or `POST /api/catalogs/by-type` (`CatalogController`, base `/api/catalogs` — not one of this task's reviewed controllers, so paths are unverified).
- Request: `{ type: 'BRAND' }` for by-type lookup.
- Expected response: `CatalogDTO[]` to populate a brand `USelectMenu` bound to `GoodsDTO.brandId`.
- Current behavior: `GoodsDTO.brandTitle` is a read-only denormalized display field (`GoodsReferenceResolver.applyBrandAndUnit` only ever reads `brandId`, via `catalogService.getEntity(brandId, CatalogTypes.BRAND)`); a free-text brand name sent from the form is silently ignored on create/update.
- Why: form kept the free-text "برند" input for continuity, but it is now cosmetic only — selecting/persisting a real brand needs a `CatalogDTO` (type `BRAND`) picker wired against `catalog.js`'s `listCatalogs`/`getCatalog`, whose paths (`api/catalog/*`) do not match `CatalogController`'s real base path (`/api/catalogs`) and were out of this task's scope to fix.
- Date: 2026-10-06

## CategoryScope update/delete
- Status: missing
- Needed by: services/api/catalog.js (`updateCategoryScope`, `deleteCategoryScope`)
- Endpoint: none — `CategoryScopeController` (`catalog/controller/CategoryScopeController.java`) only exposes `GET /api/category-scopes`, `POST /api/category-scopes/get`, `POST /api/category-scopes/create`. No update/delete mapping exists.
- Request: n/a
- Expected response: n/a
- Current behavior: `catalog.js`'s `updateCategoryScope`/`deleteCategoryScope` still point at `api/category-scopes/update`/`.../delete`, which 404 on BACK; left unchanged since no real endpoint exists to fix them against (not currently called by any page).
- Why: flagging instead of guessing a path that doesn't exist server-side.
- Date: 2026-10-06
