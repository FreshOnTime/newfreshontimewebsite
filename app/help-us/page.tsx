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
    <main className="min-h-screen bg-[#ffffff] text-[#09090b]">
      <PremiumPageHeader eyebrow="Your perspective" title="Help us make it better." subtitle="The most useful FreshPick improvements begin with the people who use it." />
      <section className="px-4 py-24 md:py-32">
        <div className="container mx-auto grid max-w-7xl border-y border-zinc-300 md:grid-cols-2">
          {paths.map(({ icon: Icon, label, title, copy, href, action }, index) => (
            <article key={title} className={`flex min-h-[30rem] flex-col px-7 py-10 md:p-14 ${index ? "border-t border-zinc-300 md:border-l md:border-t-0" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#047857]">{label}</span>
                <Icon className="h-6 w-6 stroke-1 text-emerald-800" />
              </div>
              <h2 className="mt-20 max-w-md font-serif text-4xl font-normal leading-tight md:text-5xl">{title}</h2>
              <p className="mt-7 max-w-lg text-sm font-light leading-7 text-zinc-500">{copy}</p>
              <Link href={href} className="mt-auto inline-flex w-fit items-center gap-4 border-b border-[#09090b] pb-2 pt-12 text-[10px] font-bold uppercase tracking-[0.18em]">
                {action}<ArrowRight className="h-4 w-4 stroke-1" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
