import Image from "next/image";

interface PremiumPageHeaderProps {
  title: string; subtitle?: string; backgroundImage?: string | null; backgroundColor?: string;
  count?: number; isLoading?: boolean; eyebrow?: string;
  imageLayout?: 'feature' | 'compact';
}

/** Bold editorial introductions; browsing pages can keep their photography compact. */
export default function PremiumPageHeader({ title, subtitle, backgroundImage, count, isLoading = false, eyebrow, imageLayout = 'feature' }: PremiumPageHeaderProps) {
  const compact = imageLayout === 'compact';
  return (
    <section className="border-b border-border bg-background">
      <div className="editorial-wrap py-9 md:py-14">
        {isLoading ? <div className="max-w-xl animate-pulse" role="status" aria-label="Loading page"><div className="h-12 w-3/4 bg-muted" /><div className="mt-5 h-4 w-1/2 bg-muted" /></div> : <>
          <div className={compact && backgroundImage ? 'grid items-center gap-7 md:grid-cols-[1fr_0.45fr] md:gap-12' : ''}>
            <div>
              {eyebrow && <p className="editorial-label mb-5">{eyebrow}</p>}
              <div className={!compact && backgroundImage ? 'grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-14' : ''}>
                <h1 className={compact ? 'max-w-4xl font-sans text-[clamp(2.2rem,5vw,4.5rem)] font-bold uppercase leading-[1.02] text-foreground' : 'max-w-5xl font-sans text-[clamp(2.4rem,6vw,5.5rem)] font-bold uppercase leading-[1.02] text-foreground'}>{title}</h1>
                {(subtitle || count !== undefined) && <div className={backgroundImage && !compact ? '' : 'mt-5'}>
                  {subtitle && <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>}
                  {count !== undefined && <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">{count} {count === 1 ? 'item' : 'items'}</p>}
                </div>}
              </div>
            </div>
            {backgroundImage && compact && <div className="relative aspect-[16/9] max-h-48 overflow-hidden rounded-xl bg-secondary"><Image src={backgroundImage} alt="" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 30vw, 395px" className="object-cover" /></div>}
          </div>
          {backgroundImage && !compact && <div className="relative mt-9 aspect-[4/3] overflow-hidden rounded-xl bg-secondary md:aspect-[2.4/1]"><Image src={backgroundImage} alt="" fill sizes="(max-width: 1440px) 100vw, 1360px" className="object-cover" /></div>}
        </>}
      </div>
    </section>
  );
}
