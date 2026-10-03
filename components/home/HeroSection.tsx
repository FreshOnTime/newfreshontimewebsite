'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

const slides = [
  { id: 'table', eyebrow: 'The FreshPick market · Colombo', title: ['Good food.', 'Good company.'], description: 'From everyday essentials to something made with care. Find your next good thing.', image: '/images/home/market-table.webp', alt: 'Roti, coconut sambol, dhal, bread and tea on a softly lit table', action: 'Explore the market', href: '#categories-title' },
  { id: 'bakery', eyebrow: 'Bakery, pantry & everyday rituals', title: ['A little care.', 'A lot of flavour.'], description: 'Bread, pantry favourites and the small things that make a table feel complete.', image: '/images/home/market-bakery.webp', alt: 'Rustic bread, flaky pastries, marmalade and coffee on a dark stone countertop', action: 'Shop by category', href: '/categories' },
  { id: 'makers', eyebrow: 'Growers, kitchens & independent makers', title: ['Food with', 'a story.'], description: 'Explore the people and products that can find a place in the FreshPick market.', image: '/images/editorial/hands-at-work.webp', alt: 'Hands preparing dough on a flour-dusted work surface', action: 'Our producers', href: '/farm-to-table' },
] as const;

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const slide = slides[active];

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setPlaying(!motion.matches);
    const updateVisibility = () => setVisible(document.visibilityState === 'visible');
    updateMotion();
    updateVisibility();
    motion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => { motion.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updateVisibility); };
  }, []);

  useEffect(() => {
    if (!playing || hovered || !visible) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, [playing, hovered, visible]);

  function select(index: number) {
    setPlaying(false);
    setActive((index + slides.length) % slides.length);
  }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      select(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  }

  return (
    <section aria-label="FreshPick highlights" aria-roledescription="carousel" tabIndex={0} onKeyDown={keyboard} onFocusCapture={event => { if (!(event.target as HTMLElement).closest('[data-carousel-playback]')) setPlaying(false); }} onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)} className="outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green">
      <div className="relative isolate flex min-h-[590px] items-end overflow-hidden bg-brand-green-deep sm:min-h-[640px] lg:min-h-[620px] xl:min-h-[680px]">
        {slides.map((item, index) => <div key={item.id} hidden={index !== active} className="absolute inset-0"><Image src={item.image} alt={item.alt} fill priority={index === 0} sizes="100vw" className="object-cover object-[60%_center] md:object-center" /></div>)}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,46,30,0.62),rgba(16,46,30,0.08)_80%),linear-gradient(0deg,rgba(16,46,30,0.45),transparent_75%)]" />
        <div className="editorial-wrap relative z-10 w-full pb-28 pt-16 md:pb-32" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
          <p className="max-w-sm text-[11px] font-medium uppercase leading-5 tracking-[0.14em] text-brand-cream/90 md:max-w-none md:text-xs">{slide.eyebrow}</p>
          <h1 id="home-title" className="mt-5 max-w-2xl text-[clamp(2.25rem,6vw,5rem)] font-medium leading-[1.02] tracking-[-0.045em] !text-brand-cream">{slide.title.map(line => <span key={line} className="block whitespace-nowrap">{line}</span>)}</h1>
          <p className="mt-6 max-w-[24rem] text-base leading-7 text-brand-cream/95 md:max-w-[28rem] md:text-lg">{slide.description}</p>
          <Link href={slide.href} className="editorial-button mt-7">{slide.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="editorial-wrap absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 pb-6 text-brand-cream md:pb-8">
          <div className="flex items-center gap-2" aria-label="Choose a highlight">{slides.map((item, index) => <button key={item.id} type="button" onClick={() => select(index)} aria-label={`Show highlight ${index + 1}: ${item.title.join(' ')}`} aria-current={index === active ? 'true' : undefined} className={`flex h-11 w-11 items-center justify-center border-b text-xs tabular-nums transition-colors ${index === active ? 'border-brand-amber text-brand-amber' : 'border-brand-cream/30 text-brand-cream hover:border-brand-cream'}`}>{String(index + 1).padStart(2, '0')}</button>)}</div>
          <div className="flex items-center gap-1 sm:gap-3">{[{ id: 'previous', label: 'Previous highlight', icon: ArrowLeft, action: () => select(active - 1) }, { id: 'playback', label: playing ? 'Pause highlights' : 'Play highlights', icon: playing ? Pause : Play, action: () => setPlaying(value => !value) }, { id: 'next', label: 'Next highlight', icon: ArrowRight, action: () => select(active + 1) }].map(({ id, label, icon: Icon, action }) => <button key={id} type="button" onClick={action} data-carousel-playback={id === 'playback' ? 'true' : undefined} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-cream/40 bg-brand-green-deep/15 text-brand-cream hover:bg-brand-green-deep/40"><Icon className="pointer-events-none h-4 w-4" aria-hidden="true" /></button>)}</div>
        </div>
      </div>
      <nav aria-label="More ways to shop" className="editorial-wrap flex flex-wrap justify-between gap-x-5 border-b border-border py-3 text-sm font-medium text-brand-green">{[['Shop all food', '/products'], ['Explore categories', '/categories'], ['Weekly baskets', '/subscriptions']].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-3 hover:underline underline-offset-4">{label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>)}</nav>
    </section>
  );
}
