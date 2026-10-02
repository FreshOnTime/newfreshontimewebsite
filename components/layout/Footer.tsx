import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Twitter } from "lucide-react";
import { FooterNewsletterForm } from "@/components/layout/FooterNewsletterForm";
import { SERVICE_AREAS, SOCIAL_LINKS, SUPPORT_EMAIL } from "@/lib/config/site";

const discoverLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Recipes", href: "/recipes" },
  { name: "For You", href: "/for-you" },
  { name: "Shop all", href: "/products" },
  { name: "Ready meals", href: "/meals" },
];

const companyLinks = [
  { name: "Creators", href: "/creators" },
  { name: "Local makers", href: "/homemade" },
  { name: "Our story", href: "/about" },
  { name: "Partner with us", href: "/b2b" },
  { name: "Journal", href: "/blog" },
];

const socialLinks = [
  { name: "Instagram", href: SOCIAL_LINKS.instagram, icon: Instagram },
  { name: "Facebook", href: SOCIAL_LINKS.facebook, icon: Facebook },
  { name: "X", href: SOCIAL_LINKS.x, icon: Twitter },
].filter((item) => Boolean(item.href));

export function Footer() {
  return (
    <footer className="border-t border-brand-green bg-brand-green pb-10 text-white md:pb-0">

      <div className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-8 px-6 py-8 md:flex-row md:px-8">
          <div className="max-w-lg text-left">
            <h3 className="mb-3 font-sans text-xl font-semibold text-white">FreshPick updates</h3>
            <p className="font-normal text-white/85">New recipes, local makers, seasonal food and useful FreshPick updates.</p>
          </div>
          <FooterNewsletterForm />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-6">
          <div className="space-y-7 md:col-span-4">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-sans text-3xl font-bold tracking-tight text-white">Fresh<span className="not-italic text-brand-cream">Pick</span></span>
                <span className="text-xs font-medium normal-case text-white/85">Colombo</span>
              </div>
            </Link>
            <p className="max-w-sm font-normal leading-relaxed text-white/85">
              Fresh groceries, everyday essentials and food from local makers. Made for your kitchen in Colombo.
            </p>

            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((item) => (
                  <a key={item.name} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.035] text-white/85 transition-all duration-300 hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-brand-cream">
                    <item.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 text-base font-semibold text-white">Discover</h4>
              <ul className="space-y-3">
                {discoverLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-normal tracking-wide text-white/85 transition-colors hover:text-brand-cream">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-7 text-base font-semibold text-white">FreshPick</h4>
              <ul className="space-y-4">
                {companyLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-normal tracking-wide text-white/85 transition-colors hover:text-brand-cream">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="mb-7 text-base font-semibold text-white">Need a hand?</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-normal text-white/85">
                  <MapPin strokeWidth={1.75} aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-white/85" />
                  <span>Current coverage includes {SERVICE_AREAS.slice(0, 4).join(", ")} and nearby Colombo areas.</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-normal text-white/85">
                  <Mail strokeWidth={1.75} aria-hidden="true" className="h-4 w-4 shrink-0 text-white/85" />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all transition-colors hover:text-white">{SUPPORT_EMAIL}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-5">
          <div className="flex flex-col items-center justify-between gap-4 text-xs font-normal text-white/85 md:flex-row">
            <p>&copy; {new Date().getFullYear()} FreshPick. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/privacy" className="transition-colors hover:text-brand-cream">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-brand-cream">Terms of Service</Link>
              <Link href="/cookies" className="transition-colors hover:text-brand-cream">Cookie Policy</Link>
              <Link href="/help-us" className="transition-colors hover:text-brand-cream">Help</Link>
              <Link href="/site-map" className="transition-colors hover:text-brand-cream">Site map</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
