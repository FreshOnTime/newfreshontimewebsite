import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';
import { SUPPORT_EMAIL, SOCIAL_LINKS } from '@/lib/config/site';

const quick = [['About Us','/about'],['Explore makers','/makers'],['Food stories','/stories'],['How it works','/how-it-works'],['Become a maker','/join'],['Saved picks','/saved'],['Help Center','/contact'],['Site map','/site-map']];
const crafts = [['Growers','Produce'],['Dairy & eggs','Dairy & eggs'],['Home kitchens','Prepared food'],['Pantry makers','Pantry'],['Bakery','Bakery']];
const socials = [{href:SOCIAL_LINKS.facebook, label:'Facebook', Icon:Facebook},{href:SOCIAL_LINKS.x,label:'X',Icon:Twitter},{href:SOCIAL_LINKS.instagram,label:'Instagram',Icon:Instagram}];
export function Footer() {
  return <footer className="heritage-footer bg-gray-900 text-white">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="FreshPick home"><Image src="/fresh-pick.svg" alt="" width={32} height={32}/><span className="text-xl font-bold">Fresh Pick</span></Link>
          <p className="text-gray-400 text-sm">Discover independent Sri Lankan food makers, their latest batches and the stories behind their kitchens.</p>
          {socials.some(s => s.href) && <div className="flex space-x-4">{socials.filter(s => s.href).map(({href,label,Icon}) => <a key={label} href={href} aria-label={label} className="text-gray-400 hover:text-white transition-colors"><Icon className="w-5 h-5"/></a>)}</div>}
        </div>
        <nav aria-label="Quick links"><h3 className="font-semibold mb-4">Quick Links</h3><ul className="space-y-2 text-sm">{quick.map(([label,href]) => <li key={href}><Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link></li>)}</ul></nav>
        <nav aria-label="Maker crafts"><h3 className="font-semibold mb-4">Categories</h3><ul className="space-y-2 text-sm">{crafts.map(([label,kind]) => <li key={kind}><Link href={'/makers?kind='+encodeURIComponent(kind)} className="text-gray-400 hover:text-white transition-colors">{label}</Link></li>)}</ul></nav>
        <div><h3 className="font-semibold mb-4">Contact Us</h3><ul className="space-y-3 text-sm"><li className="flex items-center text-gray-400"><Mail className="w-4 h-4 mr-2 shrink-0"/><a href={'mailto:'+SUPPORT_EMAIL} className="hover:text-white transition-colors break-all">{SUPPORT_EMAIL}</a></li><li className="flex items-start text-gray-400"><MapPin className="w-4 h-4 mr-2 mt-1 shrink-0"/>Sri Lanka</li></ul></div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8"><div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4"><p>&copy; {new Date().getFullYear()} Fresh Pick. All rights reserved.</p><nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2"><Link href="/privacy" className="hover:text-white">Privacy Policy</Link><Link href="/terms" className="hover:text-white">Terms of Service</Link><Link href="/cookies" className="hover:text-white">Cookies</Link></nav></div></div>
    </div>
  </footer>;
}
