import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Repeat2,
  Store,
  Twitter,
  UsersRound,
} from "lucide-react";
import { FooterNewsletterForm } from "@/components/layout/FooterNewsletterForm";
import { SERVICE_AREAS, SOCIAL_LINKS, SUPPORT_EMAIL } from "@/lib/config/site";

const experienceLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Shoppable recipes", href: "/recipes" },
  { name: "Live catalogue", href: "/products" },
  { name: "Ready meals", href: "/meals" },
  { name: "Recurring baskets", href: "/subscriptions" },
];

const networkLinks = [
  { name: "Local makers", href: "/homemade" },
  { name: "Partner network", href: "/b2b" },
  { name: "Collections", href: "/collections" },
  { name: "Journal", href: "/blog" },
  { name: "Our story", href: "/about" },
];

const platformModules = [
  { icon: BrainCircuit, name: "Taste Graph", detail: "Preference-aware discovery" },
  { icon: Repeat2, name: "Smart Basket", detail: "Recurring household rhythm" },
  { icon: UsersRound, name: "Creator Commerce", detail: "Food ideas made shoppable" },
  { icon: Store, name: "Partner Network", detail: "Connected local supply" },
];

const socialLinks = [
  { name: "Instagram", href: SOCIAL_LINKS.instagram, icon: Instagram },
  { name: "Facebook", href: SOCIAL_LINKS.facebook, icon: Facebook },
  { name: "X", href: SOCIAL_LINKS.x, icon: Twitter },
].filter((item) => Boolean(item.href));

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-emerald-300/10 bg-[#030805] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-emerald-300/[0.045] blur-3xl" />

      <div className="relative border-b border-white/[0.07]">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">FreshPick signal</span>
            <h2 className="mt-5 max-w-3xl text-balance font-serif text-4xl font-normal leading-[0.95] tracking-[-0.03em] text-white md:text-5xl">
              Stay close to what is worth <span className="italic text-emerald-200">eating next.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-white/45">
              New recipes, local makers, product drops and useful FreshPick updates — without turning your inbox into another supermarket aisle.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <FooterNewsletterForm />
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="mb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platformModules.map(({ icon: Icon, name, detail }) => (
            <div key={name} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/[0.07] text-emerald-200 ring-1 ring-emerald-300/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
              </div>
              <p className="mt-4 text-xs font-semibold text-white/75">{name}</p>
              <p className="mt-1 text-[10px] font-light text-white/32">{detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 border-t border-white/[0.07] pt-14 md:grid-cols-12 lg:gap-16">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-end gap-3">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                Fresh<span className="italic text-emerald-300">Pick</span>
              </span>
              <span className="mb-1 text-[8px] font-bold uppercase tracking-[0.28em] text-white/28">Food platform · Colombo</span>
            </Link>
            <p className="mt-6 max-w-md text-sm font-light leading-7 text-white/40">
              A connected food experience for discovery, shopping, recurring household needs, local makers and curated supply partnerships in Sri Lanka.
            </p>
            <Link href="/discover" className="mt-7 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200 transition-colors hover:text-white">
              Open FreshPick <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {socialLinks.length > 0 && (
              <div className="mt-8 flex gap-2">
                {socialLinks.map((item) => (
                  <a key={item.name} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition-all hover:border-emerald-300/20 hover:bg-emerald-300/[0.07] hover:text-emerald-200">
                    <item.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-7 md:grid-cols-3">
            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">Experience</h3>
              <ul className="mt-6 space-y-3.5">
                {experienceLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-light text-white/48 transition-colors hover:text-emerald-200">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">Network</h3>
              <ul className="mt-6 space-y-3.5">
                {networkLinks.map((item) => (
                  <li key={item.name}><Link href={item.href} className="text-sm font-light text-white/48 transition-colors hover:text-emerald-200">{item.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">Access</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 text-sm font-light leading-6 text-white/42">
                  <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-200/60" />
                  <span>{SERVICE_AREAS.slice(0, 4).join(", ")} and nearby Colombo areas.</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-light text-white/42">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-200/60" />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all transition-colors hover:text-white">{SUPPORT_EMAIL}</a>
                </div>
                <Link href="/contact" className="inline-flex text-xs text-emerald-200/75 transition-colors hover:text-white">Contact support</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.07] pt-7 text-[10px] font-light text-white/28 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} FreshPick. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/cookies" className="transition-colors hover:text-white">Cookies</Link>
            <Link href="/help-us" className="transition-colors hover:text-white">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
