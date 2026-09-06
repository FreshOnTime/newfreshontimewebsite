# Shoppable Recipes test plan

## Admin

- Admin can open `/admin/recipes` and load product inventory.
- Creating a draft with title, summary, at least one product and at least one step succeeds.
- Publishing makes the recipe visible on `/recipes`.
- Editing a recipe updates its public detail page.
- Deleting a recipe soft-deletes it and removes it from public recipe results.
- Non-admin requests to recipe admin APIs are rejected.

## Storefront

- `/discover` dinner entry points route to `/recipes`.
- Recipe list only shows published, non-deleted recipe content.
- Recipe detail renders timing, servings, story, ingredients and steps.
- Recipe detail metadata and Recipe JSON-LD are emitted.
- Normal `/api/blogs` results do not contain recipe content.

## Add whole meal

- Logged-out visitor is redirected to sign-in before adding a meal.
- Existing active bag is reused when supplied.
- A recipe-specific saved bag is created when the customer has no active bag.
- Available primary ingredients are added with current catalogue price.
- Existing bag quantities are included in stock checks.
- Approved substitutes are selected when the primary product cannot satisfy quantity.
- Unavailable ingredients are reported as skipped and do not block available ingredients.
- Bag total is recomputed after the operation.
- Customer cannot add into another user's bag.

## Regression

- Existing ProductCard add-to-bag behavior is unchanged.
- Checkout continues reading the same Bag/BagItem records.
- Blog list still returns normal blog posts.
- Product, category and existing static sitemap entries remain present.
