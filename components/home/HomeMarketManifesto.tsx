import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** A quiet editorial moment, based on the genuine website journey, not unverified sourcing claims. */
export default function HomeMarketManifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="border-y border-brand-green-deep/15 bg-[#e9eadf]">
      <div className="editorial-wrap grid gap-7 py-14 md:grid-cols-[1fr_1.35fr] md:items-end md:gap-16 md:py-20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">The FreshPick idea</p>
          <h2 id="manifesto-title" className="mt-4 max-w-[14ch] font-heading text-[clamp(2.3rem,4vw,4.5rem)] font-semibold uppercase leading-[1.02] tracking-[-.055em] text-brand-green-deep">
            More than the weekly shop.
          </h2>
        </div>
        <div>
          <p className="max-w-[46ch] font-serif text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.3] text-brand-green-deep">
            From the ingredients for tonight&apos;s dinner to the small makers worth discovering. One market, with room for it all.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href="/farm-to-table" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green text-xs font-semibold uppercase tracking-[.1em] text-brand-green">
              Explore our producers <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green text-xs font-semibold uppercase tracking-[.1em] text-brand-green">
              How FreshPick works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
