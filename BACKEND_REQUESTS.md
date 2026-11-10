# Backend requests from the storefront landing work

Frontend branch: `feature/landing-apis` (home, search/listing, product page). Date: 2026-11-02.
Checked against the backend source in `PouyanPlatform` (`PublicEndpoints`, `CategoryController`, `StorefrontBrandServiceImpl`).

**خلاصه به فارسی:** یک مورد لازم است (دسته‌بندی‌ها برای مهمان باز نیست) و یک مورد برای بررسی داده (برندها فقط وقتی
برمی‌گردند که حداقل یک کالای فعال برند داشته باشد).

---

## 1. ~~REQUIRED — make the category tree public~~ — RESOLVED 2026-11-04 (BACK #470, `GET /api/categories/tree` is public)

_Kept below for the nice-to-have asks (`goodsCount`/`withGoodsOnly`, category icon). The original problem text follows._

**Problem.** The home page category row and the category filter on `/medications` have nothing to show: a guest calling
`GET /api/categories/tree` gets **401**. `PublicEndpoints` has no entry for `/api/categories*`
(only `/api/blog/categories`). This is the "Known gap" in `FRONTEND_FEATURES_BY_USER.md`.

**Ask.** Add these two reads to `PublicEndpoints` (GET only; create/update/delete stay protected):

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/categories/tree?scope=PRODUCT` | tree of root categories with nested `children` |
| `GET` | `/api/categories?scope=PRODUCT` | flat list (optional, same data) |

- Tenant comes from `X-Tenant` / `Origin`, like the other public store reads.
- Only active, non-deleted categories.
- The frontend sends `scope=PRODUCT` (the scope name the panel product forms already use). Please confirm that is the
  scope for goods categories; blog categories must not leak into this tree.

**Fields the frontend reads** (the existing `CategoryDTO` is enough): `id`, `name`, `parentId`, `level`, `code`,
`sortOrder`, `children[]`. The frontend uses `id` for `categoryId` in `POST /api/elastic/search` (which already includes
subcategories — thanks) and `name` for the label.

**Nice to have (not blocking):**
- `goodsCount` per category and a `withGoodsOnly=true` flag (default true), like `GET /api/storefront/brands`, so empty
  categories are not shown on the home page.
- An icon/image URL per category (attachment `referenceType=Category`, primary image, same as the brand logo). Today
  the frontend guesses an icon from the Persian name.

**Done when:** `curl -H "Origin: <store origin>" https://<backend>/api/categories/tree?scope=PRODUCT` returns `200`
with the tree and no `Authorization` header. No frontend change is needed afterwards — the home row and the filter
turn on by themselves (they hide on 401/403).

---

## 2. CHECK — "popular brands" strip is empty

**What the frontend does.** `GET /api/storefront/brands?limit=12` (public, already in `PublicEndpoints`). The strip
shows the result; an empty array hides the strip, an error shows a "تلاش دوباره" line.

**Why it can be empty even though the code is correct.** `StorefrontBrandServiceImpl.list` returns only brands that:

1. are `Catalog` rows of type `BRAND` and not the default ("no brand") row, **and**
2. have at least one product in the **current tenant** that is active, not deleted, top-level (`parent IS NULL`) and
   has `brand` set (`GoodsRepository.countProductsByBrand`).

So it is empty when no goods have a brand assigned (the goods form must send `brandId`), or when the request resolves
to a different tenant than the one holding the data (no `X-Tenant`, and `Origin` is shared by several stores or is a
platform origin → `SYSTEM`, see `TenantResolver.resolveAnonymous`).

**Please verify, for the dev store being used** (table/column names are illustrative, taken from the JPA queries — adjust
to the real schema):

```sql
SELECT g.brand_id, c.title, COUNT(*) AS products
FROM goods g JOIN catalog c ON c.id = g.brand_id
WHERE g.tenant_id = '<tenant>' AND g.is_deleted = false AND g.is_active = true AND g.parent_id IS NULL
GROUP BY g.brand_id, c.title;
```

```
curl -H "X-Tenant: <tenant>" -H "Origin: <store origin>" "https://<backend>/api/storefront/brands?limit=12"
```

- Query returns rows but the API returns `[]` → tenant resolution (add the `X-Tenant` header on the frontend or register
  the origin for exactly one store) — tell us which.
- Query returns no rows → the products have no brand; assign brands to the goods.
- API returns brands but `logoUrl` is `null` → upload a `Brand` attachment (primary); the tile then falls back to an icon.

No code change on the backend is expected for this item unless the check shows a bug.

---

## Already confirmed fine (no action)

- `/api/storefront/home`, `/api/storefront/brands[/{id}]`, `/api/storefront/goods/near-expiry`,
  `/api/storefront/goods/{id}/related`, `/api/elastic/search[/facets]`, `/api/reviews/goods/*`,
  `/api/questions/goods/*`, `/api/store-profile` are public and the DTOs match what the frontend reads.
- Attachment/logo URLs are absolute (`serverUrl` prefix), so images load from the frontend origin without a proxy.
