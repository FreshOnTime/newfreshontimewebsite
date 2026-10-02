import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function PrivateClientCTA() {
    return (
        <section className="relative w-full overflow-hidden bg-primary py-24 lg:py-32">
            {/* Premium dark background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-primary" />
                <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2  from-transparent  to-transparent" />
                <div className="absolute bottom-0 left-1/2 h-px w-[58%] -translate-x-1/2  from-transparent  to-transparent" />
                <div className="absolute inset-x-8 top-16 h-48 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
                <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300 shadow-[0_0_28px_rgba(245,158,11,0.08)] ">
                    Private Client Services
                </span>

                <h2 className="mx-auto mt-8 max-w-5xl font-serif text-4xl font-normal tracking-tight text-white md:text-5xl lg:text-6xl">
                    Unlock the <span className="italic text-emerald-300">Private Reserve</span>
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl">
                    Gain access to rare harvests, white-glove concierge delivery, and priority sourcing for your estate or business.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/subscriptions" className="group relative rounded-md bg-primary px-8 py-4 font-bold tracking-wide text-foreground shadow-[0_16px_45px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary">
                        <span className="flex items-center gap-2">
                            Shop Private Memberships
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                    <Link href="/b2b" className="rounded-md border border-white/15 bg-white/[0.03] px-8 py-4 font-medium tracking-wide text-white  transition-all duration-300 hover:border-border/40 hover:bg-primary/10 hover:text-emerald-100">
                        Business Inquiries
                    </Link>
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-5 text-sm font-medium uppercase tracking-widest text-white/40 sm:flex-row sm:gap-8">
                    <div className="flex items-center gap-2 text-emerald-300/80">
                        <Star className="h-4 w-4 fill-emerald-400 text-brand-green" />
                        Priority Access
                    </div>
                    <div className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
                    <div>Curated Sourcing</div>
                    <div className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
                    <div>Dedicated Concierge</div>
                </div>
            </div>
        </section>
    );
}
