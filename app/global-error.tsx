"use client";

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-5 font-sans text-foreground">
        <main className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-background">
          <section className="bg-background p-8 text-foreground md:p-12">
            <span className="text-xs font-bold normal-case text-brand-green">FreshPick recovery</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight">Something slipped.</h1>
            <p className="mt-5 max-w-lg text-sm font-normal leading-7 text-muted-foreground">The page hit an unexpected error before it could finish. Your next step is simply to try the request again.</p>
          </section>
          <section className="p-7 md:p-9">
            <p className="text-sm font-normal leading-7 text-muted-foreground">If the same problem keeps appearing, return to FreshPick and try the action again from the relevant page.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => reset()} className="rounded-full bg-brand-leaf px-6 py-3 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-leaf/85">Try again</button>
              {/* A full reload recovers failures in the root layout. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="rounded-md border border-border px-6 py-3 text-xs font-semibold text-foreground">FreshPick home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
