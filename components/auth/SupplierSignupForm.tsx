'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inputClass = 'h-12 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20';

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
    <div className="bg-background">

      <section className="px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Account type</Link>

          </div>

          <div className="mt-6 border-b border-border pb-8">
            <span className="text-xs font-bold normal-case text-brand-green">Partner application</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground md:text-4xl">Create a supplier account</h1>
            <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">This creates your account and sends the supplier details needed for onboarding. Product catalogue work can continue from the supplier dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-10">
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-brand-green">01 · Business</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Who are we partnering with?</h2>
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

            <section className="border-t border-border pt-9">
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-brand-green">02 · Operations</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Where do you operate?</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Business address *" htmlFor="addressLine1"><Input id="addressLine1" value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className={inputClass} /></Field></div>
                <div className="md:col-span-2"><Field label="Address line 2" htmlFor="addressLine2"><Input id="addressLine2" value={formData.registrationAddress.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} className={inputClass} /></Field></div>
                <Field label="City *" htmlFor="city"><Input id="city" value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required className={inputClass} /></Field>
                <Field label="Province *" htmlFor="province"><Input id="province" value={formData.registrationAddress.province} onChange={(e) => handleAddressChange('province', e.target.value)} required className={inputClass} /></Field>
                <Field label="Postal code *" htmlFor="postalCode"><Input id="postalCode" value={formData.registrationAddress.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required className={inputClass} /></Field>
                <Field label="Country" htmlFor="country"><Input id="country" value={formData.registrationAddress.country} disabled className={` ${inputClass} text-muted-foreground`} /></Field>
              </div>
            </section>

            <section className="border-t border-border pt-9">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-brand-green"><Truck className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-bold normal-case text-brand-green">03 · Supply</p>
                  <h2 className="mt-1 font-serif text-2xl font-normal text-foreground">What do you supply?</h2>
                </div>
              </div>
              <Label htmlFor="productList" className="text-sm font-medium text-foreground">Product list or short catalogue note</Label>
              <textarea id="productList" value={productList} onChange={(e) => setProductList(e.target.value)} className="mt-2 min-h-[130px] w-full rounded-lg border border-border bg-background p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="E.g. fresh produce, bakery, dairy, ready meals, specialty pantry items…" />
              <p className="mt-2 text-xs font-normal leading-5 text-muted-foreground">A full product list can be uploaded later from your supplier dashboard.</p>
            </section>

            {(serverError || fieldErrors) && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key]?.join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-normal leading-5 text-muted-foreground">Submitting does not imply automatic public listing. FreshPick reviews and manages supplier relationships as a curated network.</p>
              <Button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-md bg-primary px-7 text-xs font-bold normal-case text-accent-foreground shadow-none hover:bg-primary/85">
                {isLoading ? 'Submitting…' : <span className="inline-flex items-center gap-2">Submit application <ArrowRight className="h-4 w-4" /></span>}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
