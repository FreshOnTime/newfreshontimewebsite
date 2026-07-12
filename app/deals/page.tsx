import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import { Product } from "@/models/product";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";

// Use ISR: deals/discounted products change infrequently; 5-minute cache
// reduces serverless cold starts and avoids a DB/API call on every request.
export const revalidate = 300;

const getDealProducts = unstable_cache(async () => {
  try {
    const products = await prisma.product.findMany({
      where: { archived: false, discountPercentage: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
      take: 60,
    });
    return products.map((product) => serializeProductCardForUi(product) as Product);
  } catch (error) {
    console.error('Failed to fetch deal products:', error);
  }
  return [];
}, ["deal-products-v1"], { revalidate: 300, tags: ["products"] });

export default async function DealsPage() {
  const dealProducts = await getDealProducts();

  return (
    <PageContainer>
      <SectionHeader
        title="Hot Deals"
        subtitle="Limited-time savings on popular items"
      />
      <ProductGrid products={dealProducts} />
    </PageContainer>
  );
}
