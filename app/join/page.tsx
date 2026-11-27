import {Suspense} from 'react';
import {SupplierSignupForm} from '@/components/auth/SupplierSignupForm';
export const metadata={title:'List your food business'};
export default function Join(){return <Suspense fallback={<p className="editorial-wrap py-12">Loading business registration…</p>}><SupplierSignupForm/></Suspense>}
