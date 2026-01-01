import { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';

export const metadata: Metadata = {
    title: 'Blog | Fresh Pick',
    description: 'Read our latest articles, tips, and news about fresh produce and healthy living',
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-zinc-950 text-white py-24 md:py-32 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-transparent to-zinc-950"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="text-emerald-500 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">
                        Editorial
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 tracking-tight">The Journal</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Insights on provenance, culinary excellence, and the art of living well.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20">
                <BlogList />
            </div>
        </div>
    );
}
