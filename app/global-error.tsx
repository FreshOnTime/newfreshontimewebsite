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
      <body className="flex min-h-screen items-center justify-center bg-[#f4f5f1] p-5 font-sans text-zinc-950">
        <main className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
          <section className="bg-[#0b1710] p-8 text-white md:p-12">
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200">FreshPick recovery</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.035em]">Something slipped.</h1>
            <p className="mt-5 max-w-lg text-sm font-light leading-7 text-white/55">The page hit an unexpected error before it could finish. Your next step is simply to try the request again.</p>
          </section>
          <section className="p-7 md:p-9">
            <p className="text-sm font-light leading-7 text-zinc-500">If the same problem keeps appearing, return to FreshPick and try the action again from the relevant page.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => reset()} className="rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-950">Try again</button>
              <a href="/" className="rounded-full border border-zinc-300 px-6 py-3 text-xs font-semibold text-zinc-700">FreshPick home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
