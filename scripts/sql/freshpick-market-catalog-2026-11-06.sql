-- FreshPick reviewed catalogue staging import, PostgreSQL 13+ / Supabase.
-- Based on FreshPick PR #150 (data/market-catalog-2026-11-05.json).
-- Existing products, orders, accounts, suppliers, and existing categories stay unchanged.
-- New products are archived and zero-stock, so they WILL NOT appear in public MCP searches.
-- Reference prices (LKR) are THIRD-PARTY market observations, not approved FreshPick retail prices.
-- Back up your database, verify you are in the correct project, then run the whole script.

BEGIN;

-- Missing categories only. Existing rows are never modified.
INSERT INTO "categories"
  ("id", "name", "slug", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Fresh Produce', 'fresh-produce', 'Vegetables, fruits and seasonal essentials.', true, 1, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pantry Staples', 'pantry-staples', 'Rice, grains, spices and pantry basics.', true, 5, NOW(), NOW()),
  (gen_random_uuid()::text, 'Dairy & Eggs', 'dairy-eggs', 'Milk, dairy products and eggs.', true, 2, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Import product references. Stable FP-MKT-* SKUs let this script run repeatedly.
WITH catalog AS (
  SELECT *
  FROM jsonb_to_recordset($freshpick_catalog$
[
  {
    "sku": "FP-MKT-CARROT-1KG",
    "name": "Carrots (1 kg)",
    "slug": "fp-market-carrot-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 520,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-TOMATO-1KG",
    "name": "Tomatoes (1 kg)",
    "slug": "fp-market-tomato-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 840,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-CABBAGE-1KG",
    "name": "Cabbage (1 kg)",
    "slug": "fp-market-cabbage-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 790,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-BEETROOT-1KG",
    "name": "Beetroot (1 kg)",
    "slug": "fp-market-beetroot-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 670,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-BRINJAL-1KG",
    "name": "Brinjal (1 kg)",
    "slug": "fp-market-brinjal-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 640,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-CUCUMBER-1KG",
    "name": "Cucumber (1 kg)",
    "slug": "fp-market-cucumber-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 300,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-GREEN-BEANS-1KG",
    "name": "Green Beans (1 kg)",
    "slug": "fp-market-green-beans-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 912,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-LEEKS-1KG",
    "name": "Leeks (1 kg)",
    "slug": "fp-market-leeks-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 440,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-PUMPKIN-1KG",
    "name": "Pumpkin (1 kg)",
    "slug": "fp-market-pumpkin-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 268,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-POTATOES-1KG",
    "name": "Potatoes (1 kg)",
    "slug": "fp-market-potatoes-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 334,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-BIG-ONION-1KG",
    "name": "Big Onions (1 kg)",
    "slug": "fp-market-big-onion-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 460,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-GARLIC-1KG",
    "name": "Garlic (1 kg)",
    "slug": "fp-market-garlic-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 940,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-GREEN-CHILLI-1KG",
    "name": "Green Chillies (1 kg)",
    "slug": "fp-market-green-chilli-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 640,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-GINGER-1KG",
    "name": "Ginger (1 kg)",
    "slug": "fp-market-ginger-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 620,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-BITTER-GOURD-1KG",
    "name": "Bitter Gourd (1 kg)",
    "slug": "fp-market-bitter-gourd-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 740,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-CAULIFLOWER-1KG",
    "name": "Cauliflower (1 kg)",
    "slug": "fp-market-cauliflower-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 940,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-CAPSICUM-1KG",
    "name": "Capsicum (1 kg)",
    "slug": "fp-market-capsicum-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 1050,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-SNAKE-GOURD-1KG",
    "name": "Snake Gourd (1 kg)",
    "slug": "fp-market-snake-gourd-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 460,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-SWEET-POTATO-1KG",
    "name": "Sweet Potatoes (1 kg)",
    "slug": "fp-market-sweet-potato-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 180,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-ASH-PLANTAIN-1KG",
    "name": "Ash Plantains (1 kg)",
    "slug": "fp-market-ash-plantain-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 270,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-LONG-BEANS-1KG",
    "name": "Long Beans (1 kg)",
    "slug": "fp-market-long-beans-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 460,
    "market": "Cargills Food City",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 kg",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-COCONUT-EACH",
    "name": "Coconut (each)",
    "slug": "fp-market-coconut-each",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 185,
    "market": "Keells",
    "observedOn": "2026-11-05",
    "sourceUrl": "https://www.welandapola.com/",
    "pack": "1 each",
    "tags": [
      "vegetable"
    ]
  },
  {
    "sku": "FP-MKT-BANANA-AMBUL-1KG",
    "name": "Ambul Bananas (1 kg)",
    "slug": "fp-market-banana-ambul-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 200,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-BANANA-SEENI-1KG",
    "name": "Seeni Bananas (1 kg)",
    "slug": "fp-market-banana-seeni-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 250,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-BANANA-KOLIKUTTU-1KG",
    "name": "Kolikuttu Bananas (1 kg)",
    "slug": "fp-market-banana-kolikuttu-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 490,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-AVOCADO-1KG",
    "name": "Avocados (1 kg)",
    "slug": "fp-market-avocado-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 490,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-GUAVA-1KG",
    "name": "Guava (1 kg)",
    "slug": "fp-market-guava-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 620,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-APPLE-RED-1KG",
    "name": "Red Apples (1 kg)",
    "slug": "fp-market-apple-red-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 2150,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-APPLE-GREEN-1KG",
    "name": "Green Apples (1 kg)",
    "slug": "fp-market-apple-green-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 2190,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-APPLE-FUJI-1KG",
    "name": "Fuji Apples (1 kg)",
    "slug": "fp-market-apple-fuji-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 1950,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-GRAPES-RED-1KG",
    "name": "Red Grapes (1 kg)",
    "slug": "fp-market-grapes-red-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 1690,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-DRAGON-FRUIT-1KG",
    "name": "Dragon Fruit (1 kg)",
    "slug": "fp-market-dragon-fruit-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 1680,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-BELI-1KG",
    "name": "Beli Fruit (1 kg)",
    "slug": "fp-market-beli-1kg",
    "categorySlug": "fresh-produce",
    "benchmarkPriceLkr": 520,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://welandapola.com/market/keells/fruits",
    "pack": "1 kg",
    "tags": [
      "fruit"
    ]
  },
  {
    "sku": "FP-MKT-NADU-RICE-1KG",
    "name": "Nadu Rice (1 kg)",
    "slug": "fp-market-nadu-rice-1kg",
    "categorySlug": "pantry-staples",
    "benchmarkPriceLkr": 180,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 kg",
    "tags": [
      "pantry"
    ]
  },
  {
    "sku": "FP-MKT-KEERI-SAMBA-1KG",
    "name": "Keeri Samba Rice (1 kg)",
    "slug": "fp-market-keeri-samba-1kg",
    "categorySlug": "pantry-staples",
    "benchmarkPriceLkr": 260,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 kg",
    "tags": [
      "pantry"
    ]
  },
  {
    "sku": "FP-MKT-WHITE-SUGAR-1KG",
    "name": "White Sugar (1 kg)",
    "slug": "fp-market-white-sugar-1kg",
    "categorySlug": "pantry-staples",
    "benchmarkPriceLkr": 245,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 kg",
    "tags": [
      "pantry"
    ]
  },
  {
    "sku": "FP-MKT-RED-DHAL-1KG",
    "name": "Red Dhal (1 kg)",
    "slug": "fp-market-red-dhal-1kg",
    "categorySlug": "pantry-staples",
    "benchmarkPriceLkr": 245,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 kg",
    "tags": [
      "pantry"
    ]
  },
  {
    "sku": "FP-MKT-COCONUT-OIL-1L",
    "name": "Coconut Oil (1 L)",
    "slug": "fp-market-coconut-oil-1l",
    "categorySlug": "pantry-staples",
    "benchmarkPriceLkr": 1178,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 L",
    "tags": [
      "pantry"
    ]
  },
  {
    "sku": "FP-MKT-EGG-EACH",
    "name": "Chicken Egg (each)",
    "slug": "fp-market-egg-each",
    "categorySlug": "dairy-eggs",
    "benchmarkPriceLkr": 59,
    "market": "Keells",
    "observedOn": "2026-11-04",
    "sourceUrl": "https://sattrin.com/data/prices",
    "pack": "1 each",
    "tags": [
      "eggs"
    ]
  }
]
$freshpick_catalog$::jsonb) AS item (
    "sku" text, "name" text, "slug" text,
    "categorySlug" text, "benchmarkPriceLkr" numeric,
    "market" text, "observedOn" text, "sourceUrl" text,
    "pack" text, "tags" jsonb
  )
)
INSERT INTO "products" (
  "id", "name", "sku", "slug", "description",
  "price", "costPrice", "categoryId", "supplierId",
  "stockQty", "minStockLevel", "image", "images",
  "tags", "attributes", "archived", "isBundle",
  "isFeatured", "discountPercentage", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text, item."name", item."sku", item."slug",
  item."name" || ' (' || item."pack" || '). Price, supplier and stock must be verified before publishing.',
  item."benchmarkPriceLkr", 0.00, category."id", NULL,
  0, 5, NULL, ARRAY[]::text[],
  ARRAY(SELECT jsonb_array_elements_text(item."tags")),
  jsonb_build_object(
    'pack', item."pack",
    'importedFrom', 'market-catalog-2026-11-05',
    'priceStatus', 'third_party_benchmark_unapproved',
    'sourceMarket', item."market",
    'sourceObservedOn', item."observedOn",
    'sourceUrl', item."sourceUrl",
    'supplierStatus', 'unverified',
    'stockStatus', 'not_counted',
    'imageStatus', 'unverified'
  ), TRUE, FALSE, FALSE, 0.00, NOW(), NOW()
FROM catalog AS item
INNER JOIN "categories" AS category
  ON category."slug" = item."categorySlug"
WHERE NOT EXISTS (
  SELECT 1 FROM "products" AS existing
  WHERE existing."sku" = item."sku"
     OR existing."slug" = item."slug"
)
ON CONFLICT DO NOTHING;

COMMIT;

-- Confirm the importer staged all 39 rows, with none publicly buyable.
SELECT
  COUNT(*)::integer AS catalog_rows,
  COUNT(*) FILTER (WHERE "archived" = TRUE AND "stockQty" = 0)::integer AS safely_staged,
  COUNT(*) FILTER (WHERE "archived" = FALSE)::integer AS published_rows
FROM "products"
WHERE "sku" LIKE 'FP-MKT-%';

-- Inspect sample imported product rows:
SELECT
  p."sku", p."name", c."name" AS "category",
  p."price" AS "market_reference_lkr", p."stockQty", p."archived"
FROM "products" p
LEFT JOIN "categories" c ON p."categoryId" = c."id"
WHERE p."sku" LIKE 'FP-MKT-%'
ORDER BY p."sku"
LIMIT 50;
