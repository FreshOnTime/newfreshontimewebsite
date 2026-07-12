import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-[#faf8f3] text-[#142019]">
      <PremiumPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} backgroundImage={backgroundImage} />

      <section className="px-4 py-24 md:py-36">
        <div className="container mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b6d32]">{introLabel}</span>
            <h2 className="mt-7 max-w-lg font-serif text-4xl font-normal leading-tight md:text-6xl">{introTitle}</h2>
          </div>
          <div className="lg:pt-10">
            <p className="max-w-2xl text-lg font-light leading-9 text-zinc-600">{introCopy}</p>
            <Link href={ctaHref} className="mt-9 inline-flex items-center gap-4 border-b border-[#142019] pb-2 text-[10px] font-bold uppercase tracking-[0.2em]">
              {ctaLabel}<ArrowRight className="h-4 w-4 stroke-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4">
        <div className="container mx-auto grid max-w-7xl border-y border-zinc-200 md:grid-cols-3">
          {principles.map(({ icon: Icon, title: principleTitle, description }, index) => (
            <article key={principleTitle} className={`min-h-72 px-7 py-10 md:px-10 md:py-12 ${index > 0 ? "border-t border-zinc-200 md:border-l md:border-t-0" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm italic text-[#a07e3e]">0{index + 1}</span>
                <Icon className="h-5 w-5 stroke-1 text-emerald-800" />
              </div>
              <h3 className="mt-12 font-serif text-3xl font-normal">{principleTitle}</h3>
              <p className="mt-5 text-sm font-light leading-7 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-24 md:py-36">
        <div className="container mx-auto max-w-7xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b6d32]">{offeringLabel}</span>
          <h2 className="mt-6 max-w-4xl font-serif text-5xl font-normal leading-[1.05] md:text-7xl">{offeringTitle}</h2>
          <div className="mt-16 border-t border-zinc-300">
            {offerings.map((offering, index) => (
              <article key={offering.name} className="grid gap-5 border-b border-zinc-200 py-8 md:grid-cols-[5rem_1fr_1.4fr_auto] md:items-center md:gap-8">
                <span className="font-serif italic text-[#a07e3e]">0{index + 1}</span>
                <h3 className="font-serif text-2xl font-normal md:text-3xl">{offering.name}</h3>
                <p className="text-sm font-light leading-7 text-zinc-500">{offering.detail}</p>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">{offering.meta}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
