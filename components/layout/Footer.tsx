import Link from 'next/link';
import Wordmark from '@/components/brand/Wordmark';
import { SUPPORT_EMAIL } from '@/lib/config/site';

export function Footer() {
  return <footer className="fp-footer">
    <div className="editorial-wrap flex flex-wrap items-start justify-between gap-10">
      <div><Link href="/"><Wordmark className="text-4xl" /></Link>
        <p className="mt-3 max-w-xs text-sm">Independent food makers across Sri Lanka.</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-4 inline-block text-sm underline">{SUPPORT_EMAIL}</a>
      </div>
      <nav aria-label="Footer links" className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
        {Object.entries({'Explore makers':'/makers','Food stories':'/stories','Become a maker':'/join','How it works':'/how-it-works','About FreshPick':'/about','Contact':'/contact','Privacy':'/privacy','Terms':'/terms','Cookies':'/cookies','Site map':'/site-map'}).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
    </div>
  </footer>;
}
