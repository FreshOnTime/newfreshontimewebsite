import Image from "next/image";
import { HeartHandshake, PackageCheck, Sprout } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";

interface HomemadeContentProps {
  products: Product[];
}

const values = [
  {
    title: "Made in Small Batches",
    description: "Thoughtful, limited-run products made with the attention and character of a home kitchen.",
    icon: PackageCheck,
  },
  {
    title: "Directly Supporting Makers",
    description: "Every order helps independent Sri Lankan food makers grow their craft and their businesses.",
    icon: HeartHandshake,
  },
  {
    title: "Rooted in Local Ingredients",
    description: "Familiar ingredients, honest methods, and flavours that belong at your table.",
    icon: Sprout,
  },
];

export default function HomemadeContent({ products }: HomemadeContentProps) {
  return (
    <div className="min-h-screen bg-transparent text-zinc-900">
      <section className="relative flex h-[80vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bgs/home-hero.jpg"
            alt="Fresh local produce for homemade favourites"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white/10" />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-4 pt-20 text-center text-white">
          <span className="mb-6 inline-block rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
            The Artisan Collection
          </span>
          <h1 className="mb-8 font-serif text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            Homemade <br />
            <span className="italic text-emerald-100">&amp; Handcrafted</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-2xl">
            Small-batch favourites from local makers, chosen for the care, flavour, and stories behind every product.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-80">
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </section>

      <section className="relative bg-zinc-50 py-24">
        <div className="container relative z-20 mx-auto max-w-[1400px] px-4">
          <div className="-mt-32 border border-[#e4e4e7] bg-white p-6 shadow-[0_24px_70px_rgba(20,32,25,0.08)] md:p-10">
            <div className="mb-10 flex flex-col gap-4 border-b border-zinc-100 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">The Collection</span>
                <h2 className="font-serif text-4xl text-zinc-900 md:text-5xl">Made with care</h2>
              </div>
              <span className="text-sm font-light text-zinc-500">
                {products.length} {products.length === 1 ? "artisan product" : "artisan products"} available
              </span>
            </div>

            {products.length > 0 ? (
              <ProductGrid
                products={products}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
              />
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center">
                <p className="mb-3 font-serif text-2xl text-zinc-900">The collection is coming together</p>
                <p className="max-w-md font-light leading-relaxed text-zinc-500">
                  We are selecting the next set of homemade favourites. Please check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-20 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Our Promise</span>
            <h2 className="font-serif text-5xl text-zinc-900 md:text-6xl">The Homemade Standard</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {values.map(({ title, description, icon: Icon }) => (
              <article key={title} className="group border border-[#e4e4e7] bg-[#ffffff] p-8 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-xl md:p-10">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 font-serif text-2xl text-zinc-900">{title}</h3>
                <p className="font-light leading-relaxed text-zinc-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
