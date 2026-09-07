import Link from "next/link";
import { ArrowUpRight, Heart, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTrendingProducts } from "@/lib/intelligence/tasteGraph";

async function getPlatformPulse() {
  try {
    const [catalogue, inStock, recipes, trending] = await Promise.all([
      prisma.product.count({ where: { archived: false } }),
      prisma.product.count({ where: { archived: false, stockQty: { gt: 0 } } }),
      prisma.blog.count({ where: { category: "recipe", published: true, isDeleted: false } }),
      getTrendingProducts(4),
    ]);
    return { catalogue, inStock, recipes, trending };
  } catch (error) {
    console.error("[Homepage] Failed to build platform pulse:", error);
    return {
      catalogue: 0,
      inStock: 0,
      recipes: 0,
      trending: [] as Awaited<ReturnType<typeof getTrendingProducts>>,
    };
  }
}

export default async function PlatformIntelligence() {
  const pulse = await getPlatformPulse();
  const availability = pulse.catalogue > 0 ? Math.round((pulse.inStock / pulse.catalogue) * 100) : 0;

  return (
    <section className="relative overflow-hidden bg-[#08120d] py-24 text-white md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(52,211,153,0.12),transparent_30%),radial-gradient(circle_at_82%_75%,rgba(163,230,53,0.05),transparent_24%)]" />
      <div className="container relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> Quietly personal
            </span>
            <h2 className="mt-6 max-w-3xl text-balance font-serif text-5xl font-normal leading-[0.94] tracking-[-0.035em] md:text-7xl">
              FreshPick should feel like it <span className="italic text-emerald-200">knows your kitchen.</span>
            </h2>
            <p className="mt-7 max-w-xl text-base font-light leading-8 text-white/60">
              The intelligence stays in the background. Your real shopping history helps FreshPick surface better picks, notice repeat essentials and make the next basket easier to build.
            </p>

            <div className="mt-10 space-y-6 border-t border-white/10 pt-8">
              <div className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/6"><Heart className="h-4 w-4 text-emerald-200" /></span>
                <div>
                  <p className="font-serif text-2xl text-white">Picked around your taste</p>
                  <p className="mt-2 max-w-lg text-sm font-light leading-6 text-white/50">Recommendations are ranked from the categories and food signals you actually return to.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/6"><RefreshCw className="h-4 w-4 text-emerald-200" /></span>
                <div>
                  <p className="font-serif text-2xl text-white">The repeat shop, remembered</p>
                  <p className="mt-2 max-w-lg text-sm font-light leading-6 text-white/50">When repeat purchases form a pattern, FreshPick can suggest what may be running low before you rebuild the same list.</p>
                </div>
              </div>
            </div>

            <Link href="/for-you" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#08120d] transition-colors hover:bg-emerald-50">
              See what FreshPick has learned <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="border-b border-white/10 p-6 md:p-8">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200">Fresh right now</p>
                  <h3 className="mt-3 font-serif text-3xl font-normal md:text-4xl">What people are choosing.</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-white/35" />
              </div>
            </div>

            {pulse.trending.length > 0 ? (
              <div className="divide-y divide-white/8">
                {pulse.trending.map((item, index) => (
                  <Link key={item.product._id} href={`/products/${item.product.sku}`} className="group grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-6 py-5 transition-colors hover:bg-white/[0.04] md:px-8">
                    <span className="font-serif text-lg text-white/25">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-light text-white/75 group-hover:text-white">{item.product.name}</span>
                    <ArrowUpRight className="h-4 w-4 text-white/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-sm font-light leading-7 text-white/45 md:px-8">Popular picks will appear here once there is enough real order activity.</div>
            )}

            <div className="grid grid-cols-2 border-t border-white/10 md:grid-cols-3">
              <div className="p-5 md:p-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">Catalogue</p>
                <p className="mt-2 font-serif text-2xl text-white">{pulse.catalogue.toLocaleString()}</p>
              </div>
              <div className="border-l border-white/10 p-5 md:p-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">Available now</p>
                <p className="mt-2 font-serif text-2xl text-white">{availability}%</p>
              </div>
              <div className="col-span-2 border-t border-white/10 p-5 md:col-span-1 md:border-l md:border-t-0 md:p-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">Shoppable recipes</p>
                <p className="mt-2 font-serif text-2xl text-white">{pulse.recipes.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
