import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import type { RecipeSummary } from '@/models/recipe';

export default function MarketDiscovery({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <section aria-labelledby="discovery-title" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="discovery-title" className="editorial-title">From market to table.</h2><p className="mt-2 text-sm text-muted-foreground">Recipes to try. Ingredients to shop.</p></div>
        <Link href="/recipes" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">All recipes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      {recipes.length > 0 ? <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
        {recipes.slice(0, 3).map((recipe) => <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group w-[85%] min-w-0 shrink-0 snap-start overflow-hidden md:w-auto">
          <div className="relative aspect-[3/2] overflow-hidden bg-secondary"><Image src={recipe.featuredImage?.url || '/placeholder.svg'} alt={recipe.featuredImage?.alt || recipe.title} fill sizes="(max-width: 767px) 85vw, (max-width: 1280px) 33vw, 390px" className={recipe.featuredImage?.url ? 'object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none' : 'object-contain p-16 opacity-50'} /></div>
          <div className="pt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">{recipe.cuisine ? <span>{recipe.cuisine}</span> : <span>From the kitchen</span>}{recipe.prepTimeMinutes + recipe.cookTimeMinutes > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>}</div>
            <h3 className="font-serif text-2xl font-normal leading-snug text-brand-green group-hover:underline underline-offset-4">{recipe.title}</h3>
            {recipe.authorName && <p className="mt-2 text-sm text-muted-foreground">By {recipe.authorName}</p>}
          </div>
        </Link>)}
      </div> : <div className="grid overflow-hidden md:grid-cols-[1fr_0.8fr]">
        <div className="flex flex-col items-start justify-center px-6 py-8 md:px-8"><p className="max-w-lg text-base leading-7 text-muted-foreground">Find inspiration for your next meal in our recipe collection.</p><Link href="/recipes" className="mt-5 inline-flex min-h-12 items-center gap-3 border-b border-current text-sm font-medium text-brand-green">Explore recipes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="relative aspect-[2/1] md:aspect-auto md:min-h-56"><Image src="/images/home/tomatoes.webp" alt="Fresh tomatoes on the vine" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
      </div>}
    </section>
  );
}
