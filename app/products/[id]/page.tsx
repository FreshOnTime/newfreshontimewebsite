import { pageMetadata } from '@/lib/seo';
import { SITE_URL, absoluteUrl } from '@/lib/config/site';
import { notFound } from "next/navigation";
import { discountedUnitPrice } from '@/lib/commercePricing';
import { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import ProductImage from "@/components/products/ProductImage";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";
import { ProductControls } from "./ProductControls";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { loadStorefrontProduct, loadStorefrontProducts } from "@/lib/storefrontProducts";

export const revalidate = 300;


const getProduct = cache(unstable_cache(loadStorefrontProduct, ['storefront-product-db-v1'], {
  revalidate: 300, tags: ['products'],
}));
const getRelatedSelection = unstable_cache(loadStorefrontProducts, ['storefront-related-db-v1'], {
  revalidate: 300, tags: ['products'],
});

async function getRelatedProducts(product: Product): Promise<Product[]> {
  if (!product.category?.id) return [];
  const query = new URLSearchParams({ categoryId: product.category.id, limit: '5', inStock: 'true' });
  const data = await getRelatedSelection(query.toString());
  return data.products.filter(item => item.sku !== product.sku).slice(0, 4);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | FreshPick",
      robots: { index: false, follow: false },
      description: "The FreshPick product you are looking for could not be found.",
    };
  }

  const description = product.description
    ? product.description.slice(0, 160).replace(/\s+/g, " ").trim() + (product.description.length > 160 ? "..." : "")
    : `Shop ${product.name} from FreshPick, with fresh grocery delivery across Colombo.`;

  const title = `${product.name} | FreshPick Colombo`;

  return pageMetadata({ title, description, path: `/products/${encodeURIComponent(product.sku)}`, image: product.image?.url });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();
  const relatedProducts = await getRelatedProducts(product);

  const discountedPrice = discountedUnitPrice(product.pricePerBaseQuantity, product.discountPercentage || 0);
  const showDiscount = Boolean(product.discountPercentage && product.discountPercentage > 0);

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    ...(product.category?.slug ? [{ name: product.category.name, url: absoluteUrl(`/categories/${encodeURIComponent(product.category.slug)}`) }] : []),
    { name: product.name, url: absoluteUrl(`/products/${encodeURIComponent(product.sku)}`) },
  ];

  return (
    <div className="bg-background">
      <ProductJsonLd product={{ name: product.name, description: product.description, sku: product.sku, image: product.image?.url, price: discountedPrice, currency: "LKR", inStock: !product.isOutOfStock, category: product.category?.name, url: absoluteUrl(`/products/${encodeURIComponent(product.sku)}`) }} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-6 md:px-8 md:pb-16 md:pt-8">
        <nav aria-label="Product navigation" className="mb-7 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link href="/products" className="inline-flex min-h-11 items-center gap-2 hover:text-brand-green"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to market</Link>
          {product.category?.slug && <Link href={`/categories/${product.category.slug}`} className="border-l border-border pl-4 hover:text-brand-green">{product.category.name}</Link>}
        </nav>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary [&_img]:mix-blend-multiply lg:sticky lg:top-40">
            <ProductImage src={product.image?.url || ""} alt={product.name} priority sizes="(max-width: 1023px) 100vw, (max-width: 1280px) 50vw, 576px" />
            {showDiscount && <span className="absolute right-4 top-4 bg-brand-amber px-3 py-1.5 text-xs font-semibold text-foreground">{product.discountPercentage}% off</span>}
          </div>
          <div className="lg:py-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{product.isBundle ? "Market bundle" : "From the market"}</p>
            <h1 className="mt-4 text-3xl font-normal leading-tight tracking-[-0.035em] text-brand-green md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{product.isOutOfStock ? "Currently unavailable" : "In stock"} · SKU {product.sku}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold text-foreground">Rs. {discountedPrice.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {showDiscount && <span className="text-sm text-muted-foreground line-through">Rs. {product.pricePerBaseQuantity.toFixed(2)}</span>}
              <span className="text-sm text-muted-foreground">{product.isSoldAsUnit ? "Each" : `Per ${product.baseMeasurementQuantity}${product.measurementUnit}`}</span>
            </div>
            <div className="mt-7 border-t border-border pt-7"><ProductControls product={product} /></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-brand-green">
              <Link href="/help" className="inline-flex min-h-11 items-center gap-2 hover:underline">Delivery & ordering <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/refund" className="inline-flex min-h-11 items-center gap-2 hover:underline">Returns & refunds <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
        {(product.description || product.ingredients || product.nutritionFacts) && (
          <section aria-labelledby="product-details-title" className="mt-10 grid gap-6 border-t border-border pt-8 md:mt-14 md:grid-cols-[1fr_2fr] md:gap-16 md:pt-10">
            <h2 id="product-details-title" className="text-2xl font-normal text-brand-green">Product details</h2>
            <div className="space-y-6">
              {product.description && <div className="prose max-w-none text-sm leading-7 text-muted-foreground prose-headings:font-medium prose-headings:text-brand-green prose-a:text-brand-green"><Markdown rehypePlugins={[rehypeSanitize]}>{product.description}</Markdown></div>}
              {product.ingredients && <div><h3 className="text-base font-medium text-brand-green">Ingredients</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.ingredients}</p></div>}
              {product.nutritionFacts && <div><h3 className="text-base font-medium text-brand-green">Nutrition</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.nutritionFacts}</p></div>}
            </div>
          </section>
        )}
        {relatedProducts.length > 0 && <section aria-labelledby="related-products-title" className="mt-14 border-t border-border pt-10 md:mt-20 md:pt-14"><h2 id="related-products-title" className="editorial-title mb-8">More for your kitchen.</h2><ProductGrid products={relatedProducts} /></section>}
      </div>
    </div>
  );
}
