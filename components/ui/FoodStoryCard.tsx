import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Utensils } from "lucide-react";

interface FoodStoryCardProps {
  href: string;
  title: string;
  image?: string;
  description?: string;
  label?: string;
  meta?: string;
  action?: string;
}

export default function FoodStoryCard({ href, title, image, description, label, meta, action = "View details" }: FoodStoryCardProps) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green">
      <div className="relative aspect-[4/3] bg-secondary">
        {image ? <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><Utensils className="h-8 w-8 text-brand-green/50" aria-hidden="true" /></div>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {label && <p className="mb-2 text-xs font-medium text-brand-green">{label}</p>}
        <h2 className="text-xl font-semibold leading-snug text-foreground">{title}</h2>
        {description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-sm">
          {meta && <span className="text-muted-foreground">{meta}</span>}
          <span className="inline-flex items-center gap-2 font-medium text-brand-green">{action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}
