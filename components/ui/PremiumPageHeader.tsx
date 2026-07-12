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
  title,
  subtitle,
  backgroundImage,
  backgroundColor = "bg-[#08140f]",
  count,
  isLoading = false,
  eyebrow = "FreshPick · Colombo",
}: PremiumPageHeaderProps) {
  return (
    <section className={`relative flex min-h-[460px] items-end overflow-hidden text-white md:min-h-[560px] ${backgroundImage ? "" : backgroundColor}`}>
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            // Remote campaign images are already CDN-resized by their URL.
            // Deliver them directly instead of waiting for a cold serverless
            // image-optimizer invocation on the first visitor request.
            unoptimized={backgroundImage.startsWith('http')}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#09090b]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,189,122,0.08),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-20">
        {isLoading ? (
          <div className="max-w-3xl animate-pulse">
            <div className="h-3 w-48 bg-white/15" />
            <div className="mt-8 h-20 w-3/4 bg-white/10" />
            <div className="mt-8 h-5 w-1/2 bg-white/10" />
          </div>
        ) : (
          <div className="max-w-5xl">
            <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.34em] text-[#6ee7b7]">
              <span className="h-px w-10 bg-[#6ee7b7]/70" /> {eyebrow}
            </span>
            <h1 className="mt-7 max-w-5xl font-serif text-5xl font-normal leading-[0.9] tracking-[-0.035em] text-[#ffffff] md:text-7xl lg:text-8xl">
              {title}
            </h1>
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              {subtitle && <p className="max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">{subtitle}</p>}
              {count !== undefined && (
                <span className="w-fit border-b border-[#6ee7b7]/60 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d1fae5]">
                  {count} curated {count === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
