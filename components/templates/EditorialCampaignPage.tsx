import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

type Principle = { icon: LucideIcon; title: string; description: string };
type Offering = { name: string; detail: string; meta: string };
interface EditorialCampaignPageProps {
  eyebrow: string; title: string; subtitle: string; backgroundImage: string;
  introLabel: string; introTitle: string; introCopy: string; principles: Principle[];
  offeringLabel: string; offeringTitle: string; offerings: Offering[]; ctaLabel: string; ctaHref: string;
}

export default function EditorialCampaignPage({ title, subtitle, introTitle, introCopy, principles, offeringTitle, offerings, ctaLabel, ctaHref }: EditorialCampaignPageProps) {
  return (
    <main className="bg-background">
      <PremiumPageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-2xl font-semibold">{introTitle}</h2>
          <div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{introCopy}</p>
            <Link href={ctaHref} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-amber px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">{ctaLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </section>
        <section className="mt-10 grid gap-6 border-y border-border py-8 md:grid-cols-3">
          {principles.map(({ icon: Icon, title: principleTitle, description }) => (
            <div key={principleTitle}>
              <Icon className="mb-3 h-5 w-5 text-brand-green" aria-hidden="true" />
              <h3 className="text-base font-semibold">{principleTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
        <section className="py-8">
          <h2 className="mb-5 text-2xl font-semibold">{offeringTitle}</h2>
          <div className="divide-y divide-border">
            {offerings.map(offering => (
              <div key={offering.name} className="grid gap-3 py-5 md:grid-cols-[1fr_2fr_auto] md:items-start">
                <h3 className="font-semibold">{offering.name}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{offering.detail}</p>
                <span className="text-xs font-medium text-brand-green">{offering.meta}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
