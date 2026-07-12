INSERT INTO "categories" (
  "id",
  "name",
  "slug",
  "description",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES (
  '87d201e3-4bf0-44d1-89d4-ea59ad53f169',
  'Cooked Food',
  'cookedfood',
  'FreshPick prepared meals and cooked-food favourites.',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
