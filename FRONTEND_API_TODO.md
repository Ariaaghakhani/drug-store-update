# Frontend/API Contract Gaps

## No stock/availability field on simple-product GoodsDTO
- Status: missing
- Needed by: pages/medications/[id].vue
- Endpoint: POST /api/goods/get (proposed addition to existing response)
- Request: `{ id: number }` (unchanged)
- Expected response: `GoodsDTO` with an added nullable `inStock: boolean` or `availableQuantity: number | null` field for simple (non-variant) products, so the product detail page can show availability without guessing.
- Current behavior: `GoodsDTO` (`product/dto/GoodsDTO.java`) has no stock/quantity field at all. Stock only exists on `GoodsVariantDTO.availableQuantity` (`product/dto/GoodsVariantDTO.java`), which only applies to variant products (`isModel`/`variants`), not simple goods. Confirmed by reading both DTOs in `PouyanPlatform` BACK source.
- Why: customers need to know if a simple (non-variant) product is in stock before adding it to cart; today the detail page cannot show this and must omit the UI rather than fabricate it.
- Date: 2026-10-06
