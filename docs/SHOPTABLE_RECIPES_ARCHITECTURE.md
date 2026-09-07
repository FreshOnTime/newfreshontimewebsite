# FreshPick Shoppable Recipes

This feature turns FreshPick Discover into a commerce loop rather than a navigation layer.

## Content model

Recipes intentionally reuse the existing `Blog` publishing record instead of creating a parallel CMS table. A recipe is a Blog row with `category = "recipe"`. Normal editorial fields keep handling title, slug, excerpt, hero image, publication state, author and SEO metadata. The `content` column contains a versioned JSON recipe payload validated by `lib/recipeContent.ts`.

Version 1 contains:

- story, cuisine, dietary tags, servings and preparation/cooking time
- ordered cooking steps
- product-backed ingredients with quantity and optional status
- approved substitution product IDs

Normal blog feeds explicitly exclude `category = "recipe"`; recipe content is served through `/recipes` and `/api/recipes`.

## Commerce flow

`POST /api/recipes/[slug]/add-to-bag` is the trusted server-side basket operation.

1. Authenticate the customer.
2. Load the published recipe and its product IDs.
3. Reuse the customer's requested/current active saved bag, or create a recipe bag if none exists.
4. For every recipe ingredient, prefer the primary product when stock can satisfy the requested quantity.
5. If the primary cannot satisfy it, try editor-approved substitutions in order.
6. Skip unavailable items instead of failing the whole recipe.
7. Upsert all chosen items into the saved bag and recompute its total.
8. Return `added` and `skipped` results so the storefront can explain substitutions and availability honestly.

Checkout, pricing and bag ownership remain governed by the existing FreshPick bag/order system. Recipe pages never create a second cart implementation.

## Admin workflow

`/admin/recipes` is the publishing studio. It uses the existing admin product API to attach live catalogue items to recipe ingredients and uses `/api/admin/recipes` for recipe CRUD. Published recipes appear in the public recipe index and sitemap automatically.

## Next iterations

- expose ordered substitution selection in the Recipe Studio UI
- add collection/occasion records that group recipes (weeknight, brunch, high-protein, seasonal drops)
- instrument recipe view, whole-meal add, substitution and checkout attribution events for the Taste Graph
- add creator attribution to the same recipe object once creator profiles are introduced
