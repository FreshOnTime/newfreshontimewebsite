import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatMakerDate, formatMakerPrice, makerItemPath, makerWhatsAppLink } from '@/lib/makers';

type Money = number | string | { toString(): string };

export {MakerPhoto} from './MakerPhoto';
import {MakerPhoto} from './MakerPhoto';

export function MakerItemCard({ handle, item, makerName, makerTown, menuItem=false }: {
  handle: string | null;
  makerName?: string;
  makerTown?: string | null;
  menuItem?:boolean;
  item: { slug: string; name: string; kind: string; image: string | null; price: Money | null; madeToOrder: boolean };
}) {
  return <Link href={makerItemPath(handle, item.slug)} className="fp-item-card group block">
    <div className="journal-card-media"><MakerPhoto image={item.image} name={item.name} /></div>
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground">{menuItem?'Menu item':item.kind}{!menuItem&&item.madeToOrder ? ' · Made to order' : ''}</p>
      <h3 className="mt-1 flex items-center justify-between gap-3 font-serif text-xl text-brand-green">
        {item.name}<ArrowUpRight size={16} className="shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
      </h3>
      {makerName && <p className="journal-card-origin">{makerName}{makerTown ? ` · ${makerTown}` : ""}</p>}
      {item.price != null && <p className="mt-1 text-sm text-muted-foreground">{formatMakerPrice(item.price)}</p>}
    </div>
  </Link>;
}

export function BatchDetails({ batch, itemName, phone, itemPath }: {
  batch: { note: string; price: Money; cutoff: Date; readyAt: Date };
  itemName: string;
  phone: string | null;
  itemPath?: string;
}) {
  const link = makerWhatsAppLink(phone, itemName, batch, itemPath);
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
