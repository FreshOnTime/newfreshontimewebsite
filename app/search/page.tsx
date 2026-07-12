import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import { Product } from "@/models/product";

const searchProducts = unstable_cache(async (query: string) => {
  if (!query.trim()) return [];

  const products = await prisma.product.findMany({
    where: {
      archived: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    select: productCardSelect,
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return products.map((product) => serializeProductCardForUi(product) as Product);
}, ["storefront-search-v2"], { revalidate: 300, tags: ["products"] });

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (getString(params.q) || "").trim();
  const results = await searchProducts(query);

  return (
    <PageContainer>
      <SectionHeader
        title={query ? `Search: ${query}` : "Search products"}
        subtitle={query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Enter a product name in the navigation search"}
      />
      <ProductGrid products={results} />
    </PageContainer>
  );
}
