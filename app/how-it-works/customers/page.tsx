
import type { Metadata } from 'next';
import GuidePage from '@/components/guides/GuidePage';
import { customerGuide } from '@/lib/marketGuides';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata: Metadata = publicPageMetadata('/how-it-works/customers');
export default function CustomerHowItWorksPage() { return <GuidePage guide={customerGuide} />; }
