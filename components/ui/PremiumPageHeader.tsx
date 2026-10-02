import Image from "next/image";

interface PremiumPageHeaderProps {
  title: string; subtitle?: string; backgroundImage?: string | null; backgroundColor?: string;
  count?: number; isLoading?: boolean; eyebrow?: string;
  imageLayout?: 'feature' | 'compact';
}
/** Shared editorial introduction, with a generous image when a story has one. */
export default function PremiumPageHeader({ title, subtitle, backgroundImage, count, isLoading = false, eyebrow, imageLayout = 'feature' }: PremiumPageHeaderProps) {
  return (
    <section className="border-b border-border bg-background">
      <div className="editorial-wrap py-9 md:py-14">
        {isLoading ? <div className="max-w-xl animate-pulse" role="status" aria-label="Loading page"><div className="h-12 w-3/4 rounded bg-muted" /><div className="mt-5 h-4 w-1/2 rounded bg-muted" /></div> :
          <div className={`grid items-center gap-8 ${backgroundImage ? imageLayout === 'compact' ? 'md:grid-cols-[1fr_0.55fr] md:gap-10' : 'md:grid-cols-2 md:gap-16' : ''}`}>
            <div>{eyebrow && <p className="editorial-label mb-5">{eyebrow}</p>}<h1 className="max-w-3xl font-serif text-[2.6rem] font-normal leading-[1.06] text-brand-green md:text-6xl">{title}</h1>{subtitle && <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">{subtitle}</p>}{count !== undefined && <p className="mt-5 text-xs text-muted-foreground">{count} {count === 1 ? 'item' : 'items'}</p>}</div>
            {backgroundImage && <div className={`relative overflow-hidden bg-secondary ${imageLayout === 'compact' ? 'aspect-[16/9] max-h-48' : 'aspect-[4/3]'}`}><Image src={backgroundImage} alt="" fill sizes={imageLayout === 'compact' ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 35vw, 425px' : '(max-width: 767px) calc(100vw - 40px), 50vw'} className="object-cover" /></div>}
          </div>}
      </div>
    </section>
  );
}
