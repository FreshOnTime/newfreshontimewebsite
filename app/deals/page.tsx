import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import { Product } from "@/models/product";
import { withBase } from "@/lib/serverUrl";

async function getDealProducts() {
  try {
  const response = await fetch(withBase('/api/products'), {
      cache: 'no-store'
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
