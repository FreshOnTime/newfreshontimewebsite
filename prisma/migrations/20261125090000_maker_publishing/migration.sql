-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "makerBio" TEXT,
ADD COLUMN     "makerFulfilment" TEXT,
ADD COLUMN     "makerHandle" TEXT,
ADD COLUMN     "makerPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "makerTown" TEXT,
ADD COLUMN     "makerWhatsApp" TEXT;

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "supplierId" TEXT;

-- CreateTable
CREATE TABLE "maker_items" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "price" DECIMAL(12,2),
    "image" TEXT,
    "madeToOrder" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maker_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "maker_items_positive_price" CHECK ("price" IS NULL OR "price" > 0)
);

-- CreateTable
CREATE TABLE "maker_batches" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "cutoff" TIMESTAMP(3) NOT NULL,
    "readyAt" TIMESTAMP(3) NOT NULL,
    "soldOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maker_batches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "maker_batches_valid_window" CHECK ("cutoff" <= "readyAt"),
    CONSTRAINT "maker_batches_positive_price" CHECK ("price" > 0)
);

-- CreateTable
CREATE TABLE "maker_story_items" (
    "storyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "maker_story_items_pkey" PRIMARY KEY ("storyId","itemId")
);

-- CreateIndex
CREATE INDEX "maker_items_supplierId_published_createdAt_idx" ON "maker_items"("supplierId", "published", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "maker_items_supplierId_slug_key" ON "maker_items"("supplierId", "slug");

-- CreateIndex
CREATE INDEX "maker_batches_itemId_cutoff_idx" ON "maker_batches"("itemId", "cutoff");

-- CreateIndex
CREATE INDEX "maker_batches_soldOut_cutoff_readyAt_idx" ON "maker_batches"("soldOut", "cutoff", "readyAt");

-- CreateIndex
CREATE INDEX "maker_story_items_itemId_idx" ON "maker_story_items"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_makerHandle_key" ON "suppliers"("makerHandle");

-- CreateIndex
CREATE INDEX "blogs_supplierId_published_publishedAt_idx" ON "blogs"("supplierId", "published", "publishedAt");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maker_items" ADD CONSTRAINT "maker_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maker_batches" ADD CONSTRAINT "maker_batches_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "maker_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maker_story_items" ADD CONSTRAINT "maker_story_items_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maker_story_items" ADD CONSTRAINT "maker_story_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "maker_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
