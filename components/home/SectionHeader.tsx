import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  accent?: "green" | "orange" | "purple" | "red" | "blue";
  className?: string;
}

export default function SectionHeader({ title, subtitle, ctaHref, ctaLabel = "View all", className }: SectionHeaderProps) {
  return (
    <div className={`mb-14 flex flex-col justify-between gap-7 border-b border-[#d8d0c1] pb-10 md:flex-row md:items-end ${className ?? ""}`}>
      <div>
        <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.32em] text-[#8b6d32]">The FreshPick edit</span>
        <h2 className="font-serif text-4xl font-normal leading-tight text-[#142019] md:text-6xl">{title}</h2>
        {subtitle && <p className="mt-5 max-w-2xl text-base font-light leading-7 text-zinc-500">{subtitle}</p>}
      </div>
      {ctaHref && (
        <Link href={ctaHref} className="group inline-flex items-center text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
          {ctaLabel}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
