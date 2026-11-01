import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** An editorial entry to the actual recurring-basket catalogue, without implying automatic card billing. */
export default function HomeBasketFeature() {
  return (
    <section aria-labelledby="basket-feature-title" className="editorial-wrap py-9 md:py-12">
      <div className="grid min-w-0 overflow-hidden rounded-[1.75rem] bg-brand-green-deep text-white lg:grid-cols-[1.04fr_.96fr]">
        <div className="flex flex-col justify-center px-7 py-11 sm:px-11 sm:py-14 xl:px-16">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/75">For your weekly routine</p>
          <h2 id="basket-feature-title" className="mt-4 max-w-[16ch] font-heading text-3xl font-semibold leading-[1.1] tracking-[-.045em] text-white sm:text-4xl xl:text-5xl">
            A little less planning. A lot more good food.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
            Explore available recurring grocery baskets for the everyday essentials. Choose a plan that fits your home and manage it from your account.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link href="/subscriptions" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-green-deep transition-colors hover:bg-brand-cream">
              Explore basket plans <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/how-it-works/customers" className="inline-flex min-h-11 items-center text-sm font-medium text-white underline decoration-white/45 underline-offset-4 hover:decoration-white">
              How it works
            </Link>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/65">Available plans only. Cash on delivery, with no automatic card billing.</p>
        </div>
        <div className="relative min-h-[260px] bg-brand-green sm:min-h-[320px] lg:min-h-[390px]">
          <Image
            src="/images/home/market-bag.webp"
            alt="A bag of groceries selected for home cooking"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
