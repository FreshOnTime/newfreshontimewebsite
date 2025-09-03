import { notFound } from "next/navigation";
import ProductImage from "@/components/products/ProductImage";
import { Product } from "@/models/product";
import { Separator } from "@radix-ui/react-separator";
import Markdown from "react-markdown";
import { Suspense } from "react";
import { ProductControls } from "./ProductControls";
import { PageContainer } from "@/components/templates/PageContainer";
import rehypeSanitize from "rehype-sanitize";
import { withBase } from "@/lib/serverUrl";
import Link from "next/link";

async function getProduct(id: string): Promise<Product | null> {
  try {
  const response = await fetch(withBase(`/api/products/${id}`), {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      return data.data || null;
    }
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }
  return null;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const pricePerBaseQuantityWithDiscount = product.discountPercentage
    ? product.pricePerBaseQuantity -
      (product.pricePerBaseQuantity * (product.discountPercentage || 0)) / 100
    : product.pricePerBaseQuantity;
  const pricePerMeasurement =
    pricePerBaseQuantityWithDiscount / product.baseMeasurementQuantity;

  return (
    <PageContainer>
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <ProductImage src={product.image.url} alt={product.name} />
        </div>
        <div className="flex md:col-span-6 flex-col space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.category?.slug && (
              <div className="text-sm text-gray-600">
                Category: <Link href={`/categories/${product.category.slug}`} className="text-green-600 hover:underline">{product.category.name || 'View'}</Link>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xl font-semibold text-gray-900">
                Rs. {pricePerBaseQuantityWithDiscount.toFixed(2)}
                {!product.isSoldAsUnit && product.baseMeasurementQuantity > 0 && (
                  <span className="text-lg text-gray-600">
                    /{product.baseMeasurementQuantity}
                    {product.measurementUnit}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    Rs. {product.pricePerBaseQuantity.toFixed(2)}
                  </span>
                )}
              </p>
              {!product.isSoldAsUnit && product.baseMeasurementQuantity > 0 && (
                <p className="text-sm text-gray-600">
                  Rs. {pricePerMeasurement.toFixed(2)}/{product.measurementUnit}
                </p>
              )}
            </div>
          </div>
          <Separator />

          <div className="space-y-4">
            {product.description && (
              <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                <Markdown
                  rehypePlugins={[rehypeSanitize]}
                  className="text-gray-600 leading-relaxed prose"
                >
                  {product.description}
                </Markdown>
              </Suspense>
            )}
            <ProductControls product={product} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
