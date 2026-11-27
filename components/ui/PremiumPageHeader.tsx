import { PageBand } from '@/components/makers/Edition';

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  backgroundColor?: string;
  count?: number;
  isLoading?: boolean;
  eyebrow?: string;
  imageLayout?: 'feature' | 'compact';
}

export default function PremiumPageHeader({ title, subtitle, backgroundImage, count, isLoading, eyebrow }: PremiumPageHeaderProps) {
  if (isLoading) return <div className="fp-band" role="status"><div className="editorial-wrap py-12">Loading…</div></div>;
  return <>
    <PageBand title={title} intro={subtitle} image={backgroundImage || undefined} eyebrow={eyebrow}/>
    {count !== undefined && <p className="editorial-wrap pt-4 text-sm" aria-live="polite">{count} {count === 1 ? 'item' : 'items'}</p>}
  </>;
}
