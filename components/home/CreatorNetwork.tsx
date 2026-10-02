import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChefHat } from "lucide-react";
import type { CreatorSummary } from "@/lib/creatorService";

export default function CreatorNetwork({ creators }: { creators: CreatorSummary[] }) {
  if (!creators.length) return null;

  return (
    <section aria-labelledby="creators-title" className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
      <div className="pt-0 md:grid md:grid-cols-[1fr_2fr] md:gap-12 md:pt-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">People behind the food</p>
          <h2 id="creators-title" className="home-display mt-3 text-3xl leading-tight text-brand-green md:text-[2.5rem]">From local kitchens</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Meet the people sharing their favourite recipes.</p>
          <Link href="/creators" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">Meet the cooks <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-6 grid content-start gap-5 md:mt-0 xl:grid-cols-2">
          {creators.map((creator) => (
            <Link key={creator.id} href={`/creators/${creator.id}`} className="group flex items-center gap-4 rounded-lg py-2">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {creator.latestRecipe?.image?.url ? <Image src={creator.latestRecipe.image.url} alt={creator.latestRecipe.title} fill sizes="96px" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ChefHat className="h-8 w-8 text-brand-green" aria-hidden="true" /></div>}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-brand-green group-hover:underline">{creator.name}</h3>
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
