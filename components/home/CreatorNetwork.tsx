import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";
import { listCreators } from "@/lib/creatorService";

export default async function CreatorNetwork() {
  const creators = await listCreators(4).catch(() => []);

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
              <UsersRound className="h-4 w-4" /> From the FreshPick kitchen
            </div>
            <h2 className="mt-5 max-w-4xl font-serif text-5xl font-normal leading-[0.94] tracking-[-0.03em] text-zinc-950 md:text-7xl">
              Follow the food, then meet the person behind it.
            </h2>
          </div>
          <div className="md:justify-self-end">
            <p className="max-w-lg text-base font-light leading-7 text-zinc-600">
              Creator profiles are built from real published recipes on FreshPick, so discovery starts with something worth cooking rather than a follower count.
            </p>
            <Link href="/creators" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-900 hover:text-emerald-700">
              Meet the creators <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {creators.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-[#f5f6f3] px-6 py-14 text-sm font-light text-zinc-500">
            Creator stories will appear here as recipes are published.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {creators.map((creator, index) => {
              const image = creator.latestRecipe?.image?.url;
              return (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.id}`}
                  className={`group relative overflow-hidden rounded-[2rem] bg-[#102017] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div
                    className={`relative bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02] ${index === 0 ? "h-[460px]" : "h-[360px]"}`}
                    style={image ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.90), rgba(7,17,12,.08)), url(\"${image.replace(/\"/g, "%22")}\")` } : { backgroundImage: "linear-gradient(145deg,#153223,#07110c)" }}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                      <div className="flex items-end justify-between gap-6">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200">FreshPick creator</p>
                          <h3 className={`mt-3 font-serif font-normal leading-tight ${index === 0 ? "text-4xl md:text-5xl" : "text-3xl"}`}>{creator.name}</h3>
                          {creator.latestRecipe && <p className="mt-3 max-w-xl text-sm font-light leading-6 text-white/60">Latest: {creator.latestRecipe.title}</p>}
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-white/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2 text-[9px] font-medium uppercase tracking-[0.14em] text-white/45">
                        <span>{creator.recipeCount} recipe{creator.recipeCount === 1 ? "" : "s"}</span>
                        {creator.cuisines.slice(0, 2).map((cuisine) => <span key={cuisine}>· {cuisine}</span>)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
