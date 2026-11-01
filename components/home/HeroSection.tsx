"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, ArrowUpRight } from "lucide-react";

const slides = [
  {
    id: "produce",
    eyebrow: "An everyday market, thoughtfully put together",
    title: "Fresh food. Better everyday.",
    description: "Vegetables for tonight, fruit for the family, pantry essentials and food from local kitchens. Discover your next good thing.",
    image: "/images/home/market-produce-box.webp",
    alt: "A basket of aubergines, cabbage, carrots, green beans and tropical produce",
    action: "Shop the market",
    href: "/products",
    caption: "Fresh vegetables & greens",
  },
  {
    id: "fruit",
    eyebrow: "A little more colour in your kitchen",
    title: "Make room for something fresh.",
    description: "Explore fruit, vibrant produce and ingredients for the meals you look forward to making.",
    image: "/images/home/fresh-market-hero.webp",
    alt: "Papaya, bananas, limes, carrots and leafy greens",
    action: "Browse categories",
    href: "/categories",
    caption: "Fruit & market favourites",
  },
  {
    id: "pantry",
    eyebrow: "The good things you come back to",
    title: "For the meals that matter.",
    description: "Rice, pulses, spices and drinks alongside fresh produce, bakery and food from neighbourhood makers.",
    image: "/images/home/market-pantry.webp",
    alt: "Rice, lentils, coconut and spices laid out as an everyday pantry selection",
    action: "Explore food",
    href: "/discover",
    caption: "Everyday pantry essentials",
  },
] as const;

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const slide = slides[active];

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPlaying(!motion.matches);
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || hovered || !visible) return;
    const interval = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 9500);
    return () => window.clearInterval(interval);
  }, [playing, hovered, visible]);

  const select = (index: number) => {
    setActive((index + slides.length) % slides.length);
    setPlaying(false);
  };

  return (
    <section aria-label="FreshPick market highlights" aria-roledescription="carousel" onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setPlaying(false)} className="relative overflow-hidden border-b border-border bg-brand-cream">
      <div className="editorial-wrap grid min-w-0 items-stretch gap-0 py-7 sm:py-10 lg:min-h-[660px] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-12">
        <div className="flex min-w-0 flex-col justify-center py-6 lg:py-12">
          <p className="max-w-md text-xs font-medium uppercase leading-5 tracking-[.12em] text-muted-foreground" aria-live="off">{slide.eyebrow}</p>
          <h1 className="mt-5 max-w-[12ch] font-heading text-[clamp(2.9rem,6vw,6.4rem)] font-semibold leading-[.99] tracking-[-.06em] text-brand-green-deep [text-wrap:balance]" aria-live="off">{slide.title}</h1>
          <p className="mt-7 max-w-[45ch] text-base leading-[1.85] text-foreground/75 sm:text-lg">{slide.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href={slide.href} className="editorial-button">{slide.action}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/about" className="editorial-link">Our story <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-brand-green/15 pt-6 text-xs text-muted-foreground lg:mt-14"><span>01 / Fresh groceries</span><span className="h-1 w-1 rounded-full bg-brand-amber" aria-hidden="true" /><span>02 / Local makers</span><span className="h-1 w-1 rounded-full bg-brand-amber" aria-hidden="true" /><span>03 / Your routine</span></div>
        </div>
        <div className="relative isolate min-h-[355px] overflow-hidden rounded-[1.5rem] bg-brand-green-deep sm:min-h-[460px] lg:min-h-full lg:rounded-[2rem]">
          {slides.map((item, index) => <div key={item.id} hidden={index !== active} className="absolute inset-0"><Image src={item.image} alt={item.alt} fill priority={index === 0} sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover" /></div>)}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand-green-deep/75 via-brand-green-deep/15 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-5 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="max-w-[15rem] text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/75">From the market</p>
              <p className="mt-2 font-heading text-2xl font-semibold leading-tight tracking-[-.04em] sm:text-3xl">{slide.caption}</p>
            </div>
            <div className="flex items-center gap-2 text-white">
              <button type="button" onClick={() => select(active - 1)} aria-label="Previous highlight" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-brand-green-deep/30 backdrop-blur-md transition-colors hover:bg-brand-green-deep/70"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause highlights" : "Play highlights"} aria-pressed={playing} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-brand-green-deep/30 backdrop-blur-md transition-colors hover:bg-brand-green-deep/70">{playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}</button>
              <button type="button" onClick={() => select(active + 1)} aria-label="Next highlight" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-brand-green-deep/30 backdrop-blur-md transition-colors hover:bg-brand-green-deep/70"><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      </div>
      <nav aria-label="More ways to shop" className="editorial-wrap grid grid-cols-1 divide-y divide-border border-t border-border text-sm font-medium text-brand-green sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[["Explore fresh food", "/products"], ["Shop by category", "/categories"], ["Recurring baskets", "/subscriptions"]].map(([label, href]) => <Link key={href} href={href} className="group flex min-h-16 items-center justify-between gap-3 px-2 py-3 transition-colors hover:bg-brand-green/5 sm:px-5 first:sm:pl-0 last:sm:pr-0">{label}<ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /></Link>)}
      </nav>
    </section>
  );
}
