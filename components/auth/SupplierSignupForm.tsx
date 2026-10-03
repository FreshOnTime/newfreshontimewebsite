'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { signupSchema, validateInput } from '@/lib/utils/validation';
import { apiFetch } from '@/lib/api/client';
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

  const [accountCreated, setAccountCreated] = useState(false);
  const [productList, setProductList] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const router = useRouter();
  const { user, signup, refreshAuth } = useAuth();

  useEffect(() => {
    if (!user || accountCreated) return;
    setAccountCreated(true);
    setFormData(previous => ({
      ...previous, contactName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.email || '', phoneNumber: user.phoneNumber || '',
    }));
  }, [user, accountCreated]);

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

      if (!accountCreated) {
        const validation = validateInput(signupSchema, {
          firstName: formData.contactName, email: formData.email || undefined,
          phoneNumber: formData.phoneNumber, password: formData.password,
          registrationAddress: formData.registrationAddress,
        });
        if (!validation.isValid) { setFieldErrors(validation.errors || null); return; }
        await signup(validation.data!);
        setAccountCreated(true);
      }
      const response = await apiFetch('/api/suppliers/register', {
        method: 'POST',
        body: JSON.stringify({
          companyName: formData.companyName, contactName: formData.contactName,
          address: formData.registrationAddress, email: formData.email,
          phone: formData.phoneNumber, productListCsv: productList || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your supplier application. Please retry.');
      await refreshAuth();

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

      <section className="px-0 py-4 sm:px-4 lg:px-2 xl:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Account type</Link>

          </div>

          <div className="mt-6 border-b border-border pb-8">
            <span className="text-xs font-bold normal-case text-brand-green">Partner application</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground md:text-4xl">Create a supplier account</h1>
            <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">This creates your account and sends the supplier details needed for onboarding. The FreshPick team reviews your application before enabling catalogue uploads.</p>
            {accountCreated && <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-brand-green">Your login account is connected. Complete the business details below to save your supplier application.</p>}
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-10">
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-brand-green">01 · Business</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Who are we partnering with?</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Business or producer name *" htmlFor="companyName"><Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required className={inputClass} /></Field></div>
                <Field label="Contact person *" htmlFor="contactName"><Input id="contactName" disabled={accountCreated} value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} required className={inputClass} /></Field>
                <Field label="Phone *" htmlFor="phone"><Input id="phone" type="tel" autoComplete="tel" disabled={accountCreated && Boolean(user?.phoneNumber)} value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className={inputClass} /></Field>
                <Field label="Email" htmlFor="email"><Input id="email" disabled={accountCreated} type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} /></Field>
                <div />
                <Field label="Password *" htmlFor="password"><PasswordInput id="password" disabled={accountCreated} autoComplete="new-password" minLength={8} aria-describedby="supplier-password-guidance" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={inputClass} /></Field>
                <Field label="Confirm password *" htmlFor="confirmPassword"><PasswordInput id="confirmPassword" disabled={accountCreated} autoComplete="new-password" minLength={8} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={inputClass} /></Field>
              </div>
            </section>

            <p id="supplier-password-guidance" className="text-xs leading-6 text-muted-foreground">Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.</p>

            <section className="border-t border-border pt-9">
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-brand-green">02 · Operations</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Where do you operate?</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Business or growing address *" htmlFor="addressLine1"><Input id="addressLine1" value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className={inputClass} /></Field></div>
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
              <textarea id="productList" value={productList} onChange={(e) => setProductList(e.target.value)} className="mt-2 min-h-[130px] w-full rounded-lg border border-border bg-background p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" aria-describedby="supplier-product-help" placeholder="E.g. home-grown greens, vegetables, homemade meals, bakery, beverages or pantry staples…" />
              <p id="supplier-product-help" className="mt-2 text-xs font-normal leading-5 text-muted-foreground">Start with what you grow, make or supply, the quantities available and your usual lead time. After approval, upload your catalogue from your supplier dashboard.</p>
            </section>

            {(serverError || fieldErrors) && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {accountCreated && <p className="mb-2 font-semibold">Your login account is ready. Retry below to finish the supplier application.</p>}{serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key]?.join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-normal leading-5 text-muted-foreground">Submitting does not imply automatic public listing. FreshPick reviews and manages supplier relationships as a curated network.</p>
              <Button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-md bg-brand-leaf px-7 text-sm font-semibold normal-case text-brand-ink shadow-none hover:bg-brand-leaf/85">
                {isLoading ? 'Submitting…' : <span className="inline-flex items-center gap-2">{accountCreated ? 'Finish application' : 'Submit application'} <ArrowRight className="h-4 w-4" /></span>}
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
