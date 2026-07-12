const principles = [
  { number: "01", title: "Sourced with restraint", text: "Fewer, better ingredients selected for freshness, provenance, and flavour." },
  { number: "02", title: "Delivered with intention", text: "One-time and recurring deliveries shaped around the rhythm of your home." },
  { number: "03", title: "Rooted in Colombo", text: "A local food house connecting discerning tables with growers and makers." },
];

export default function LuxuryManifesto() {
  return (
    <section className="bg-[#ffffff] px-4 py-24 text-[#09090b] md:py-36">
      <div className="container mx-auto max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#047857]">The FreshPick philosophy</span>
          <h2 className="mt-8 font-serif text-4xl font-normal leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            Everyday nourishment,<br />treated as something <span className="italic text-emerald-900">exceptional.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-8 text-zinc-600 md:text-lg">
            We bring together fresh produce, local craftsmanship, prepared meals, and considered delivery for a quieter, more beautiful way to shop for food.
          </p>
        </div>

        <div className="mt-20 grid border-y border-[#09090b]/15 md:grid-cols-3">
          {principles.map((principle, index) => (
            <article key={principle.number} className={`px-2 py-10 md:px-10 md:py-12 ${index > 0 ? "border-t border-[#09090b]/15 md:border-l md:border-t-0" : ""}`}>
              <span className="font-serif text-sm italic text-[#059669]">{principle.number}</span>
              <h3 className="mt-5 font-serif text-2xl font-normal">{principle.title}</h3>
              <p className="mt-4 text-sm font-light leading-7 text-zinc-600">{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
