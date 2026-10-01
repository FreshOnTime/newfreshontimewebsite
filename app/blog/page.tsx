import { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';

export const metadata: Metadata = {
    title: 'Blog | Fresh Pick',
    description: 'Read our latest articles, tips, and news about fresh produce and healthy living',
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            <PremiumPageHeader title="The Journal" subtitle="Notes on provenance, culinary culture, and the quiet art of living well." eyebrow="Editorial" />

            <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
                <BlogList />
            </div>
        </div>
    );
}
