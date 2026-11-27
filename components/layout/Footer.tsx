import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import { SOCIAL_LINKS } from "@/lib/config/site";
import { SOCIAL_LABELS,type SocialPlatform } from "@/lib/socialProfiles";

const groups = [
  { title: 'Explore', links: [['Explore','/discover'],['Food departments','/explore'],['Food & brands','/makers'],['Dining','/eat-drink'],['FreshPick Live','/live'],['Food Atlas','/food-atlas'],['Food traditions','/traditions'],['Food guides','/guides'],['Experiences','/experiences'],['Products','/food-products'],['Gift suppliers','/gifting'],['Journal','/stories']] },
  { title: 'FreshPick', links: [['About FreshPick','/about'],['How it works','/how-it-works'],['Editorial archive','/blog']] },
  { title: 'For businesses', links: [['For businesses','/for-businesses'],['List your business','/join'],['Business studio','/dashboard'],['Listing corrections','/contact']] },
  { title: 'Here to help', links: [['Help','/help'],['Account','/profile'],['Contact','/contact']] },
];
export function Footer() {
  const socials=(Object.keys(SOCIAL_LINKS) as SocialPlatform[]).filter(platform=>Boolean(SOCIAL_LINKS[platform]));
  return (
    <footer className="heritage-footer mt-8 bg-brand-green-deep text-white">
      <div className="editorial-wrap">
        <div className="grid gap-8 py-10 lg:grid-cols-[1fr_2fr] md:py-12">
          <div><p className="max-w-xs text-sm leading-7 text-white/85">An independent guide to Sri Lankan food, makers, restaurants and cafés.</p><p className="mt-1 max-w-xs text-xs leading-6 text-white/85">Discover food and connect directly with the business.</p></div>
          <div className="fp-footer-links grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">{groups.map(group => <nav key={group.title} aria-label={`Footer ${group.title}`}><h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-white/85">{group.title}</h3><ul>{group.links.map(([name,href]) => <li key={href}><Link href={href} className="inline-flex min-h-10 items-center text-[13px] font-normal leading-6 text-white/90 hover:underline underline-offset-4">{name}</Link></li>)}</ul></nav>)}</div>
        </div>
        <div className="pb-6"><Link href="/" aria-label="FreshPick home"><Wordmark className="text-[36px]"/></Link></div>
        <div className="flex flex-col justify-between gap-5 border-t border-white/20 py-6 text-[11px] text-white/85 md:flex-row"><p>© {new Date().getFullYear()} FreshPick</p><nav aria-label="Policies" className="flex flex-wrap gap-x-5 gap-y-3">{[['Privacy','/privacy'],['Terms','/terms'],['Cookies','/cookies'],['Site map','/site-map']].map(([label,href]) => <Link key={href} href={href} className="transition-colors hover:text-white">{label}</Link>)}</nav>{socials.length>0&&<nav aria-label="Follow FreshPick" className="flex flex-wrap items-center gap-x-4 gap-y-2">{socials.map(platform=><a key={platform} href={SOCIAL_LINKS[platform]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:underline underline-offset-4">{SOCIAL_LABELS[platform]}</a>)}</nav>}</div>
      </div>
    </footer>
  );
}
