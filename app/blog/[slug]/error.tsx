'use client';

import Link from 'next/link';

interface BlogArticleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogArticleError({ error, reset }: BlogArticleErrorProps) {
  console.error('[Blog article] Route render failed:', error);

  return (
    <main className="min-h-[70vh] bg-background">
      <section className="editorial-wrap py-16 md:py-24">
        <p className="editorial-label">FreshPick blog</p>
        <h1 className="mt-4 max-w-2xl font-heading text-4xl font-normal leading-tight md:text-5xl">
          This story could not load.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
          The article hit a temporary data error. You can retry the article or return to the blog without losing the rest of the site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Back to blog
          </Link>
        </div>
      </section>
    </main>
  );
}
