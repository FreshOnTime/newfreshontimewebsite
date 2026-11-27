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
      <body className="flex min-h-screen items-center justify-center bg-[#F8F5EE] p-5 font-sans text-[#202E28]">
        <main className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D9E0D3] bg-[#FFFDF8]">
          <section className="bg-[#202E28] p-8 text-white md:p-12">
            <span className="text-xs font-bold normal-case text-[#A9DB76]">FreshPick recovery</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight">Something slipped.</h1>
            <p className="mt-5 max-w-lg text-sm font-normal leading-7 text-[#E5EDE3]">The page hit an unexpected error before it could finish. Your next step is simply to try the request again.</p>
          </section>
          <section className="p-7 md:p-9">
            <p className="text-sm font-normal leading-7 text-muted-foreground">If the same problem keeps appearing, return to FreshPick and try the action again from the relevant page.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => reset()} className="rounded-lg bg-[#A9DB76] px-6 py-3 text-sm font-semibold text-[#202E28] transition-colors hover:bg-[#97CE62]">Try again</button>
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
