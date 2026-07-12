import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import { Product } from "@/models/product";
import MealsContent from "./MealsContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Meals on Deals | FreshPick Cooked Food",
  description: "Order FreshPick cooked-food favourites online, or set up flexible recurring meal deliveries in Colombo.",
  keywords: ["cooked food delivery Colombo", "ready meals Colombo", "recurring meal delivery Sri Lanka", "FreshPick Meals on Deals"],
  openGraph: {
    title: "Meals on Deals | FreshPick Cooked Food in Colombo",
    description: "Order cooked-food favourites today or make them part of your recurring FreshPick delivery.",
    url: "https://freshpick.lk/meals",
    locale: "en_LK",
    type: "website",
  },
  other: {
    "geo.region": "LK-11",
    "geo.placename": "Colombo, Sri Lanka",
    "geo.position": "6.9271;79.8612",
    "ICBM": "6.9271, 79.8612",
  },
  alternates: { canonical: "https://freshpick.lk/meals" },
};

const getCookedFoodProducts = unstable_cache(async () => {
  try {
    const products = await prisma.product.findMany({
      // Filter through the category relation so this collection is one query,
      // rather than waiting for a category lookup before the product query.
      where: { category: { slug: "cookedfood" }, archived: false },
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
      take: 48,
    });

    return products.map((product) => serializeProductCardForUi(product) as Product);
  } catch (error) {
    console.error("[Meals] Failed to fetch cooked-food products:", error);
    return [];
  }
}, ["cooked-food-products-v1"], { revalidate: 300, tags: ["products"] });

export default async function MealsPage() {
  const products = await getCookedFoodProducts();
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://freshpick.lk/meals#collection",
    "name": "FreshPick Meals on Deals",
    "description": "Cooked-food favourites available for one-time or recurring delivery in Colombo, Sri Lanka.",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <MealsContent products={products} />
    </>
  );
}
