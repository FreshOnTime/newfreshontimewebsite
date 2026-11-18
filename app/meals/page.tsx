import { serializeJsonLd } from '@/lib/seo';
import { publicPageMetadata } from '@/lib/publicPages';
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import { Product } from "@/models/product";
import MealsContent from "./MealsContent";

export const revalidate = 300;

export const metadata: Metadata = publicPageMetadata('/meals');

const getCookedFoodProducts = unstable_cache(async () => {
  const products = await prisma.product.findMany({
    // Filter through the category relation so this collection is one query,
    // rather than waiting for a category lookup before the product query.
    where: { category: { slug: { in: ["cookedfood", "cooked-food", "prepared-meals", "ready-meals"] } }, archived: false },
    orderBy: [{ stockQty: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    select: productCardSelect,
    take: 48,
  });

  return products.map((product) => serializeProductCardForUi(product) as Product);
}, ["cooked-food-products-v3"], { revalidate: 300, tags: ["products"] });

export default async function MealsPage() {
  const products = await getCookedFoodProducts();
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://freshpick.lk/meals#collection",
    "name": "Ready meals in Colombo | FreshPick",
    "description": "Browse ready meals, home kitchens and bakery in Colombo.",
    "url": "https://freshpick.lk/meals",
    "isPartOf": { "@id": "https://freshpick.lk/#website" },
    "about": { "@type": "Thing", "name": "Cooked food delivery in Colombo" },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://freshpick.lk/products/${encodeURIComponent(product.sku)}`,
        "name": product.name,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageJsonLd) }} />
      <MealsContent products={products} />
    </>
  );
}
