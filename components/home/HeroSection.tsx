import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="editorial-wrap pt-5 md:pt-6">
      <div className="relative isolate flex min-h-[520px] items-center justify-center overflow-hidden bg-foreground px-5 py-16 text-center text-white sm:min-h-[620px] md:min-h-[min(720px,78svh)] md:px-12">
        <Image src="/images/home/tomatoes.webp" alt="Ripe tomatoes on the vine" fill priority sizes="(max-width: 1440px) 100vw, 1360px" className="-z-20 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/35" />
        <div className="max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.08em]">The FreshPick market · Colombo</p>
          <h1 id="home-title" className="mt-5 font-sans text-[clamp(2.4rem,7.2vw,6.75rem)] font-bold uppercase leading-[0.96] tracking-[-0.055em] text-white">Good food starts<br className="hidden sm:block" /> with good produce.</h1>
          <p className="mx-auto mt-7 max-w-lg text-base leading-6 text-white md:text-lg">Vegetables, fruit and everyday ingredients.<br className="hidden sm:block" /> From the market to your kitchen.</p>
          <Link href="/products" className="editorial-button mt-8">Shop the market <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
      <nav aria-label="More ways to shop" className="flex flex-wrap justify-between gap-x-5 border-b border-border py-3 text-xs font-semibold uppercase text-brand-green">
        {[['Fresh groceries', '/products'], ['Local kitchens', '/homemade'], ['Your weekly basket', '/subscriptions']].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-3 hover:underline underline-offset-4">{label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>)}
      </nav>
    </section>
  );
}
