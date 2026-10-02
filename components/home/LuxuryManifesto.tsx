const principles = [
  { title: "Fresh ingredients", text: "Produce and everyday essentials for the meals you love." },
  { title: "Your kind of shopping", text: "Shop once or set up a recurring basket for your weekly staples." },
  { title: "Local food, local people", text: "Discover growers, cooks and independent makers in Sri Lanka." },
];

export default function LuxuryManifesto() {
  return (
    <section className="border-t border-border bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="font-heading text-3xl font-normal text-brand-green">Good food starts close to home.</h2>
        <div className="mt-7 grid gap-8 md:grid-cols-3">
          {principles.map((principle) => (
            <article key={principle.title}>
              <h3 className="text-lg font-semibold text-brand-green">{principle.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
