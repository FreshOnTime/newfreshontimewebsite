
import type { Metadata } from 'next';
import GuidePage from '@/components/guides/GuidePage';
import { supplierGuide } from '@/lib/marketGuides';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata: Metadata = publicPageMetadata('/how-it-works/suppliers');
export default function SupplierHowItWorksPage() { return <GuidePage guide={supplierGuide} />; }
