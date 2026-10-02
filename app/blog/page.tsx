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
            <PremiumPageHeader title="The Journal" subtitle="Recipes, ingredient ideas and stories from the FreshPick market." eyebrow="Editorial" backgroundImage="/images/editorial/pepper-mortar.webp" imageLayout="compact" />

            <div className="editorial-wrap py-10 md:py-16">
                <BlogList />
            </div>
        </div>
    );
}
