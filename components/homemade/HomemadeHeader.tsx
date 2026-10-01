
import { Sparkles } from 'lucide-react';

export default function HomemadeHeader() {
    return (
        <div className="relative w-full bg-emerald-950 text-white overflow-hidden">
            {/* Search Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="relative container mx-auto px-6 py-10 md:py-12 flex flex-col items-center text-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-brand-green text-xs font-bold normal-case mb-6">
                    <Sparkles className="w-3 h-3" />
                    <span>Curated Excellence</span>
                </div>

                <h1 className="text-4xl md:text-4xl font-sans font-medium mb-6 tracking-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-white to-emerald-100 pb-2">
                        Homemade &
                    </span>
                    <span className="block not-italic text-emerald-400">Handcrafted</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-zinc-300 font-normal leading-relaxed">
                    Discover a curated collection of premium domestic produce from small entrepreneurs.
                    Each item is a testament to passion, quality, and the art of creation.
                </p>
            </div>

            {/* Gold Divider */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-900 via-emerald-400 to-emerald-900 opacity-80" />
        </div>
    );
}
