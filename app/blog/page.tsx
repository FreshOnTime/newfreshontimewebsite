import { publicPageMetadata } from '@/lib/publicPages';
import { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import { firstJournalPage } from '@/lib/journalService';

export const revalidate = 60;

export const metadata: Metadata = publicPageMetadata('/blog');

export default async function BlogPage() {
    const initialData = await firstJournalPage().catch(() => null);
    return (
        <div className="min-h-screen bg-background">
            <PremiumPageHeader title="The Blog" subtitle="Food stories, ingredient ideas and people from the FreshPick market." eyebrow="Editorial" backgroundImage="/images/editorial/pepper-mortar.webp" imageLayout="compact" />

            <div className="editorial-wrap py-10 md:py-16">
                <BlogList initialData={initialData} />
            </div>
        </div>
    );
}
