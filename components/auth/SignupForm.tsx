import { accountLink } from '@/lib/authNavigation';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, Compass, Store, UserRound, BookOpen, MessageCircle, Package } from 'lucide-react';

export function SignupForm({ requestedDestination }: { requestedDestination?: string }) {
  const accounts = [
    { title: 'Member account', label: 'For food lovers', description: 'Your personal space to explore Sri Lanka’s food scene and keep the discoveries you love.', href: '/auth/signup/customer', icon: UserRound, action: 'Create a member account', features: [{icon: Compass,text:'Discover local dining, dishes and makers'},{icon:Bookmark,text:'Keep your favourite discoveries in one place'},{icon:BookOpen,text:'Explore food guides and editorial stories'}] },
    { title: 'Business page', label: 'For food businesses', description: 'A public home for your restaurant, bakery, café or independent food brand.', href: '/join', icon: Store, action: 'Create a business page', features: [{icon:Store,text:'Create a public business profile'},{icon:Package,text:'Showcase products, menus and food stories'},{icon:MessageCircle,text:'Help interested customers contact you directly'}] },
  ];
  return (
    <section className="mx-auto w-full max-w-[560px] py-4 xl:py-8" aria-labelledby="account-title">
      <p className="text-xs font-bold text-brand-green">Your FreshPick journey</p>
      <h1 id="account-title" className="mt-3 font-serif text-4xl font-normal leading-tight text-foreground">Find your place at the table.</h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Choose how you would like to use FreshPick. Explore as a member or introduce your food business to new customers.</p>
      <div className="mt-8 space-y-4">
        {accounts.map(({title,label,description,href,icon:Icon,action,features}) => (
          <Link key={href} href={accountLink(href, requestedDestination)} className="group block overflow-hidden rounded-2xl border border-[#33433b] bg-[#14231d] p-5 text-[#f5f5ec] shadow-sm transition-colors hover:border-[#a9db76] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#417139] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#283c30] text-[#b9e98c]"><Icon className="h-5 w-5" aria-hidden="true"/></span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-[#b9e98c] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"/>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#b9e98c]">{label}</p>
            <h2 className="mt-2 font-serif text-2xl font-normal text-[#f5f5ec]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#d5dfd4]">{description}</p>
            <ul className="mt-4 space-y-2">
              {features.map(({icon:FeatureIcon,text}) => <li key={text} className="flex items-start gap-3 text-sm leading-5 text-[#e3e9de]"><FeatureIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b9e98c]" aria-hidden="true"/><span>{text}</span></li>)}
            </ul>
            <div className="mt-5 flex min-h-11 items-center justify-between gap-2 border-t border-[#3b4d40] pt-3 text-sm font-semibold text-[#b9e98c]">{action}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></div>
          </Link>
        ))}
      </div>
      <p className="mt-7 text-sm text-muted-foreground">Already have an account?{' '}<Link href={accountLink('/auth/login', requestedDestination)} className="font-semibold text-brand-green underline-offset-4 hover:underline">Sign in</Link></p>
    </section>
  );
}
