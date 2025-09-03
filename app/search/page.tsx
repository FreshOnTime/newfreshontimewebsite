"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import { Product } from "@/models/product";

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q")?.toLowerCase() ?? "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?search=${encodeURIComponent(q)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data?.products || []);
        }
      } catch (error) {
        console.error('Failed to search products:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    if (q) {
      searchProducts();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [q]);

  if (loading) {
    return (
      <PageContainer>
        <SectionHeader
          title="Searching..."
          subtitle="Finding products for you"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title={`Search: ${q || "All"}`}
        subtitle={`${results.length} result${results.length !== 1 ? "s" : ""}`}
      />
      <ProductGrid products={results} />
    </PageContainer>
  );
}
