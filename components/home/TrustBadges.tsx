import { CalendarClock, HandHeart, ShieldCheck, Sprout } from "lucide-react";

const badges = [
    {
        icon: Sprout,
        title: "Fresh by design",
        description: "Curated growers and makers",
    },
    {
        icon: CalendarClock,
        title: "Flexible delivery",
        description: "One-off or recurring baskets",
    },
    {
        icon: HandHeart,
        title: "Human support",
        description: "Real help when you need it",
    },
    {
        icon: ShieldCheck,
        title: "Simple guarantee",
        description: "Replace or refund with ease",
    },
];

export default function TrustBadges() {
    return (
        <section className="border-b border-zinc-200 bg-white">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="grid grid-cols-2 divide-x divide-y divide-zinc-200 border-x border-zinc-200 md:grid-cols-4 md:divide-y-0">
                    {badges.map((badge) => (
                        <div
                            key={badge.title}
                            className="flex min-h-[112px] items-center gap-4 px-4 py-6 md:min-h-[124px] md:px-6 lg:px-8"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                                <badge.icon className="h-4 w-4 stroke-[1.5]" />
                            </div>
                            <div>
                                <p className="font-serif text-base font-normal leading-tight text-zinc-950 md:text-lg">{badge.title}</p>
                                <p className="mt-1 hidden text-[9px] uppercase tracking-[0.14em] text-zinc-500 sm:block">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
