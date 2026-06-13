import { Shield, Truck, Leaf, Award, Clock, CreditCard } from "lucide-react";

const badges = [
    {
        icon: Shield,
        title: "100% Secure",
        description: "Safe payments",
    },
    {
        icon: Truck,
        title: "Free Delivery",
        description: "Orders over Rs. 10000",
    },
    {
        icon: Leaf,
        title: "Farm Fresh",
        description: "Direct from farms",
    },
    {
        icon: Award,
        title: "Premium Quality",
        description: "Handpicked items",
    },
    {
        icon: Clock,
        title: "Same-Day Delivery",
        description: "Order before 2PM",
    },
    {
        icon: CreditCard,
        title: "Easy Returns",
        description: "Hassle-free refunds",
    },
];

export default function TrustBadges() {
    return (
        <section className="border-b border-zinc-100 bg-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
                    {badges.map((badge) => (
                        <div
                            key={badge.title}
                            className="group flex items-center gap-4 rounded-none p-4 transition-all duration-300"
                        >
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 transition-all duration-500 group-hover:border-emerald-900 group-hover:bg-emerald-900">
                                <badge.icon className="h-5 w-5 stroke-1 text-zinc-900 transition-colors duration-500 group-hover:text-emerald-50" />
                            </div>
                            <div>
                                <p className="font-serif text-base font-medium tracking-wide text-zinc-900">{badge.title}</p>
                                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
