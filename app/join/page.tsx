import Link from 'next/link';
import { Camera, CalendarDays, NotebookPen, ArrowUpRight } from 'lucide-react';
import { SupplierSignupForm } from '@/components/auth/SupplierSignupForm';
export const metadata = { title: 'Open your maker page' };
export default function Join() {
  return <><SupplierSignupForm/><section className="fp-section editorial-wrap join-features" data-studio-chapter>
    <div className="fp-section-head"><h2>Inside your maker page</h2><Link className="fp-inline" href="/how-it-works">How it works</Link></div>
    <div className="join-feature-grid" data-studio-grid>
      <div><Camera size={26} aria-hidden="true"/><h3>Your food.</h3><p>Add a photograph, a price and the details people ask for before they order.</p></div>
      <div><CalendarDays size={26} aria-hidden="true"/><h3>Your next batch.</h3><p>Set a preorder cutoff and collection time. Close the batch when it sells out.</p></div>
      <div><NotebookPen size={26} aria-hidden="true"/><h3>Your stories.</h3><p>Write about what you grow or cook. Tag your items so readers can contact you about them.</p></div>
    </div>
  </section><section className="join-next editorial-wrap" data-studio-chapter><div><p className="studio-overline">Start with your account</p><h2>From your kitchen to your own page.</h2></div><Link className="modern-primary" href="/auth/signup/customer?redirect=/join">Get started <ArrowUpRight size={18} aria-hidden="true"/></Link></section></>;
}
