import {Suspense} from 'react';
import {SupplierSignupForm} from '@/components/auth/SupplierSignupForm';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({title:'List your food business in Sri Lanka',description:'Create a FreshPick business page to showcase your restaurant, bakery, café or independent food brand and connect directly with customers.',path:'/join'});
export default function Join(){return <Suspense fallback={<p className="editorial-wrap py-12">Loading business registration…</p>}><SupplierSignupForm/></Suspense>}
