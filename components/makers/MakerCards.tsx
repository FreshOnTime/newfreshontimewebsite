import Link from 'next/link';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { formatMakerDate, formatMakerPrice, makerImageSrc, makerItemPath, makerWhatsAppLink } from '@/lib/makers';

type Money = number | string | { toString(): string };

export function MakerPhoto({ image, name }: { image: string | null; name: string }) {
  const source = makerImageSrc(image);
  return source ? (
    // eslint-disable-next-line @next/next/no-img-element -- Supplier images may be hosted on different domains.
    <img src={source} alt={name} loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] w-full rounded-xl object-cover" />
  ) : (
    <div className="grid aspect-[4/3] place-items-center rounded-xl bg-brand-cream text-brand-green/30">
      <ImageOff size={28} aria-hidden="true" />
    </div>
  );
}

export function MakerItemCard({ handle, item }: {
  handle: string | null;
  item: { slug: string; name: string; kind: string; image: string | null; price: Money | null; madeToOrder: boolean };
}) {
  return <Link href={makerItemPath(handle, item.slug)} className="group block rounded-2xl border border-border p-3">
    <MakerPhoto image={item.image} name={item.name} />
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground">{item.kind}{item.madeToOrder ? ' · Made to order' : ''}</p>
      <h3 className="mt-1 flex items-center justify-between gap-3 font-serif text-xl text-brand-green">
        {item.name}<ArrowUpRight size={16} className="shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
      </h3>
      {item.price && <p className="mt-1 text-sm text-muted-foreground">{formatMakerPrice(item.price)}</p>}
    </div>
  </Link>;
}

export function BatchDetails({ batch, itemName, phone }: {
  batch: { note: string; price: Money; cutoff: Date; readyAt: Date };
  itemName: string;
  phone: string | null;
}) {
  const link = makerWhatsAppLink(phone, itemName, batch);
  return <div className="space-y-3 text-sm">
    <div>
      <p className="font-semibold text-brand-green">{formatMakerPrice(batch.price)}</p>
      <p className="mt-1 text-muted-foreground">Ready {formatMakerDate(batch.readyAt)} · Preorder by {formatMakerDate(batch.cutoff)}</p>
    </div>
    {batch.note && <p className="whitespace-pre-wrap break-words">{batch.note}</p>}
    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-green px-4 font-semibold text-white">
      Ask about this batch <ArrowUpRight size={15} aria-hidden="true" />
    </a>}
  </div>;
}
