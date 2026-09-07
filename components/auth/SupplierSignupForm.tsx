'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Store, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inputClass = 'h-12 rounded-xl border-zinc-200 bg-white px-4 shadow-none focus-visible:ring-emerald-700/20';

export function SupplierSignupForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    registrationAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Sri Lanka'
    }
  });

  const [productList, setProductList] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const router = useRouter();
  const { signup, refreshAuth } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      registrationAddress: { ...prev.registrationAddress, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setServerError(null);
      setFieldErrors(null);

      await signup({
        firstName: formData.contactName,
        lastName: undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        registrationAddress: formData.registrationAddress
      });

      try {
        await fetch('/api/suppliers/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: formData.companyName,
            contactName: formData.contactName,
            address: formData.registrationAddress,
            email: formData.email,
            phone: formData.phoneNumber,
            productList: productList || undefined
          })
        });
        try {
          await refreshAuth();
        } catch (refreshErr) {
          console.warn('Failed to refresh auth after supplier register', refreshErr);
        }
      } catch (profileError) {
        console.error('Supplier profile creation failed', profileError);
      }

      router.push('/dashboard');
    } catch (e) {
      console.error('Supplier signup failed', e);
      if (e && typeof e === 'object') {
        const err = e as ServerError;
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        if (err.message) setServerError(err.message || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f1] lg:grid lg:grid-cols-[0.86fr_1.14fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#08130d] lg:sticky lg:top-0 lg:block lg:h-screen">
        <Image src="/bgs/home-hero.jpg" alt="FreshPick partner network" fill priority sizes="43vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07110c]/30" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
          <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200"><Store className="h-3.5 w-3.5" /> Curated partner network</span>
          <h2 className="mt-5 font-serif text-5xl font-normal leading-[0.94] tracking-[-0.035em] xl:text-6xl">Supply a food experience, not another <span className="italic text-emerald-200">open marketplace.</span></h2>
          <p className="mt-5 max-w-lg text-sm font-light leading-7 text-white/62">FreshPick works with selected suppliers and makers. Tell us what you supply, where you operate and how we can build a dependable customer experience together.</p>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-4 w-4" /> Account type</Link>
            <Link href="/" className="font-serif text-2xl font-bold tracking-[-0.03em] text-emerald-950">Fresh<span className="italic text-emerald-500">Pick</span></Link>
          </div>

          <div className="mt-12 border-b border-zinc-300 pb-8">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Partner application</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] text-zinc-950 md:text-6xl">Tell us about your supply business.</h1>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-zinc-500">This creates your account and sends the supplier details needed for onboarding. Product catalogue work can continue from the supplier dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-10">
            <section>
              <div className="mb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">01 · Business</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-zinc-950">Who are we partnering with?</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Company name *" htmlFor="companyName"><Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required className={inputClass} /></Field></div>
                <Field label="Contact person *" htmlFor="contactName"><Input id="contactName" value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} required className={inputClass} /></Field>
                <Field label="Phone *" htmlFor="phone"><Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className={inputClass} /></Field>
                <Field label="Email" htmlFor="email"><Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} /></Field>
                <div />
                <Field label="Password *" htmlFor="password"><Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={inputClass} /></Field>
                <Field label="Confirm password *" htmlFor="confirmPassword"><Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={inputClass} /></Field>
              </div>
            </section>

            <section className="border-t border-zinc-300 pt-9">
              <div className="mb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">02 · Operations</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-zinc-950">Where do you operate?</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Business address *" htmlFor="addressLine1"><Input id="addressLine1" value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className={inputClass} /></Field></div>
                <div className="md:col-span-2"><Field label="Address line 2" htmlFor="addressLine2"><Input id="addressLine2" value={formData.registrationAddress.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} className={inputClass} /></Field></div>
                <Field label="City *" htmlFor="city"><Input id="city" value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required className={inputClass} /></Field>
                <Field label="Province *" htmlFor="province"><Input id="province" value={formData.registrationAddress.province} onChange={(e) => handleAddressChange('province', e.target.value)} required className={inputClass} /></Field>
                <Field label="Postal code *" htmlFor="postalCode"><Input id="postalCode" value={formData.registrationAddress.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required className={inputClass} /></Field>
                <Field label="Country" htmlFor="country"><Input id="country" value={formData.registrationAddress.country} disabled className={`${inputClass} text-zinc-500`} /></Field>
              </div>
            </section>

            <section className="border-t border-zinc-300 pt-9">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><Truck className="h-4 w-4" /></span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">03 · Supply</p>
                  <h2 className="mt-1 font-serif text-2xl font-normal text-zinc-950">What do you supply?</h2>
                </div>
              </div>
              <Label htmlFor="productList" className="text-sm font-medium text-zinc-700">Product list or short catalogue note</Label>
              <textarea id="productList" value={productList} onChange={(e) => setProductList(e.target.value)} className="mt-2 min-h-[130px] w-full rounded-[1rem] border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-700/10" placeholder="E.g. fresh produce, bakery, dairy, ready meals, specialty pantry items…" />
              <p className="mt-2 text-xs font-light leading-5 text-zinc-400">A full product list can be uploaded later from your supplier dashboard.</p>
            </section>

            {(serverError || fieldErrors) && (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key]?.join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-zinc-300 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-light leading-5 text-zinc-400">Submitting does not imply automatic public listing. FreshPick reviews and manages supplier relationships as a curated network.</p>
              <Button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-full bg-zinc-950 px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-none hover:bg-emerald-950">
                {isLoading ? 'Submitting…' : <span className="inline-flex items-center gap-2">Submit application <ArrowRight className="h-4 w-4" /></span>}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700">{label}</Label>
      {children}
    </div>
  );
}
