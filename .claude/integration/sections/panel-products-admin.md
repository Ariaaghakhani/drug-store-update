# Section: panel-products-admin

Branch: `feat/api-3-panel-products-admin`

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md` (products sub-section), `pages/panel/CLAUDE.md`
- `shared.md`

## Endpoints
`product/controller/{GoodsController,TagController,ProductBatchController}.java`, `catalog/controller/CategoryController.java`:
- Goods CRUD — `services/api/goods.js`'s `createGoods`/`updateGoods`/`getGoods`/`deleteGoods` already match BACK (`POST /api/goods/{create,update,get,delete}`) — no fix needed there.
- List/filter for the admin table: prefer `POST /api/goods/filter` (`GoodsFilterRequestDTO { nameFa, nameEn, brandId, categoryIds, tagIds, warehouseId, active, goodCode, sortType, page, size }`) over `listGoods`'s `FilterablePage` body — its fields line up directly with `ProductsFilters.vue`'s search+category inputs.
- Tags — `TagController` base `/api/tags`: `GET /api/tags` (list, no body), `POST /api/tags/get-by-id` `{id}`, `POST /api/tags` (create, root path, raw `TagDTO`), `POST /api/tags/update` body `{id, tagDTO}` (**nested**), `POST /api/tags/delete` `{id}`.
- Product batches — `ProductBatchController` base `/api/product-batches`: `POST /api/product-batches` (create, body `{dto}`), `PUT /api/product-batches` (**PUT**, body `{id, dto}`), `GET /api/product-batches` (list all), `POST .../by-goods`, `.../by-supplier`, `.../delete` (`{id}`).
- Categories — `CategoryController` base `/api/categories`: `GET /api/categories?scope=...` (list), `POST .../get` `{id}`, `POST /api/categories` (create, root), `POST .../update` (raw `CategoryDTO`), `POST .../delete` `{id}`, `POST .../children` `{parentId}`, `GET .../tree?scope=...`.

## FRONT files to touch
- `services/api/goods.js` — `getTags` (wrong, hits nonexistent `/list`), `createTag` (wrong path, missing `/create` should be root), `updateTag` (needs nested `{id, tagDTO}` body), `getProductBatches` (wrong, no `/list`), `createProductBatch`/`updateProductBatch` (wrong path, and update must become `PUT` with `{id, dto}`).
- `services/api/catalog.js` — `listCategories` (wrong, should be `GET` not `POST .../list`), `createCategory` (likely wrong `/create` suffix vs. root `POST`). Verify `category-scopes` functions too — no `CategoryScopeController` was found during discovery; treat as unverified/possibly dead code, confirm before relying on it.
- `stores/products.js` / `pages/panel/products/{index,new,[id]}.vue` — currently fully mocked via this Pinia store; replace with real `goods.js`/`catalog.js` calls. Field-mapping needed: `category` (single string) → BACK's `categoryIds`/`categoryTitles` (multi-select by id); `inStock` boolean has no direct GoodsDTO equivalent (see product-detail-page section); `images: string[]` → `attachments: AttachmentDTO[]`; tags/brand/unit (`tagIds`/`brandId`/`unitId`) have no current form fields at all — new UI needed, not just a rename.
- `components/panel/products/ProductImagesField.vue` — currently builds `FileReader` data-URL strings; will need to switch to an attachment-upload flow if wiring to real `attachments`.

## Acceptance criteria
- Admin product list loads from `POST /api/goods/filter`, paginated correctly (`page`/`size`, not `pageNumber`/`hasNext`).
- Create/edit product form sends real `categoryIds`, saves successfully, and the new/edited product round-trips on reload.
- Tag and category dropdowns in the form are populated from the corrected endpoints.

## Known gaps
- Stock/availability concept absent from `GoodsDTO` for simple products — same caveat as `product-detail-page`; don't invent a field, ask/flag if the admin form needs to show or edit it.
