import Image from "next/image";
import { Activity, Layers3, Sparkles } from "lucide-react";

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
  backgroundColor = "bg-[#07100b]",
  count,
  isLoading = false,
  eyebrow = "FreshPick · Colombo",
}: PremiumPageHeaderProps) {
  return (
    <section className={`relative isolate flex min-h-[470px] items-end overflow-hidden text-white md:min-h-[560px] ${backgroundImage ? "" : backgroundColor}`}>
      {backgroundImage && (
        <div className="absolute inset-0 -z-20">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#06100a]/68" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06100a]/95 via-[#06100a]/66 to-[#06100a]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06100a] via-transparent to-black/25" />
        </div>
      )}

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(52,211,153,0.14),transparent_28%),radial-gradient(circle_at_86%_60%,rgba(163,230,53,0.07),transparent_24%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-18">
        {isLoading ? (
          <div className="max-w-3xl animate-pulse">
            <div className="h-3 w-48 rounded-full bg-white/15" />
            <div className="mt-8 h-20 w-3/4 rounded-3xl bg-white/10" />
            <div className="mt-8 h-5 w-1/2 rounded-full bg-white/10" />
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div className="max-w-5xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
              </span>
              <h1 className="mt-7 max-w-5xl text-balance font-serif text-5xl font-normal leading-[0.9] tracking-[-0.04em] text-white md:text-7xl lg:text-8xl">
                {title}
              </h1>
              {subtitle && <p className="mt-7 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">{subtitle}</p>}
            </div>

            <aside className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/32">FreshPick platform</span>
                <Activity className="h-4 w-4 text-emerald-200/70" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/45">Experience</span>
                  <span className="text-white/72">Taste-first</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/45">Commerce</span>
                  <span className="text-white/72">Live catalogue</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/45">Network</span>
                  <span className="text-white/72">Local partners</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-black/15 px-3 py-3">
                <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-emerald-200/80"><Layers3 className="h-3.5 w-3.5" /> Connected food layer</span>
                {count !== undefined && <span className="text-xs text-white/65">{count} items</span>}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
