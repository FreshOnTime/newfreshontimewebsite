import Image from "next/image";
import Link from "next/link";

export default function BannerGrid() {
  const banners = [
    { title: "The seasonal edit", sub: "Harvested now", href: "/products?sort=new", image: "/bannermaterial/1.jpg", className: "lg:col-span-7 lg:h-[650px]" },
    { title: "Meals, considered", sub: "Prepared for you", href: "/meals", image: "/bannermaterial/2.jpg", className: "lg:col-span-5 lg:h-[650px]" },
    { title: "The weekly curation", sub: "A quieter routine", href: "/subscriptions", image: "/bannermaterial/3.jpg", className: "lg:col-span-12 lg:h-[440px]" },
  ];

  return (
    <section className="bg-[#0a1510] py-24 md:py-32">
      <div className="container mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="mb-16 flex flex-col justify-between gap-6 text-white md:flex-row md:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#6ee7b7]">Seasonal stories</span>
            <h2 className="mt-6 font-serif text-5xl font-normal md:text-7xl">The FreshPick <span className="italic text-emerald-200">world.</span></h2>
          </div>
          <p className="max-w-md text-sm font-light leading-7 text-white/55">A collection of ingredients, prepared food, and services shaped around how you want to live.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          {banners.map((b) => (
            <Link key={b.title} href={b.href} className={`group relative h-[500px] overflow-hidden bg-zinc-900 transition-all duration-700 ${b.className}`}>
              <Image
                src={b.image}
                alt={b.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-75 transition-all duration-[1.5s] ease-out group-hover:scale-[1.03] group-hover:opacity-90"
                // These local JPGs are already compressed and cacheable as static assets.
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-70" />

              <div className="absolute inset-0 m-4 flex flex-col items-start justify-end border border-white/15 p-8 transition-colors duration-700 group-hover:border-[#6ee7b7]/50 md:p-12">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6ee7b7]">
                  {b.sub}
                </p>
                <h3 className="mb-8 font-serif text-4xl font-normal leading-none text-white transition-transform duration-500 group-hover:-translate-y-1 md:text-5xl">{b.title}</h3>

                <span className="inline-flex border-b border-white/40 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all group-hover:border-[#6ee7b7] group-hover:text-[#d1fae5]">
                  Discover
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div >
    </section >
  );
}
