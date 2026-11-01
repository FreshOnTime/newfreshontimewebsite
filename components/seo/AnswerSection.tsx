import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/config/site";
import type { AnswerItem } from "@/lib/answerContent";

interface AnswerSectionProps {
  title: string;
  eyebrow?: string;
  introduction?: string;
  questions: readonly AnswerItem[];
  path: string;
  id?: string;
}

/** Visible, citation-ready answers with matching server-rendered FAQ structured data. */
export default function AnswerSection({
  title,
  eyebrow = "Useful answers",
  introduction,
  questions,
  path,
  id = "questions",
}: AnswerSectionProps) {
  if (questions.length === 0) return null;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": absoluteUrl(path + "#" + id),
        "mainEntity": questions.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": { "@type": "Answer", "text": item.answer },
        })),
      }} />
      <section id={id} aria-labelledby={id + "-title"} className="editorial-wrap scroll-mt-28 py-14 md:py-20">
        <div className="grid gap-10 border-t border-brand-green/15 pt-12 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="editorial-label">{eyebrow}</p>
            <h2 id={id + "-title"} className="editorial-title mt-5">{title}</h2>
            {introduction && <p className="mt-5 max-w-[46ch] text-base leading-8 text-muted-foreground">{introduction}</p>}
          </div>
          <div className="divide-y divide-brand-green/15 border-y border-brand-green/15">
            {questions.map((item, index) => (
              <article key={item.question} className="grid gap-3 py-6 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-5">
                <span className="pt-1 font-mono text-xs font-semibold text-brand-clay" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-snug tracking-[-.025em] text-brand-green-deep sm:text-xl">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base sm:leading-8">{item.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
