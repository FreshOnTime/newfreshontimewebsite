import { publicPageMetadata } from '@/lib/publicPages';
export const metadata = publicPageMetadata('/about');
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { CalendarClock, ShieldCheck, Sprout } from "lucide-react";

const values = [
  { icon: Sprout, number: "01", title: "Fresh food", text: "We favour ingredients with a clear origin, thoughtful handling, and a reason to be at your table." },
  { icon: CalendarClock, number: "02", title: "Delivery that fits", text: "From a single order to a weekly curation, delivery should fit quietly into the way you live." },
  { icon: ShieldCheck, number: "03", title: "Standards", text: "If something does not meet the FreshPick standard, we make it right simply and quickly." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PremiumPageHeader
        title="About FreshPick"
        subtitle="Fresh groceries, everyday essentials and local food in Colombo."
        eyebrow="Our story"
        backgroundImage="/images/editorial/market-crates.webp"
      />

      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="text-xs font-bold normal-case text-brand-green">FreshPick · Colombo</span>
            <p className="mt-8 font-serif text-3xl font-normal leading-tight text-brand-green">Good food, made part of everyday life.</p>
          </div>
          <div className="space-y-5 text-base leading-7 text-muted-foreground">
            <p>FreshPick was created to make quality food feel effortless in a busy city. We connect Colombo homes and businesses with fresh produce, pantry essentials, independent makers, and prepared meals—without losing the human judgement that makes good shopping personal.</p>
            <p>Our work sits between the market and the table. We select carefully, plan recurring needs, and build a service around consistency rather than endless choice. The result is a calmer and more dependable way to eat well.</p>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-12 md:px-8 md:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <span className="text-xs font-bold normal-case text-brand-green">The FreshPick standard</span>
            <h2 className="mt-6 editorial-title">What matters to us</h2>
          </div>
          <div className="grid border-y border-border md:grid-cols-3">
            {values.map(({ icon: Icon, number, title, text }, index) => (
              <article key={number} className={`min-h-0 px-6 py-10 md:px-10 md:py-6 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""} `}>
                <div className="flex items-center justify-between"><span className="font-sans not-italic text-brand-green">{number}</span><Icon className="h-5 w-5 stroke-1 text-brand-green" /></div>
                <h3 className="mt-8 font-sans text-xl font-semibold">{title}</h3>
                <p className="mt-5 text-sm font-normal leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
