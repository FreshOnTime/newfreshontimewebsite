import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** A Natoora-inspired editorial feature, linked to real subscription plans. */
export default function HomeBasketFeature() {
  return (
    <section aria-labelledby="basket-feature-title" className="editorial-wrap py-12 md:py-20">
      <div className="grid min-w-0 gap-0 border-y border-brand-green-deep/20 md:grid-cols-2">
        <div className="relative min-h-[285px] bg-secondary sm:min-h-[365px] lg:min-h-[480px]">
          <Image
            src="/images/editorial/kitchen-basket.webp"
            alt="A food basket for home cooking"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center bg-brand-cream px-5 py-10 sm:px-8 lg:px-14 lg:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">A regular ritual</p>
          <h2 id="basket-feature-title" className="mt-5 max-w-[15ch] font-heading text-[clamp(2.2rem,4vw,4.8rem)] font-semibold uppercase leading-[1.02] tracking-[-.055em] text-brand-green-deep">
            Good food. On your schedule.
          </h2>
          <p className="mt-6 max-w-[43ch] text-base leading-8 text-foreground/75">
            Browse available recurring baskets and choose what works for your home. Manage your schedule in your FreshPick account.
          </p>
          <Link href="/subscriptions" className="mt-7 inline-flex min-h-12 w-fit items-center gap-3 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.13em] text-brand-green-deep">
            Browse basket plans <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-7 text-xs leading-6 text-muted-foreground">
            Available plans only. Cash on delivery, with no automatic card billing.
          </p>
        </div>
      </div>
    </section>
  );
}
