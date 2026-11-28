import {Suspense} from 'react';
import {SupplierSignupForm} from '@/components/auth/SupplierSignupForm';
export default function BusinessOnboardingPage(){return <Suspense fallback={<p role="status" className="editorial-wrap py-12">Loading business onboarding…</p>}><SupplierSignupForm onboarding/></Suspense>}
