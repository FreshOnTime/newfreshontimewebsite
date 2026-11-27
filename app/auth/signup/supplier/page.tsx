import {Suspense} from 'react';
import {SupplierSignupForm} from '@/components/auth/SupplierSignupForm';
export default function SupplierSignupPage(){return <Suspense fallback={<p>Loading business registration…</p>}><SupplierSignupForm/></Suspense>}