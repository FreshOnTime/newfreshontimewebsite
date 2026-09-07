import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, MapPin, RefreshCw, ShoppingBasket } from "lucide-react";

export const metadata: Metadata = {
  title: "Send FreshPick to Family in Sri Lanka",
  description: "Shop FreshPick from abroad and send a local delivery to family or friends in supported Colombo delivery areas.",
};

export default function DiasporaPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="relative isolate flex min-h-[68svh] items-end overflow-hidden bg-[#07110c] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16">
        <Image src="/bgs/home-hero.jpg" alt="FreshPick delivery for family in Sri Lanka" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07110c]/96 via-[#07110c]/65 to-[#07110c]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07110c] via-transparent to-black/20" />
        <div className="mx-auto w-full max-w-6xl">
          <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200"><Globe2 className="h-3.5 w-3.5" /> From abroad, delivered locally</span>
          <h1 className="mt-5 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] md:text-8xl">Fill their kitchen from <span className="italic text-emerald-200">wherever you are.</span></h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/65">Use the same live FreshPick catalogue, choose the recipient’s local delivery address at checkout, and send what they actually need. No separate fictional care-box inventory is required.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-semibold text-zinc-950">Shop the market <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/subscriptions" className="inline-flex h-12 items-center rounded-full border border-white/15 bg-white/[0.05] px-6 text-xs font-semibold text-white/80">Explore recurring plans</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
        <section className="grid gap-4 md:grid-cols-3">
          <Step icon={ShoppingBasket} number="01" title="Choose from the live market" copy="Build a normal FreshPick bag from currently available products, recipes or saved essentials." />
          <Step icon={MapPin} number="02" title="Use their delivery address" copy="At checkout, enter the recipient’s supported Sri Lankan delivery details instead of your overseas location." />
          <Step icon={RefreshCw} number="03" title="Repeat when it makes sense" copy="For ongoing household support, use a recurring plan or repeat ordering rather than relying on a hardcoded gift box." />
        </section>

        <section className="mt-14 grid overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.035)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-7 md:p-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">A local transaction</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-tight md:text-5xl">The important part happens in Sri Lanka.</h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-500">FreshPick fulfils against the local catalogue and service area. Product availability, substitutions, delivery charges and minimums remain the same live rules used by any other order.</p>
          </div>
          <div className="bg-[#0b1710] p-7 text-white md:p-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Before checkout</p>
            <div className="mt-5 space-y-4 text-sm font-light leading-6 text-white/58">
              <p>Make sure the recipient’s phone number and delivery address are accurate.</p>
              <p>Availability is based on the current FreshPick catalogue; unavailable items are not presented as guaranteed gifts.</p>
              <p>For delivery-area questions, use the Contact page before placing the order.</p>
            </div>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">Check delivery details <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({ icon: Icon, number, title, copy }: { icon: typeof ShoppingBasket; number: string; title: string; copy: string }) {
  return <article className="rounded-[1.6rem] border border-zinc-200 bg-white p-6"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><Icon className="h-4 w-4" /></span><span className="font-serif text-sm italic text-emerald-700">{number}</span></div><h2 className="mt-7 font-serif text-3xl font-normal leading-tight">{title}</h2><p className="mt-4 text-sm font-light leading-6 text-zinc-500">{copy}</p></article>;
}
