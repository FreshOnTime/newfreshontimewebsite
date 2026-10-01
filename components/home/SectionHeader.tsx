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
    <div className={`mb-14 flex flex-col justify-between gap-7 border-b border-[#e4e4e7] pb-10 md:flex-row md:items-end ${className ?? ""} `}>
      <div>
        <span className="mb-5 block text-xs font-bold normal-case text-brand-green">The FreshPick edit</span>
        <h2 className="font-sans text-2xl font-semibold leading-tight text-foreground md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-zinc-500">{subtitle}</p>}
      </div>
      {ctaHref && (
        <Link href={ctaHref} className="group inline-flex items-center text-xs font-bold normal-case text-emerald-800">
          {ctaLabel}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
