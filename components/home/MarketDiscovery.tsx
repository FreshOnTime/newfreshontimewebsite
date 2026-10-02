import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { RecipeSummary } from '@/models/recipe';

export default function MarketDiscovery({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <section aria-labelledby="discovery-title" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-t border-border pt-10 md:pt-12">
        <div><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">From the kitchen</p><h2 id="discovery-title" className="home-display mt-3 text-3xl leading-tight text-brand-green md:text-[2.5rem]">Something good to make.</h2></div>
        <Link href="/recipes" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand-green underline-offset-4 hover:underline">All recipes <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      {recipes.length > 0 ? <div className="mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
        {recipes.slice(0, 3).map((recipe) => <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group w-[82%] min-w-0 shrink-0 snap-start md:w-auto">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary"><Image src={recipe.featuredImage?.url || '/placeholder.svg'} alt={recipe.featuredImage?.alt || recipe.title} fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 33vw, 390px" className={recipe.featuredImage?.url ? 'object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none' : 'object-contain p-16 opacity-50'} /></div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{recipe.cuisine && <span>{recipe.cuisine}</span>}{recipe.prepTimeMinutes + recipe.cookTimeMinutes > 0 && <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>}</div>
          <h3 className="mt-2 text-lg font-medium leading-snug text-brand-green group-hover:underline underline-offset-4">{recipe.title}</h3>
          {recipe.authorName && <p className="mt-2 text-xs text-muted-foreground">By {recipe.authorName}</p>}
        </Link>)}
      </div> : <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">Explore recipes and shop the ingredients for your next meal.</p>}
      <div className="mt-10 grid border-y border-border md:grid-cols-2">
        <Link href="/meals" className="group flex items-center justify-between gap-5 border-b border-border py-6 md:border-b-0 md:border-r md:pr-8"><div><h3 className="text-lg font-medium text-brand-green group-hover:underline">Let someone else cook.</h3><p className="mt-2 text-sm text-muted-foreground">Explore ready meals.</p></div><ArrowUpRight className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" /></Link>
        <Link href="/subscriptions" className="group flex items-center justify-between gap-5 py-6 md:pl-8"><div><h3 className="text-lg font-medium text-brand-green group-hover:underline">Make it a regular thing.</h3><p className="mt-2 text-sm text-muted-foreground">Explore recurring grocery baskets.</p></div><ArrowUpRight className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
