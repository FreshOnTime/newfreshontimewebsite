import Image from "next/image";

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  backgroundColor?: string;
  count?: number;
  isLoading?: boolean;
  eyebrow?: string;
  imageLayout?: "feature" | "compact";
}

/** A consistent editorial introduction, shared by public market, discovery, and information pages. */
export default function PremiumPageHeader({
  title,
  subtitle,
  backgroundImage,
  count,
  isLoading = false,
  eyebrow,
  imageLayout = "feature",
}: PremiumPageHeaderProps) {
  const compact = imageLayout === "compact";
  return (
    <section className="relative isolate overflow-hidden border-b border-border premium-intro" aria-label="Page introduction">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_0%,rgba(132,151,122,.18),transparent_44%)]" />
      <div className="editorial-wrap relative py-8 sm:py-12 lg:py-16">
        {isLoading ? (
          <div className="max-w-xl space-y-5" role="status" aria-label="Loading page">
            <div className="h-4 w-40 animate-pulse rounded-full bg-brand-green/10 motion-reduce:animate-none" />
            <div className="h-16 w-3/4 animate-pulse rounded-xl bg-brand-green/10 motion-reduce:animate-none" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-brand-green/10 motion-reduce:animate-none" />
          </div>
        ) : (
          <div className={backgroundImage ? "grid min-w-0 items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.91fr)] lg:gap-14" : "grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)] lg:items-end"}>
            <div className="min-w-0 py-3 lg:py-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9df6d2]">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-amber" aria-hidden="true" />
                <span>{eyebrow || "The FreshPick market"}</span>
                <span className="h-px w-8 bg-brand-green/25" aria-hidden="true" />
                <span className="text-white/70">Colombo, Sri Lanka</span>
              </div>
              <h1 className="max-w-[16ch] font-heading text-[clamp(2.65rem,6.2vw,6.15rem)] font-semibold leading-[1.025] tracking-[-0.055em] text-white [text-wrap:balance]">{title}</h1>
              {subtitle && <p className="mt-6 max-w-[47ch] text-base leading-[1.8] text-white/80 sm:text-lg">{subtitle}</p>}
              {count !== undefined && <p className="mt-6 inline-flex rounded-full border border-brand-green/15 bg-black/60 px-4 py-2 text-xs font-semibold text-[#9df6d2]" aria-live="polite">{count} {count === 1 ? "item" : "items"} in this selection</p>}
            </div>
            {backgroundImage ? (
              <div className={"relative isolate overflow-hidden rounded-[1.5rem] bg-secondary shadow-[0_20px_70px_-35px_rgba(16,46,30,.3)] " + (compact ? "aspect-[5/3] lg:aspect-[5/4]" : "aspect-[4/3] lg:aspect-[5/4]")}>
                <Image src={backgroundImage} alt="" fill sizes="(max-width: 1023px) 100vw, 48vw" className="object-cover transition-transform duration-700 motion-safe:hover:scale-[1.025]" priority={false} />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-green-deep/55 to-transparent" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
