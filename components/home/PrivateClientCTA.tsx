import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function PrivateClientCTA() {
    return (
        <section className="relative w-full py-24 lg:py-32 overflow-hidden bg-zinc-900">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=2664&auto=format&fit=crop"
                    alt="Private Dining"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/50 to-zinc-950/30" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-sm">
                    Private Client Services
                </span>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6 tracking-tight">
                    Unlock the <span className="italic text-emerald-400">Private Reserve</span>
                </h2>

                <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-300 font-light leading-relaxed mb-10">
                    Gain access to rare harvests, white-glove concierge delivery, and priority sourcing for your estate or business.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/subscriptions" className="group relative px-8 py-4 bg-white text-zinc-900 rounded-full font-bold tracking-wide transition-all hover:bg-emerald-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <span className="flex items-center gap-2">
                            Shop Private Memberships
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                    <Link href="/b2b" className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-medium tracking-wide transition-all hover:bg-white/10 backdrop-blur-sm">
                        Business Inquiries
                    </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-white/40 text-sm font-medium tracking-widest uppercase">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        Priority Access
                    </div>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <div>Curated Sourcing</div>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <div>Dedicated Concierge</div>
                </div>
            </div>
        </section>
    );
}
