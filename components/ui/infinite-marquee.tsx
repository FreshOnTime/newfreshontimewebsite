interface MarqueeRowProps {
    children: string;
    reverse?: boolean;
}

function MarqueeRow({ children, reverse = false }: MarqueeRowProps) {
    return (
        <div className="overflow-hidden whitespace-nowrap py-3">
            <div className={`inline-flex min-w-full gap-8 text-3xl font-semibold uppercase md:text-5xl ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
                {[0, 1, 2, 3].map((index) => (
                    <span key={index} className="block shrink-0">{children}</span>
                ))}
            </div>
        </div>
    );
}

export default function InfiniteMarquee() {
    return (
        <section className="relative overflow-hidden bg-emerald-950 py-8 text-emerald-100">
            <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <MarqueeRow reverse>ORGANIC / FRESH / SUSTAINABLE / LOCAL / PREMIUM / </MarqueeRow>
            <MarqueeRow>DELIVERED DAILY / FARM TO TABLE / QUALITY GUARANTEED / </MarqueeRow>
        </section>
    );
}
