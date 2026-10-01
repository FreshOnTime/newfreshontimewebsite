import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";
import { listCreators } from "@/lib/creatorService";

export default async function CreatorNetwork() {
  const creators = await listCreators(4).catch(() => []);
  if (!creators.length) return null;

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-brand-green">From local kitchens</h2>
            <p className="mt-3 text-muted-foreground">Meet the people sharing their favourite recipes.</p>
          </div>
          <Link href="/creators" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline">Meet the cooks <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((creator) => (
            <Link key={creator.id} href={`/creators/${creator.id}`} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green">
              <div className="relative aspect-[4/3] bg-secondary">
                {creator.latestRecipe?.image?.url ? <Image src={creator.latestRecipe.image.url} alt={creator.latestRecipe.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ChefHat className="h-10 w-10 text-brand-green" aria-hidden="true" /></div>}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-brand-green">{creator.name}</h3>
                {creator.latestRecipe && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{creator.latestRecipe.title}</p>}
                <p className="mt-3 text-sm text-muted-foreground">{creator.recipeCount} recipe{creator.recipeCount === 1 ? "" : "s"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
