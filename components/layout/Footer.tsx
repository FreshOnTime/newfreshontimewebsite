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
    <footer className="relative overflow-hidden border-t border-emerald-300/10 bg-[#020303] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.035] blur-3xl" />

      <div className="relative border-b border-white/5">
        <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-6 py-16 md:flex-row md:px-12">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="mb-3 font-serif text-3xl italic text-white md:text-4xl">Stay close to what’s fresh.</h3>
            <p className="font-light text-zinc-400">New recipes, local makers, seasonal food and useful FreshPick updates.</p>
          </div>
          <FooterNewsletterForm />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-20">
          <div className="space-y-7 md:col-span-4">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold tracking-tight text-white">Fresh<span className="italic text-emerald-300">Pick</span></span>
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">Colombo</span>
              </div>
            </Link>
            <p className="max-w-sm font-light leading-relaxed text-zinc-400">
              Food discovery, fresh groceries, ready meals and local makers — with a little more help from the things you already love.
            </p>

            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((item) => (
                  <a key={item.name} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.035] text-zinc-400 transition-all duration-300 hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-emerald-300">
                    <item.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-8 md:grid-cols-3">
            <div>
              <h4 className="mb-7 font-serif text-lg italic text-white">Discover</h4>
              <ul className="space-y-4">
                {discoverLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-light tracking-wide text-zinc-500 transition-colors hover:text-emerald-300">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-7 font-serif text-lg italic text-white">FreshPick</h4>
              <ul className="space-y-4">
                {companyLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-light tracking-wide text-zinc-500 transition-colors hover:text-emerald-300">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="mb-7 font-serif text-lg italic text-white">Client care</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-light text-zinc-500">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-emerald-400/70" />
                  <span>Current coverage includes {SERVICE_AREAS.slice(0, 4).join(", ")} and nearby Colombo areas.</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-light text-zinc-500">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-400/70" />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all transition-colors hover:text-white">{SUPPORT_EMAIL}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs font-light text-zinc-500 md:flex-row">
            <p>&copy; {new Date().getFullYear()} FreshPick. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/privacy" className="transition-colors hover:text-emerald-300">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-emerald-300">Terms of Service</Link>
              <Link href="/cookies" className="transition-colors hover:text-emerald-300">Cookie Policy</Link>
              <Link href="/help-us" className="transition-colors hover:text-emerald-300">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
