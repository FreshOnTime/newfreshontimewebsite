import Image from "next/image";

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  backgroundColor?: string;
  count?: number;
  isLoading?: boolean;
  eyebrow?: string;
}

/** Compact page introduction shared by storefront and information pages. */
export default function PremiumPageHeader({ title, subtitle, backgroundImage, count, isLoading = false, eyebrow }: PremiumPageHeaderProps) {
  return (
    <section className="border-b border-border bg-background py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {isLoading ? (
          <div className="max-w-xl animate-pulse" role="status" aria-label="Loading page">
            <div className="h-9 w-3/4 rounded bg-muted" />
            <div className="mt-4 h-4 w-1/2 rounded bg-muted" />
          </div>
        ) : (
          <div className={`grid items-center gap-6 ${backgroundImage ? "md:grid-cols-[1fr_240px]" : ""} `}>
            <div>
              {eyebrow && <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>}
              <h1 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.035em] text-brand-green md:text-4xl">{title}</h1>
              {subtitle && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{subtitle}</p>}
              {count !== undefined && <p className="mt-3 text-sm text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>}
            </div>
            {backgroundImage && <div className="relative hidden aspect-[3/2] overflow-hidden rounded-xl bg-secondary md:block"><Image src={backgroundImage} alt="" fill sizes="240px" className="object-cover" /></div>}
          </div>
        )}
      </div>
    </section>
  );
}
