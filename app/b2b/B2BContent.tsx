import { Sprout, Store, PackageCheck, Building2 } from "lucide-react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import PartnershipRequestForm from "./PartnershipRequestForm";

const partners = [
  { icon: Sprout, title: "Growers & farms", description: "Fresh produce, herbs, eggs and dairy." },
  { icon: Store, title: "Local makers", description: "Bakery, pantry and small-batch food." },
  { icon: PackageCheck, title: "Brands & distributors", description: "Packaged food and specialty products." },
  { icon: Building2, title: "Business partners", description: "Recurring supply for offices and hospitality." },
];

export default function B2BContent() {
  return (
    <main className="bg-background">
      <PremiumPageHeader title="Partner with FreshPick" subtitle="For growers, food makers and businesses in Sri Lanka." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border p-5">
              <Icon className="mb-4 h-5 w-5 text-brand-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
        <section className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-2xl font-semibold">Tell us about your business</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Share what you supply and where you operate. Our team will review the details and discuss quality, availability and commercial terms with you.</p>
            <ol className="mt-6 space-y-3 text-sm text-brand-green">
              <li>1. Send your application</li>
              <li>2. Review the fit with our team</li>
              <li>3. Agree the details and get set up</li>
            </ol>
          </div>
          <PartnershipRequestForm />
        </section>
      </div>
    </main>
  );
}
