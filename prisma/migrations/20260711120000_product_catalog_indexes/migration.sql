CREATE INDEX "products_archived_createdAt_idx"
  ON "products"("archived", "createdAt");

CREATE INDEX "products_categoryId_archived_createdAt_idx"
  ON "products"("categoryId", "archived", "createdAt");
