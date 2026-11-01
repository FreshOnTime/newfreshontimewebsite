
import Link from 'next/link';
import type { Guide } from '@/lib/marketGuides';

export default function GuidePage({ guide }: { guide: Guide }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-secondary/40">
        <div className="editorial-wrap py-12 md:py-20">
          <Link href="/how-it-works" className="text-sm font-medium text-brand-green underline underline-offset-4">How FreshPick works</Link>
          <p className="editorial-label mt-7">{guide.label}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-tight md:text-6xl">{guide.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">{guide.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href={guide.primary.href} className="editorial-button">{guide.primary.label}</Link>
            <Link href={guide.secondary.href} className="editorial-link">{guide.secondary.label}</Link>
          </div>
        </div>
      </header>
      <div className="editorial-wrap grid gap-10 py-12 md:py-16 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-green">In this guide</h2>
          <nav aria-label={guide.label + ' contents'} className="mt-4 grid">
            {guide.steps.map((step, index) => (
              <a key={step.id} href={'#' + step.id} className="flex min-h-11 items-center gap-3 border-b border-border py-2 text-sm leading-6 text-muted-foreground hover:text-brand-green">
                <span className="shrink-0 text-xs text-brand-clay">{String(index + 1).padStart(2, '0')}</span>{step.title}
              </a>
            ))}
            <a href="#questions" className="min-h-11 py-3 text-sm text-brand-green underline underline-offset-4">Common questions</a>
          </nav>
        </aside>
        <div className="min-w-0">
          <p className="mb-7 text-sm leading-7 text-muted-foreground">Follow each stage below, then use the links to move directly into the relevant FreshPick pages.</p>
          <div className="divide-y divide-border border-y border-border">
            {guide.steps.map((step, index) => (
              <section key={step.id} id={step.id} className="scroll-mt-32 py-9 md:py-12" aria-labelledby={step.id + '-heading'}>
                <div className="flex items-start gap-5">
                  <span aria-hidden="true" className="pt-1 font-serif text-3xl text-brand-clay">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h2 id={step.id + '-heading'} className="font-serif text-2xl leading-tight text-brand-green md:text-3xl">{step.title}</h2>
                    <p className="mt-4 text-base leading-8">{step.summary}</p>
                    <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
                      {step.details.map(detail => <li key={detail}>{detail}</li>)}
                    </ul>
                    <Link href={step.action.href} className="editorial-link mt-6">{step.action.label}</Link>
                  </div>
                </div>
              </section>
            ))}
          </div>
          <section id="questions" className="scroll-mt-32 py-12">
            <p className="editorial-label">Useful answers</p>
            <h2 className="mt-3 font-serif text-3xl text-brand-green">Common questions.</h2>
            <div className="mt-7 divide-y divide-border border-t border-border">
              {guide.faqs.map(faq => (
                <article key={faq.question} className="py-6"><h3 className="text-lg font-semibold text-brand-green">{faq.question}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p></article>
              ))}
            </div>
          </section>
          <div className="border-l-4 border-brand-green bg-secondary/40 p-6">
            <h2 className="font-semibold text-brand-green">Important to know</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.caution}</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-6">
            <Link href={guide.primary.href} className="editorial-button">{guide.primary.label}</Link>
            <Link href="/how-it-works" className="editorial-link">All FreshPick guides</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
