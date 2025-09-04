import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import ProductsFilterBar from "../../components/products/ProductsFilterBar";
import { withBase } from "@/lib/serverUrl";

async function getProducts(query: string) {
  try {
    // Use absolute URL for server-side rendering
    const url = withBase(`/api/products${query ? `?${query}` : ''}`);
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      return data.data?.products || [];
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
  return [];
}

export default async function ProductsIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const spObj = await searchParams;
  // Normalize to query string
  const sp = new URLSearchParams();
  const allowed = ['search','categoryId','supplierId','minPrice','maxPrice','inStock','sort','page','limit'];
  for (const key of allowed) {
    const val = spObj[key];
    if (Array.isArray(val)) {
      for (const v of val) if (v != null) sp.append(key, String(v));
    } else if (val != null) {
      sp.set(key, String(val));
    }
  }
  const products = await getProducts(sp.toString());

  return (
    <PageContainer>
      <SectionHeader
        title="All Products"
        subtitle="Explore our complete range of fresh groceries"
      />
  <ProductsFilterBar />
  <ProductGrid products={products} />
    </PageContainer>
  );
}
