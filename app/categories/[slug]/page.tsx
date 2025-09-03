import ProductGrid from "@/components/products/ProductGrid";
import { PageContainer } from "@/components/templates/PageContainer";
import SectionHeader from "@/components/home/SectionHeader";
import { Product } from "@/models/product";
import { withBase } from "@/lib/serverUrl";

async function getCategoryProducts(slug: string): Promise<Product[]> {
  try {
  const response = await fetch(withBase(`/api/products?search=${encodeURIComponent(slug.replace(/-/g, ' '))}`), {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      return data.data?.products || [];
    }
  } catch (error) {
    console.error('Failed to fetch category products:', error);
  }
  return [];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const products = await getCategoryProducts(slug);

  return (
    <PageContainer>
      <SectionHeader
        title={name}
        subtitle={`Browse ${name} from our selection`}
        ctaHref="/products"
        ctaLabel="All products"
      />
      <ProductGrid products={products} />
    </PageContainer>
  );
}
