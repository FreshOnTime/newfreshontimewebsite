import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";

import Link from "next/link";
import { ArrowRight, MapPin, RefreshCw, ShoppingBasket } from "lucide-react";

export const metadata: Metadata = {
  title: "Send FreshPick to Family in Sri Lanka",
  description: "Shop FreshPick from abroad and send a local delivery to family or friends in supported Colombo delivery areas.",
};

export default function DiasporaPage() {
  return (
    <div className="min-h-screen bg-background pb-10 text-foreground">
      <PremiumPageHeader title="Send a little home" subtitle="Order groceries for family and friends in Colombo." />

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Step icon={ShoppingBasket} number="01" title="Choose from the live market" copy="Build a normal FreshPick bag from currently available products, recipes or saved essentials." />
          <Step icon={MapPin} number="02" title="Use their delivery address" copy="At checkout, enter the recipient’s supported Sri Lankan delivery details instead of your overseas location." />
          <Step icon={RefreshCw} number="03" title="Repeat when it makes sense" copy="For ongoing household support, use a recurring plan or repeat ordering rather than relying on a hardcoded gift box." />
        </section>

        <section className="mt-14 grid overflow-hidden rounded-lg bg-background lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-7 md:p-10">
            <p className="text-xs font-bold normal-case text-brand-green">A local transaction</p>
            <h2 className="mt-3 max-w-2xl font-serif text-2xl font-normal leading-tight md:text-2xl">The important part happens in Sri Lanka.</h2>
            <p className="mt-5 max-w-xl text-sm font-normal leading-7 text-muted-foreground">FreshPick fulfils against the local catalogue and service area. Product availability, substitutions, delivery charges and minimums remain the same live rules used by any other order.</p>
          </div>
          <div className="bg-background p-7 text-foreground md:p-10">
            <p className="text-xs font-bold normal-case text-brand-green">Before checkout</p>
            <div className="mt-5 space-y-4 text-sm font-normal leading-6 text-muted-foreground">
              <p>Make sure the recipient’s phone number and delivery address are accurate.</p>
              <p>Availability is based on the current FreshPick catalogue; unavailable items are not presented as guaranteed gifts.</p>
              <p>For delivery-area questions, use the Contact page before placing the order.</p>
            </div>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-brand-green">Check delivery details <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Step({ icon: Icon, number, title, copy }: { icon: typeof ShoppingBasket; number: string; title: string; copy: string }) {
  return <article className="rounded-lg border border-border bg-background p-6"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-brand-green"><Icon className="h-4 w-4" /></span><span className="font-sans text-sm not-italic text-brand-green">{number}</span></div><h2 className="mt-7 font-serif text-3xl font-normal leading-tight">{title}</h2><p className="mt-4 text-sm font-normal leading-6 text-muted-foreground">{copy}</p></article>;
}
