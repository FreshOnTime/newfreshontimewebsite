export default function InfiniteMarquee() {
    return (
        <section className="relative overflow-hidden bg-emerald-950 py-8 text-emerald-100">
            <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <div className="relative z-10 flex flex-col gap-3 text-center text-2xl font-semibold uppercase tracking-wide md:text-4xl">
                <p>ORGANIC / FRESH / SUSTAINABLE / LOCAL / PREMIUM</p>
                <p>DELIVERED DAILY / FARM TO TABLE / QUALITY GUARANTEED</p>
            </div>
        </section>
    );
}
