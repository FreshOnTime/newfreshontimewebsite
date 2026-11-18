import Link from 'next/link';
import { publicPageMetadata } from '@/lib/publicPages';
import { ArrowRight, Sprout, Package, Truck } from 'lucide-react';

export const metadata = publicPageMetadata('/partners');

const steps = [
  { title: 'Join the network', description: 'Tell us what you grow or make. Our team reviews your application and agrees supply terms with you.' },
  { title: 'Receive supply requests', description: 'When an order includes your linked products, check your workspace and confirm what you can prepare.' },
  { title: 'Prepare for collection', description: 'Pack the agreed products, mark them ready and coordinate handover with FreshPick.' },
  { title: 'Track settlement', description: 'See collection and recorded payments in your workspace. Payment terms are agreed with FreshPick.' },
];

export default function PartnersPage() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20 space-y-16">
    <section className="rounded-3xl bg-brand-green px-7 py-12 text-white sm:px-14 sm:py-20">
      <p className="text-sm font-medium text-emerald-100">FreshPick Partners</p>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Grow with FreshPick.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">Connect your produce, pantry goods or homemade food with Colombo households. We work with local growers and food businesses to source fresh, reliable products.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/auth/signup/supplier?catalogue=1" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-brand-green">Become a partner <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/dashboard?section=orders" className="rounded-lg border border-white/60 px-5 py-3 font-semibold">Partner workspace</Link>
      </div>
    </section>
    <section>
      <h2 className="font-serif text-3xl text-brand-green">Find the right way to supply</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border p-6"><Sprout className="h-7 w-7 text-brand-green" /><h3 className="mt-4 text-xl font-semibold">Growers and farmers</h3><p className="mt-3 text-muted-foreground">Offer your seasonal produce or respond to our buying requests.</p><Link href="/supply" className="mt-4 inline-block font-semibold text-brand-green underline">Sell your harvest</Link></article>
        <article className="rounded-2xl border p-6"><Package className="h-7 w-7 text-brand-green" /><h3 className="mt-4 text-xl font-semibold">Food producers</h3><p className="mt-3 text-muted-foreground">Apply with a product catalogue for reviewed FreshPick listings.</p><Link href="/auth/signup/supplier?catalogue=1" className="mt-4 inline-block font-semibold text-brand-green underline">Apply with a catalogue</Link></article>
        <article className="rounded-2xl border p-6"><Truck className="h-7 w-7 text-brand-green" /><h3 className="mt-4 text-xl font-semibold">Business partners</h3><p className="mt-3 text-muted-foreground">Discuss recurring supply, wholesale needs and collection arrangements.</p><Link href="/b2b" className="mt-4 inline-block font-semibold text-brand-green underline">Explore business partnerships</Link></article>
      </div>
    </section>
    <section><h2 className="font-serif text-3xl text-brand-green">How it works</h2><ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step, i) => <li key={step.title} className="rounded-2xl border p-6"><span className="text-2xl font-semibold text-brand-green">0{i+1}</span><h3 className="mt-3 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p></li>)}</ol></section>
    <section className="rounded-2xl border p-7"><h2 className="font-serif text-2xl text-brand-green">Questions about joining?</h2><p className="mt-2 text-muted-foreground">Read our supplier guide or reach the FreshPick team to discuss your products, terms and collection.</p><div className="mt-4 flex flex-wrap gap-5"><Link href="/how-it-works/suppliers" className="font-semibold text-brand-green underline">Supplier guide</Link><Link href="/contact?type=question&source=producers" className="font-semibold text-brand-green underline">Contact us</Link></div></section>
  </main>;
}
