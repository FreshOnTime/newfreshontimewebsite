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

export default function PremiumPageHeader({
  title, subtitle, backgroundImage, backgroundColor = "bg-background",
  count, isLoading = false, eyebrow = "FreshPick · Colombo",
}: PremiumPageHeaderProps) {
  return (
    <section className={`border-b border-border py-10 md:py-12 ${backgroundColor}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 md:px-8">
        {isLoading ? (
          <div className="max-w-3xl animate-pulse" role="status" aria-label="Loading page">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-5 h-12 w-3/4 rounded bg-muted" />
            <div className="mt-5 h-5 w-1/2 rounded bg-muted" />
          </div>
        ) : (
          <div className={`grid items-center gap-8 ${backgroundImage ? "md:grid-cols-[1fr_0.6fr]" : ""}`}>
            <div>
              <p className="text-sm font-medium text-brand-green">{eyebrow}</p>
              <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-brand-green md:text-5xl">{title}</h1>
              {subtitle && <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{subtitle}</p>}
              {count !== undefined && <p className="mt-4 text-sm text-brand-green">{count} {count === 1 ? "item" : "items"}</p>}
            </div>
            {backgroundImage && (
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-secondary">
                <Image src={backgroundImage} alt="" fill priority sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
