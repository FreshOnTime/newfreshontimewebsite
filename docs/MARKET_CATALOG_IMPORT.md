# FreshPick market-referenced product catalogue

This contains **39 real grocery item types**, with observable reference prices. **These are not confirmed FreshPick products, FreshPick selling prices, or sellable inventory.** Never use competitor price observations as if they were an approved FreshPick price.

## Apply to a selected database

```bash
npm ci
npm run catalog:market:import
# Confirm target DATABASE_URL and back it up first.
npm run catalog:market:import -- --apply
# Only when NODE_ENV=production, explicitly acknowledge the target:
NODE_ENV=production npm run catalog:market:import -- --apply --allow-production
```

- Dry run needs no DB and changes nothing.
- Apply inserts new records by stable `FP-MKT-*` SKU, safely skipping existing SKUs without updating them.
- Creates missing catalogue category rows only when necessary.
- All new products are **archived=true**, **stockQty=0**, **supplierId=null**, **costPrice=0**, with no product photos.
- The batch is a database transaction. It creates **no users, suppliers, customer records or orders**.
- The two existing sample product SKUs remain untouched, avoiding damage to historical references.
- This is intentionally separate from the existing legacy demo seed scripts. **Do not use** `npm run seed` or `npm run db:seed` on production without inspecting their demo accounts and inventory side effects.
- There is no automatic run on deployment or on PR merge.

## Market references

Each record in [the JSON catalogue](../data/market-catalog-2026-11-05.json) includes market, source URL, pack size and observation date. They are market benchmarks only.

- Vegetable prices: 5 November 2026 comparisons, https://www.welandapola.com/
- Fruit prices: Keells history, 4 November 2026, https://welandapola.com/market/keells/fruits
- Pantry and egg prices: Keells comparison for 4 November 2026, https://sattrin.com/data/prices

Before publishing each product, verify the supplier, FreshPick retail price, purchase cost, exact pack/variety, real stock, and properly licensed actual-product photo. Update those fields in the admin product editor and unarchive only after approval.

**Note:** Since the public MCP endpoint filters out archived products, these imported rows will **not** appear in public product discovery until reviewed and published. They also are not written to the live DB simply by merging this PR.
