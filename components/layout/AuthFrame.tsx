import Image from 'next/image';
import type { ReactNode } from 'react';

export default function AuthFrame({ children }: { children: ReactNode }) {
  return <div className="editorial-wrap grid min-h-[70vh] py-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-10"><aside className="relative hidden min-h-[680px] overflow-hidden bg-secondary lg:block"><Image src="/images/home/tomatoes.webp" alt="Ripe tomatoes ready for the kitchen" fill sizes="(max-width: 1023px) 1px, 45vw" className="object-cover" /><div className="absolute inset-x-0 bottom-0 bg-brand-green p-8 text-white"><p className="text-[10px] uppercase tracking-[0.14em] text-white/70">Your everyday market</p><h2 className="mt-3 font-serif text-4xl font-normal leading-tight">Make room for good food.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Save your favourites, plan a regular basket and keep your orders in one place.</p></div></aside><div className="min-w-0">{children}</div></div>;
}
