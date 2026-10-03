import { Suspense } from 'react';
import { privateMetadata } from '@/lib/seo';
import UnsubscribeForm from './UnsubscribeForm';
export const metadata = privateMetadata;
export default function Page(){return <Suspense fallback={<p role="status">Loading…</p>}><UnsubscribeForm /></Suspense>;}
