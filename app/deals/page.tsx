import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import { Product } from "@/models/product";
import { withBase } from "@/lib/serverUrl";

// Use ISR: deals/discounted products change infrequently; 5-minute cache
// reduces serverless cold starts and avoids a DB/API call on every request.
export const revalidate = 300;

async function getDealProducts() {
  try {
    const response = await fetch(withBase('/api/products'), {
      next: { revalidate: 300 },
    });
    if (response.ok) {
      const data = await response.json();
      const allProducts: Product[] = data.data?.products || [];
      return allProducts.filter((p: Product) => (p.discountPercentage ?? 0) > 0);
    }
  } catch (error) {
    console.error('Failed to fetch deal products:', error);
  }
  return [];
}

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
