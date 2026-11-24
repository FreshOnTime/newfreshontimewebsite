import Link from 'next/link';
import { SupplierSignupForm } from '@/components/auth/SupplierSignupForm';
export const metadata = { title: 'Open your maker page' };
export default function Join() {
  return <><SupplierSignupForm/><section className="fp-section editorial-wrap">
    <div className="fp-section-head"><h2>Inside your maker page</h2><Link className="fp-inline" href="/how-it-works">How it works</Link></div>
    <div className="fp-join-tools">
      <div><h3>Your food</h3><p>Add a photograph, a price and the details people ask for before they order.</p></div>
      <div><h3>Your next batch</h3><p>Set a preorder cutoff and collection time. Close the batch when it sells out.</p></div>
      <div><h3>Your stories</h3><p>Write about what you grow or cook. Tag your items so readers can contact you about them.</p></div>
    </div>
  </section></>;
}
