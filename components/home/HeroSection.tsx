import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bgs/landing-page-bg-1.jpg"
                    alt="Fresh vegetables and groceries delivered in Colombo"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-55 scale-105 animate-subtle-zoom"
                    priority
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-zinc-950" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.82)_100%)] opacity-80" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.16] mix-blend-overlay" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center md:px-8 lg:px-12">
                <div className="animate-fade-in-up">
                    <span className="mb-8 inline-block rounded-full border border-emerald-500/10 bg-emerald-950/30 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 shadow-2xl backdrop-blur-md">
                        Est. 2024 • Colombo
                    </span>
                    <h1 className="mb-8 font-serif text-6xl font-medium leading-[0.9] tracking-tighter text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
                        The Art of <br />
                        <span className="bg-gradient-to-r from-emerald-200 to-emerald-500 bg-clip-text pr-4 font-light italic text-transparent">Freshness</span>
                    </h1>
                    <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed tracking-wide text-zinc-400 md:text-xl">
                        Curating fresh groceries, recurring orders, and produce supply for homes, restaurants, hotels, and offices in Colombo, Sri Lanka.
                    </p>

                    <div className="flex flex-col justify-center gap-5 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="rounded-none bg-white px-12 py-8 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-all hover:scale-105 hover:bg-emerald-50"
                        >
                            <Link href="/products">Shop Experience</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-none border border-white/20 bg-transparent px-12 py-8 text-sm font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white/5"
                        >
                            <Link href="/b2b">Supply Plans</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                <span className="text-xs uppercase tracking-widest">
                    Scroll to Discover
                </span>
            </div>
        </section>
    );
}
