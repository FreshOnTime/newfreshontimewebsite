import { publicPageMetadata } from '@/lib/publicPages';
export const metadata = publicPageMetadata('/help-us');
import Link from "next/link";
import { ArrowRight, Lightbulb, MessageCircleWarning } from "lucide-react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

const paths = [
  {
    icon: MessageCircleWarning,
    label: "Client care",
    title: "Something needs attention.",
    copy: "Tell us about an order, checkout, delivery, or account issue. Urgent matters are prioritised by our care team.",
    href: "/contact?type=issue",
    action: "Report an issue",
  },
  {
    icon: Lightbulb,
    label: "The next chapter",
    title: "You have an idea for us.",
    copy: "Share a service, product, or experience you would like FreshPick to create. We review suggestions every week.",
    href: "/contact?type=suggestion",
    action: "Share an idea",
  },
];

export default function HelpUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PremiumPageHeader eyebrow="Your perspective" title="Help us make it better." subtitle="The most useful FreshPick improvements begin with the people who use it." />
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto grid max-w-7xl border-y border-border md:grid-cols-2">
          {paths.map(({ icon: Icon, label, title, copy, href, action }, index) => (
            <article key={title} className={`flex min-h-[30rem] flex-col px-7 py-10 md:p-14 ${index ? "border-t border-border md:border-l md:border-t-0" : ""} `}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold normal-case text-brand-green">{label}</span>
                <Icon className="h-6 w-6 stroke-1 text-brand-green" />
              </div>
              <h2 className="mt-8 max-w-md font-serif text-2xl font-normal leading-tight md:text-2xl">{title}</h2>
              <p className="mt-7 max-w-lg text-sm font-normal leading-7 text-muted-foreground">{copy}</p>
              <Link href={href} className="mt-auto inline-flex w-fit items-center gap-4 border-b border-[#09090b] pb-2 pt-6 text-xs font-bold normal-case">
                {action}<ArrowRight className="h-4 w-4 stroke-1" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
