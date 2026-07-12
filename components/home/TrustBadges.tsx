import { ShieldCheck, Sprout, CalendarClock, HandHeart } from "lucide-react";

const badges = [
    {
        icon: Sprout,
        title: "Provenance first",
        description: "Selected growers and makers",
    },
    {
        icon: CalendarClock,
        title: "Your rhythm",
        description: "Once or on a recurring plan",
    },
    {
        icon: HandHeart,
        title: "Human service",
        description: "Care from order to arrival",
    },
    {
        icon: ShieldCheck,
        title: "Simply guaranteed",
        description: "Replace or refund with ease",
    },
];

export default function TrustBadges() {
    return (
        <section className="border-y border-[#d8d0c1] bg-[#faf8f3]">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.title}
                            className="group flex min-h-32 items-center gap-5 border-b border-[#d8d0c1] px-4 py-8 last:border-b-0 md:px-8 lg:border-b-0 lg:border-r lg:last:border-r-0"
                        >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-[#8b6d32]">
                                <badge.icon className="h-5 w-5 stroke-1" />
                            </div>
                            <div>
                                <p className="font-serif text-lg font-normal text-[#17241c]">{badge.title}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
