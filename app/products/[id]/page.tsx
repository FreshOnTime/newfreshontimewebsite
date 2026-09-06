import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeft, CalendarClock, ShieldCheck, Sprout, Truck } from "lucide-react";

import ProductImage from "@/components/products/ProductImage";
import { Product } from "@/models/product";
import { ProductControls } from "./ProductControls";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { serverApiFetch } from "@/lib/api/server";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://freshpick.lk";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await serverApiFetch(`/api/storefront/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 300, tags: ["products"] },
    } as RequestInit & { next: { revalidate: number; tags: string[] } });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Product API returned HTTP ${response.status}`);
    return response.json() as Promise<Product>;
  } catch (error) {
    console.error("[Product page] Failed to load product:", error);
    return null;
  }
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
      description: "The FreshPick product you are looking for could not be found.",
    };
  }

  const description = product.description
    ? product.description.slice(0, 160).replace(/\s+/g, " ").trim() + (product.description.length > 160 ? "..." : "")
    : `Shop ${product.name} from FreshPick, with fresh grocery delivery across Colombo.`;

  const productUrl = `${SITE_URL}/products/${product.sku}`;
  const imageUrl = product.image?.url?.startsWith("http")
    ? product.image.url
    : `${SITE_URL}${product.image?.url || "/og-image.jpg"}`;
  const title = `${product.name} | FreshPick Colombo`;

  return {
    title,
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: "FreshPick",
      images: [{ url: imageUrl, width: 800, height: 600, alt: product.name }],
      locale: "en_LK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();

  const discountedPrice = product.discountPercentage
    ? product.pricePerBaseQuantity - (product.pricePerBaseQuantity * product.discountPercentage) / 100
    : product.pricePerBaseQuantity;
  const showDiscount = Boolean(product.discountPercentage && product.discountPercentage > 0);

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    ...(product.category?.slug ? [{ name: product.category.name, url: `${SITE_URL}/categories/${product.category.slug}` }] : []),
    { name: product.name, url: `${SITE_URL}/products/${product.sku}` },
  ];

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <ProductJsonLd
        product={{
          name: product.name,
          description: product.description,
          sku: product.sku,
          image: product.image?.url,
          price: discountedPrice,
          currency: "LKR",
          inStock: !product.isOutOfStock,
          category: product.category?.name,
          url: `${SITE_URL}/products/${product.sku}`,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8 md:pb-28 md:pt-12">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to collection
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:gap-14">
          <div className="relative">
            <div className="sticky top-28 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[4/5] w-full">
                <ProductImage src={product.image?.url || ""} alt={product.name} priority />
              </div>

              <div className="pointer-events-none absolute left-5 top-5 flex flex-wrap gap-2">
                {!product.isOutOfStock && (
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm backdrop-blur-md">
                    FreshPick selection
                  </span>
                )}
                {showDiscount && (
                  <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                    {product.discountPercentage}% off
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:pt-4">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8 lg:p-9">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {product.category?.name && (
                    <Link href={`/categories/${product.category.slug || ""}`} className="transition-colors hover:text-zinc-950">
                      {product.category.name}
                    </Link>
                  )}
                  <span className="text-zinc-300">/</span>
                  <span className={product.isOutOfStock ? "text-red-500" : "text-zinc-400"}>
                    {product.isOutOfStock ? "Currently unavailable" : "In stock"}
                  </span>
                </div>

                <h1 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.96] tracking-tight text-zinc-950 md:text-6xl">
                  {product.name}
                </h1>

                <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-zinc-100 pb-7">
                  <span className="font-serif text-3xl text-zinc-950">Rs. {discountedPrice.toFixed(2)}</span>
                  {showDiscount && (
                    <span className="text-sm text-zinc-400 line-through">Rs. {product.pricePerBaseQuantity.toFixed(2)}</span>
                  )}
                  {!product.isSoldAsUnit && (
                    <span className="w-full text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Per {product.baseMeasurementQuantity}{product.measurementUnit}
                    </span>
                  )}
                </div>

                <div className="mt-7">
                  <ProductControls product={product} />
                </div>

                <div className="mt-8 grid gap-3 border-t border-zinc-100 pt-7 sm:grid-cols-2">
                  <TrustItem icon={Truck} title="Considered delivery" text="FreshPick delivery across Colombo" />
                  <TrustItem icon={CalendarClock} title="Make it recurring" text="Add it to your regular basket" />
                  <TrustItem icon={Sprout} title="Curated quality" text="Selected for freshness and flavour" />
                  <TrustItem icon={ShieldCheck} title="Simple guarantee" text="Easy replacement or refund support" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 rounded-[2rem] bg-white px-6 py-10 md:mt-24 md:px-10 md:py-14 lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">About this selection</span>
              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-zinc-950">Good food deserves a little context.</h2>
            </div>
            <div className="prose prose-zinc max-w-none font-light leading-8 text-zinc-600 prose-headings:font-serif prose-headings:font-normal prose-a:text-emerald-800">
              {product.description ? (
                <Markdown rehypePlugins={[rehypeSanitize]}>{product.description}</Markdown>
              ) : (
                <p>Selected by FreshPick for quality, freshness, and everyday usefulness. Add it to today&apos;s basket or make it part of a recurring delivery.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Truck;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#f7f8f6] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
        <Icon className="h-4 w-4 stroke-[1.5]" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="mt-1 text-xs font-light leading-5 text-zinc-500">{text}</p>
      </div>
    </div>
  );
}
