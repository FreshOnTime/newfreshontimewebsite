import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";
import { FooterNewsletterForm } from "@/components/layout/FooterNewsletterForm";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-emerald-300/10 bg-[#020303] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.035] blur-3xl" />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/5">
        <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-6 py-16 md:flex-row md:px-12">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="mb-3 font-serif text-3xl italic text-white md:text-4xl">Join the Inner Circle</h3>
            <p className="font-light text-zinc-400">Receive exclusive invitations to seasonal harvests and private reserves.</p>
          </div>
          <FooterNewsletterForm />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-24">
          {/* Brand Column */}
          <div className="space-y-8 md:col-span-4">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold tracking-tight text-white">
                  Fresh<span className="italic text-emerald-300">Pick</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                  Colombo
                </span>
              </div>
            </Link>
            <p className="font-light leading-relaxed text-zinc-400">
              Curating the finest harvest for those who appreciate the extraordinary.
              Elevating the daily ritual of nourishment into an art form.
            </p>
            <div className="flex space-x-4 pt-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.035] text-zinc-400 transition-all duration-300 hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-emerald-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-12 md:col-span-8 md:grid-cols-3">
            <div>
              <h4 className="mb-8 font-serif text-lg italic text-white">Collections</h4>
              <ul className="space-y-4">
                {['Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Bakery', 'Beverages'].map((item) => (
                  <li key={item}>
                    <Link href="/products" className="group flex items-center text-sm font-light tracking-wide text-zinc-500 transition-colors hover:text-emerald-300">
                      <span className="mr-0 h-px w-0 bg-emerald-300 transition-all duration-300 group-hover:mr-2 group-hover:w-2"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-8 font-serif text-lg italic text-white">World of Fresh</h4>
              <ul className="space-y-4">
                {[
                  { name: 'Our Story', href: '/about' },
                  { name: 'The Growers', href: '/about' },
                  { name: 'Sustainability', href: '/about' },
                  { name: 'Private Membership', href: '/subscriptions' },
                  { name: 'Concierge Services', href: '/contact' },
                  { name: 'Journal', href: '/blog' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="group flex items-center text-sm font-light tracking-wide text-zinc-500 transition-colors hover:text-emerald-300">
                      <span className="mr-0 h-px w-0 bg-emerald-300 transition-all duration-300 group-hover:mr-2 group-hover:w-2"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-8 font-serif text-lg italic text-white">Client Care</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-light text-zinc-500">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-emerald-400/70" />
                  <span>Available throughout<br />Greater Colombo</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-light text-zinc-500">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-400/70" />
                  <a href="mailto:concierge@freshpick.lk" className="transition-colors hover:text-white">concierge@freshpick.lk</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs font-light text-zinc-500 md:flex-row">
            <p>&copy; {new Date().getFullYear()} FreshPick. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="transition-colors hover:text-emerald-300">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-emerald-300">Terms of Service</Link>
              <Link href="/cookies" className="transition-colors hover:text-emerald-300">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
