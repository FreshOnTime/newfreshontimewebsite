import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Category {
    name: string;
    slug: string;
    imageUrl?: string;
    description?: string;
}

interface CategoryBentoProps {
    categories: Category[];
}

const layout = [
    "md:col-span-7 md:row-span-2",
    "md:col-span-5 md:row-span-1",
    "md:col-span-5 md:row-span-1",
    "md:col-span-4 md:row-span-1",
    "md:col-span-8 md:row-span-1",
];

export default function CategoryBento({ categories }: CategoryBentoProps) {
    const featured = categories.slice(0, 5);

    if (!featured.length) return null;

    return (
        <section className="bg-[#f6f7f4] py-24 md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-12 grid gap-7 md:mb-16 md:grid-cols-[1fr_0.72fr] md:items-end">
                    <div className="max-w-3xl">
                        <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">
                            Shop by mood
                        </span>
                        <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">
                            Find your next <span className="italic text-emerald-900">favourite.</span>
                        </h2>
                    </div>
                    <div className="md:justify-self-end">
                        <p className="max-w-lg text-base font-light leading-7 text-zinc-600">
                            Browse FreshPick by the way you actually shop — fresh staples, prepared food, local discoveries, and more.
                        </p>
                        <Link
                            href="/categories"
                            className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950 transition-colors hover:text-emerald-700"
                        >
                            See every collection <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid auto-rows-[260px] grid-cols-1 gap-4 md:auto-rows-[280px] md:grid-cols-12 md:gap-5">
                    {featured.map((category, index) => (
                        <Link
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className={`group relative isolate overflow-hidden rounded-[1.75rem] bg-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.08)] ${layout[index] ?? "md:col-span-6"}`}
                        >
                            {category.imageUrl ? (
                                <Image
                                    src={category.imageUrl}
                                    alt={category.name}
                                    fill
                                    sizes={index === 0 ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 40vw"}
                                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(167,243,208,0.42),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(250,204,21,0.18),transparent_34%),linear-gradient(135deg,#065f46,#022c22)]" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/16 to-transparent transition-colors group-hover:from-black/68" />
                            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                                <div className="flex items-end justify-between gap-6">
                                    <div>
                                        <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.24em] text-white/55">
                                            Collection {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <h3 className={`font-serif font-normal leading-none ${index === 0 ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}>
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="mt-3 max-w-lg text-sm font-light leading-6 text-white/70 line-clamp-2">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all group-hover:rotate-6 group-hover:bg-white group-hover:text-zinc-950">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
