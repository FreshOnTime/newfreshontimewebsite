import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';

type Principle = { icon: LucideIcon; title: string; description: string };
type Offering = { name: string; detail: string; meta: string };
interface EditorialCampaignPageProps {
  eyebrow: string; title: string; subtitle: string; backgroundImage: string;
  introLabel: string; introTitle: string; introCopy: string; principles: Principle[];
  offeringLabel: string; offeringTitle: string; offerings: Offering[]; ctaLabel: string; ctaHref: string;
}
export default function EditorialCampaignPage({ eyebrow, title, subtitle, backgroundImage, introLabel, introTitle, introCopy, principles, offeringLabel, offeringTitle, offerings, ctaLabel, ctaHref }: EditorialCampaignPageProps) {
  return <div className="bg-background"><PremiumPageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} backgroundImage={backgroundImage} /><div className="editorial-wrap editorial-section"><section className="grid gap-7 md:grid-cols-[1fr_1.4fr] md:gap-20"><div><p className="editorial-label mb-4">{introLabel}</p><h2 className="editorial-title">{introTitle}</h2></div><div><p className="max-w-2xl text-base leading-8 text-muted-foreground">{introCopy}</p><Link href={ctaHref} className="editorial-button mt-7">{ctaLabel}<ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" /></Link></div></section><section className="my-12 divide-y divide-border border-y border-border md:my-20">{principles.map(({ title: principleTitle, description },index) => <div key={principleTitle} className="grid gap-3 py-6 md:grid-cols-[60px_1fr_1.5fr] md:gap-7"><span className="text-xs text-muted-foreground">0{index+1}</span><h3 className="font-serif text-2xl font-normal text-brand-green">{principleTitle}</h3><p className="text-sm leading-7 text-muted-foreground">{description}</p></div>)}</section><section><p className="editorial-label mb-4">{offeringLabel}</p><h2 className="editorial-title mb-8">{offeringTitle}</h2><div className="divide-y divide-border">{offerings.map(offering => <div key={offering.name} className="grid gap-3 py-6 md:grid-cols-[1fr_1.5fr_auto] md:gap-8"><h3 className="font-serif text-2xl font-normal text-brand-green">{offering.name}</h3><p className="text-sm leading-7 text-muted-foreground">{offering.detail}</p><span className="text-xs text-muted-foreground">{offering.meta}</span></div>)}</div></section><div className="relative mt-12 aspect-[3/1] overflow-hidden bg-secondary"><Image src="/images/home/tomatoes.webp" alt="Fresh ingredients at the market" fill sizes="100vw" className="object-cover" /></div></div></div>;
}
