import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Compass,
  Layers3,
  Repeat2,
  Search,
  Sparkles,
  Store,
  UsersRound,
} from "lucide-react";

const signalRows = [
  { label: "Dinner inspiration", value: "Recipe-led" },
  { label: "Weekly essentials", value: "Repeat-aware" },
  { label: "Local discoveries", value: "Taste-led" },
];

const platformPills = [
  { icon: BrainCircuit, label: "Taste Graph" },
  { icon: Repeat2, label: "Smart Basket" },
  { icon: UsersRound, label: "Creator Commerce" },
  { icon: Store, label: "Partner Network" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden bg-[#07100b] text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_8%_10%,rgba(52,211,153,0.18),transparent_28%),radial-gradient(circle_at_78%_24%,rgba(163,230,53,0.10),transparent_24%),linear-gradient(180deg,#07100b_0%,#09150e_58%,#07100b_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.17] [background-image:linear-gradient(rgba(255,255,255,0.065)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.065)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute left-1/2 top-20 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-300/[0.035] blur-3xl" />

      <div className="container mx-auto max-w-[1560px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40 lg:px-14 xl:px-16">
        <div className="grid min-h-[calc(92svh-10rem)] items-center gap-14 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,0.78fr)] xl:gap-16">
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-200 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" /> The food intelligence layer for everyday life
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/35">Built in Colombo · for Sri Lanka</span>
            </div>

            <h1 className="mt-8 max-w-5xl text-balance font-serif text-[3.65rem] font-normal leading-[0.88] tracking-[-0.048em] text-white sm:text-7xl md:text-8xl lg:text-[6.8rem]">
              Food discovery that gets <span className="italic text-emerald-200">smarter with you.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/62 md:text-lg">
              FreshPick connects taste, recipes, recurring household needs, local makers and live grocery commerce in one premium experience — so you spend less time searching and more time choosing what fits.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] shadow-[0_16px_48px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                <Compass className="h-4 w-4" /> Open FreshPick
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/recipes"
                className="inline-flex h-14 items-center gap-3 rounded-full border border-white/14 bg-white/[0.055] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition-all hover:border-emerald-200/30 hover:bg-white/[0.08] hover:text-white"
              >
                Explore shoppable recipes
              </Link>
            </div>

            <div className="mt-11 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
              {platformPills.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/10 px-4 py-3 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-emerald-200/80" />
                  <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative xl:justify-self-end">
            <div className="absolute -inset-12 -z-10 rounded-full bg-emerald-300/[0.055] blur-3xl" />
            <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0b1710]/90 shadow-[0_40px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/48">FreshPick home</span>
                </div>
                <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-200">Taste-aware</span>
              </div>

              <div className="p-4 md:p-5">
                <div className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.045] p-4 md:p-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/15 px-4 py-3">
                    <Search className="h-4 w-4 text-white/35" />
                    <span className="text-sm font-light text-white/38">What are you in the mood for?</span>
                    <span className="ml-auto rounded-lg bg-white/[0.06] px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-white/30">⌘ K</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[1.4rem] bg-gradient-to-br from-emerald-300/14 to-emerald-300/[0.03] p-5 ring-1 ring-emerald-200/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-200">For tonight</p>
                          <h2 className="mt-3 font-serif text-2xl font-normal leading-tight text-white">Start with the meal, not the aisle.</h2>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07]">
                          <Layers3 className="h-4 w-4 text-emerald-200" />
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-light leading-6 text-white/48">Recipes connect directly to live catalogue products and stock-aware substitutions.</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                        <Check className="h-3.5 w-3.5" /> One-action ingredient basket
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/[0.08] bg-black/10 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">Taste signals</p>
                        <BrainCircuit className="h-4 w-4 text-emerald-200/70" />
                      </div>
                      <div className="mt-5 space-y-4">
                        {signalRows.map((row, index) => (
                          <div key={row.label}>
                            <div className="flex items-center justify-between gap-3 text-[11px]">
                              <span className="text-white/55">{row.label}</span>
                              <span className="text-emerald-200/75">{row.value}</span>
                            </div>
                            <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                              <div className={`h-full rounded-full bg-emerald-300/65 ${index === 0 ? "w-[88%]" : index === 1 ? "w-[72%]" : "w-[56%]"}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      ["Discover", "Taste-first"],
                      ["Repeat", "Routine-aware"],
                      ["Source", "Partner-led"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/[0.07] bg-black/10 p-3.5">
                        <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/28">{label}</p>
                        <p className="mt-1.5 text-[11px] text-white/62">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-[1.3rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-300/10">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                    </span>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.19em] text-white/28">FreshPick intelligence</p>
                      <p className="mt-1 text-xs text-white/58">One system connecting discovery, commerce and supply.</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
