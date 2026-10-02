import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChefHat } from "lucide-react";
import type { CreatorSummary } from "@/lib/creatorService";

export default function CreatorNetwork({ creators }: { creators: CreatorSummary[] }) {
  if (!creators.length) return null;

  return (
    <section aria-labelledby="creators-title" className="mx-auto max-w-7xl px-4 pb-10 md:px-8 md:pb-14">
      <div className="border-t border-border pt-8 md:grid md:grid-cols-[1fr_2fr] md:gap-12 md:pt-10">
        <div>
          <p className="text-xs font-medium text-muted-foreground">People behind the food</p>
          <h2 id="creators-title" className="mt-3 editorial-title">From local kitchens</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Meet the people sharing their favourite recipes.</p>
          <Link href="/creators" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">Meet the cooks <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-6 grid content-start gap-5 md:mt-0 xl:grid-cols-2">
          {creators.map((creator) => (
            <Link key={creator.id} href={`/creators/${creator.id}`} className="group flex items-center gap-4  py-2">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden  bg-secondary">
                {creator.latestRecipe?.image?.url ? <Image src={creator.latestRecipe.image.url} alt={creator.latestRecipe.title} fill sizes="96px" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ChefHat className="h-8 w-8 text-brand-green" aria-hidden="true" /></div>}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold uppercase text-foreground group-hover:underline">{creator.name}</h3>
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
