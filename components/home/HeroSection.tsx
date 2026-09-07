import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Heart, MapPin, ShoppingBasket, Sparkles } from "lucide-react";

const quickLinks = [
  { label: "Dinner tonight", href: "/recipes" },
  { label: "Picked for you", href: "/for-you" },
  { label: "Local makers", href: "/homemade" },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-[#07110c] text-white md:min-h-[92vh]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/bgs/home-hero.jpg"
          alt="Fresh food and produce selected for everyday cooking"
          fill
          sizes="100vw"
          className="object-cover opacity-80"
          priority
          fetchPriority="high"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110c]/95 via-[#07110c]/60 to-[#07110c]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/5 to-black/30" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1600px] px-5 pb-10 pt-32 md:px-10 md:pb-14 lg:px-16 lg:pb-20">
        <div className="grid items-end gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="animate-fade-up">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Food worth looking forward to
              </span>
              <span className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55 sm:inline-flex">
                <MapPin className="h-3.5 w-3.5" /> Colombo · Sri Lanka
              </span>
            </div>

            <h1 className="max-w-6xl text-balance font-serif text-[3.6rem] font-normal leading-[0.89] tracking-[-0.045em] text-white sm:text-7xl md:text-8xl lg:text-[7.2rem]">
              Discover what to eat.<br className="hidden sm:block" /> Get everything <span className="italic text-emerald-200">to make it.</span>
            </h1>

            <div className="mt-8 grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,650px)_auto] lg:items-end">
              <p className="max-w-2xl text-base font-light leading-7 text-white/72 md:text-lg md:leading-8">
                Recipes, fresh groceries, ready meals and independent local makers in one place. As you shop, FreshPick quietly gets better at surfacing what fits your taste and weekly rhythm.
              </p>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  prefetch={false}
                  href="/discover"
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07110c] shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  <Compass className="h-4 w-4" /> Discover food
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  prefetch={false}
                  href="/products"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-all hover:border-emerald-200/60 hover:bg-white/[0.14]"
                >
                  <ShoppingBasket className="h-4 w-4" /> Shop the market
                </Link>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 border-t border-white/12 pt-6">
              <span className="mr-2 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Start with</span>
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="rounded-full border border-white/12 bg-black/10 px-4 py-2 text-xs text-white/75 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <aside className="hidden rounded-[2rem] border border-white/12 bg-black/20 p-7 backdrop-blur-xl xl:block">
            <Heart className="h-5 w-5 text-emerald-200" />
            <p className="mt-5 font-serif text-3xl font-normal leading-tight text-white">A food shop that remembers the things you love.</p>
            <p className="mt-5 text-sm font-light leading-7 text-white/60">
              Your order history can shape future picks and help FreshPick notice the essentials you tend to need again.
            </p>
            <Link href="/for-you" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              See your picks <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
