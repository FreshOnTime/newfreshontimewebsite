import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BrandStory() {
  return (
    <section aria-labelledby="sourcing-title" className="editorial-wrap py-14 md:py-20">
      <div className="grid items-center gap-9 border-t border-brand-green-deep/20 pt-11 md:grid-cols-2 md:gap-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">Meet the people behind the food</p>
          <h2 id="sourcing-title" className="mt-5 max-w-[13ch] font-heading text-[clamp(2.1rem,4vw,4.4rem)] font-semibold uppercase leading-[1.02] tracking-[-.055em] text-brand-green-deep">
            Food has a story. So do its makers.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
            From fresh ingredients to food made in small kitchens, discover the growers, makers and businesses that make a neighbourhood market worth exploring.
          </p>
          <div className="mt-7 flex flex-wrap gap-7">
            <Link href="/farm-to-table" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">
              Our producers <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/about" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">
              Our story <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="relative aspect-[5/4] bg-secondary">
          <Image src="/images/editorial/hands-at-work.webp" alt="Hands preparing food in a kitchen" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

export function BusinessStory() {
  return (
    <section aria-labelledby="business-title" className="editorial-wrap pb-14 md:pb-20">
      <div className="grid border-y border-brand-green-deep/20 md:grid-cols-2">
        <div className="relative min-h-[270px] bg-secondary sm:min-h-[350px]">
          <Image src="/images/editorial/restaurant-kitchen.webp" alt="Food being prepared in a restaurant kitchen" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-[#e9eadf] px-6 py-11 sm:px-9 lg:px-14">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">FreshPick for business</p>
          <h2 id="business-title" className="mt-5 max-w-[17ch] font-heading text-[clamp(2rem,3.4vw,3.75rem)] font-semibold uppercase leading-[1.04] tracking-[-.055em] text-brand-green-deep">
            Great food starts with good ingredients.
          </h2>
          <p className="mt-5 max-w-[39ch] text-base leading-8 text-muted-foreground">
            Restaurants, cafés, hotels and workplaces can enquire about food sourcing and regular supply arrangements.
          </p>
          <Link href="/b2b" className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">
            Explore business supply <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
