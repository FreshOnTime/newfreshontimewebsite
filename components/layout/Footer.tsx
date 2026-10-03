import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import { FooterNewsletterForm } from "@/components/layout/FooterNewsletterForm";
import { SERVICE_AREAS, SOCIAL_LINKS, SUPPORT_EMAIL } from "@/lib/config/site";

const groups = [
  { title: 'The market', links: [['Categories','/categories'],['Shop all','/products'],['Weekly baskets','/subscriptions'],['Saved products','/wishlist']] },
  { title: 'FreshPick', links: [['About FreshPick','/about'],['Our producers','/farm-to-table'],['Recipes','/recipes'],['Journal','/blog']] },
  { title: 'For business', links: [['Business supply','/b2b'],['Become a supplier','/auth/signup/supplier'],['Get in touch','/contact']] },
  { title: 'Here to help', links: [['Delivery & ordering','/help'],['Your orders','/orders'],['Returns & refunds','/refund'],['Contact','/contact']] },
];
export function Footer() {
  return (
    <footer className="mt-12 bg-brand-green text-white">
      <div className="editorial-wrap">
        <div className="grid gap-8 border-b border-white/20 py-12 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
          <div><p className="text-[10px] uppercase tracking-[0.16em] text-white/85">A note from the market</p><h2 className="mt-4 max-w-xl font-heading text-4xl font-normal leading-[1.12] text-white/90 md:text-5xl">Good things, in your inbox.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/85">Seasonal inspiration, recipes and news from FreshPick.</p></div>
          <FooterNewsletterForm />
        </div>
        <div className="grid gap-12 py-12 lg:grid-cols-[1fr_2fr] md:py-16">
          <div><Link href="/" aria-label="FreshPick home" className="inline-flex rounded-lg bg-brand-cream px-3 py-2"><Wordmark className="text-4xl" /></Link><p className="mt-5 max-w-xs text-sm leading-7 text-white/85">A thoughtfully chosen market for everyday cooking in Colombo.</p><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-6 inline-block min-h-11 break-all text-sm text-white/85 underline decoration-white/30 underline-offset-4">{SUPPORT_EMAIL}</a><p className="mt-1 max-w-xs text-xs leading-6 text-white/85">Delivery coverage includes {SERVICE_AREAS.slice(0, 4).join(', ')} and nearby areas.</p></div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">{groups.map(group => <nav key={group.title} aria-label={`Footer ${group.title}`}><h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-white/85">{group.title}</h3><ul>{group.links.map(([name,href]) => <li key={href}><Link href={href} className="inline-flex min-h-10 items-center text-[13px] font-normal leading-6 text-white/90 hover:underline underline-offset-4">{name}</Link></li>)}</ul></nav>)}</div>
        </div>
        <p aria-hidden="true" className="select-none pb-6 text-[clamp(2.6rem,12vw,11rem)] font-semibold leading-[1] tracking-[-0.045em]">FreshPick</p>
        <div className="flex flex-col justify-between gap-5 border-t border-white/20 py-6 text-[11px] text-white/85 md:flex-row"><p>© {new Date().getFullYear()} FreshPick</p><nav aria-label="Policies" className="flex flex-wrap gap-x-5 gap-y-3">{[['Privacy','/privacy'],['Terms','/terms'],['Cookies','/cookies'],['Site map','/site-map']].map(([label,href]) => <Link key={href} href={href} className="hover:text-white/90">{label}</Link>)}</nav><div className="flex gap-5">{[['Instagram',SOCIAL_LINKS.instagram],['Facebook',SOCIAL_LINKS.facebook],['X',SOCIAL_LINKS.x]].filter(([,href]) => Boolean(href)).map(([label,href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="hover:text-white/90">{label}</a>)}</div></div>
      </div>
    </footer>
  );
}
