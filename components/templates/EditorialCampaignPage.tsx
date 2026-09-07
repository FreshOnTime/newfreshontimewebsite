import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

type Principle = { icon: LucideIcon; title: string; description: string };
type Offering = { name: string; detail: string; meta: string };

interface EditorialCampaignPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  introLabel: string;
  introTitle: string;
  introCopy: string;
  principles: Principle[];
  offeringLabel: string;
  offeringTitle: string;
  offerings: Offering[];
  ctaLabel: string;
  ctaHref: string;
}

export default function EditorialCampaignPage({
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  introLabel,
  introTitle,
  introCopy,
  principles,
  offeringLabel,
  offeringTitle,
  offerings,
  ctaLabel,
  ctaHref,
}: EditorialCampaignPageProps) {
  return (
    <main className="min-h-screen bg-[#f4f6f2] text-zinc-950">
      <PremiumPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} backgroundImage={backgroundImage} />

      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-zinc-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(10,30,18,0.045)] md:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> {introLabel}
            </span>
            <h2 className="mt-6 max-w-lg text-balance font-serif text-4xl font-normal leading-[0.98] tracking-[-0.03em] md:text-6xl">{introTitle}</h2>
          </div>
          <div className="lg:pt-8">
            <p className="max-w-2xl text-base font-light leading-8 text-zinc-600 md:text-lg">{introCopy}</p>
            <Link href={ctaHref} className="group mt-8 inline-flex items-center gap-3 rounded-full bg-zinc-950 px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-emerald-950">
              {ctaLabel}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:pb-28">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">How the experience works</p>
              <h2 className="mt-4 font-serif text-3xl font-normal tracking-[-0.02em] text-zinc-950 md:text-5xl">Designed as a connected system.</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title: principleTitle, description }, index) => (
              <article key={principleTitle} className="group flex min-h-[310px] flex-col rounded-[1.75rem] border border-zinc-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_70px_rgba(10,70,40,0.07)] md:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-400">0{index + 1}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900 ring-1 ring-emerald-900/5">
                    <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
                  </span>
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="font-serif text-3xl font-normal leading-tight tracking-[-0.02em]">{principleTitle}</h3>
                  <p className="mt-4 text-sm font-light leading-7 text-zinc-500">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07100b] px-4 py-20 text-white md:py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-200">{offeringLabel}</span>
              <h2 className="mt-5 max-w-3xl text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] md:text-7xl">{offeringTitle}</h2>
            </div>
            <p className="max-w-xl text-sm font-light leading-7 text-white/45 lg:justify-self-end">Every surface should communicate why it belongs inside the FreshPick platform, not look like a disconnected marketing template.</p>
          </div>

          <div className="mt-12 grid gap-3">
            {offerings.map((offering, index) => (
              <article key={offering.name} className="group grid gap-5 rounded-[1.4rem] border border-white/[0.08] bg-white/[0.035] p-5 transition-colors hover:bg-white/[0.055] md:grid-cols-[4rem_1fr_1.4fr_auto] md:items-center md:gap-7 md:p-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200/60">0{index + 1}</span>
                <h3 className="font-serif text-2xl font-normal text-white md:text-3xl">{offering.name}</h3>
                <p className="text-sm font-light leading-7 text-white/45">{offering.detail}</p>
                <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                  {offering.meta}<ArrowUpRight className="h-3.5 w-3.5 text-emerald-200/50" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
