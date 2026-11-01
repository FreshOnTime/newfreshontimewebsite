import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return <section aria-labelledby="sourcing-title" className="editorial-wrap py-12 md:py-16 scroll-reveal">
    <div className="grid items-center gap-8 border-t border-border pt-10 md:grid-cols-2 md:gap-14">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src="/images/about/everyday-kitchen.webp" alt="Fresh vegetables, fruit and rice ready for cooking in a home kitchen" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
      <div><p className="editorial-label mb-4">FreshPick, for your everyday</p><h2 id="sourcing-title" className="editorial-title">A market that fits your home.</h2><p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">The vegetables for dinner. Fruit for the family. Pantry staples, something homemade and a drink to share. FreshPick brings everyday food shopping together, with room for the growers and small businesses behind it.</p><div className="mt-5 flex flex-wrap gap-x-7 gap-y-2"><Link href="/about" className="editorial-link">About FreshPick <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/farm-to-table" className="editorial-link">Our producers <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
    </div>
  </section>;
}

export function BusinessStory() {
  return <section aria-labelledby="business-title" className="editorial-wrap pb-12 md:pb-16">
    <div className="grid min-w-0 overflow-hidden rounded-[1.75rem] bg-brand-green-deep text-white md:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)]">
      <div className="relative min-h-[250px] bg-brand-green md:min-h-[330px]">
        <Image src="/images/editorial/restaurant-kitchen.webp" alt="Food being prepared at a restaurant kitchen counter" fill sizes="(max-width: 767px) 100vw, 48vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center px-7 py-10 sm:px-10 sm:py-12 lg:px-14">
        <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/75">FreshPick for business</p>
        <h2 id="business-title" className="mt-4 font-heading text-3xl font-semibold leading-[1.1] tracking-[-.045em] text-white sm:text-4xl">Good ingredients.<br />For a bigger table.</h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/80">Restaurants, cafés, hotels and workplaces can enquire about sourcing and regular food supply. Tell us what you need.</p>
        <Link href="/b2b" className="mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-full border border-white/65 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-green-deep">Explore business supply <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
