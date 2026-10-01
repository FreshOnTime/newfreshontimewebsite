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
      <body className="flex min-h-screen items-center justify-center bg-background p-5 font-sans text-zinc-950">
        <main className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-background">
          <section className="bg-background p-8 text-foreground md:p-12">
            <span className="text-xs font-bold normal-case text-brand-green">FreshPick recovery</span>
            <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight">Something slipped.</h1>
            <p className="mt-5 max-w-lg text-sm font-normal leading-7 text-muted-foreground">The page hit an unexpected error before it could finish. Your next step is simply to try the request again.</p>
          </section>
          <section className="p-7 md:p-9">
            <p className="text-sm font-normal leading-7 text-zinc-500">If the same problem keeps appearing, return to FreshPick and try the action again from the relevant page.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => reset()} className="rounded-full bg-brand-amber px-6 py-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85">Try again</button>
              {/* A full reload recovers failures in the root layout. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="rounded-full border border-zinc-300 px-6 py-3 text-xs font-semibold text-zinc-700">FreshPick home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
