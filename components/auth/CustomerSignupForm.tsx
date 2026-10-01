"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inputClass = 'h-12 rounded-xl border-zinc-200 bg-white px-4 shadow-none focus-visible:ring-emerald-700/20';

export function CustomerSignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const router = useRouter();
  const { signup } = useAuth();

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
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        registrationAddress: formData.registrationAddress
      });

      router.push('/');
    } catch (e) {
      console.error('Customer signup failed', e);
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
    <main className="bg-background">

      <section className="px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="h-4 w-4" /> Account type
            </Link>

          </div>

          <div className="mt-6 border-b border-zinc-300 pb-8">
            <span className="text-xs font-bold normal-case text-emerald-700">Create your FreshPick</span>
            <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight text-zinc-950 md:text-4xl">Create a customer account</h1>
            <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-zinc-500">We ask for a delivery address now so checkout can stay fast later. You can update it from your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold normal-case text-emerald-700">01 · Account</p>
                  <h2 className="mt-2 font-sans text-2xl font-semibold text-zinc-950">About you</h2>
                </div>
                <span className="text-xs text-muted-foreground">* required</span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="First name *" htmlFor="firstName">
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Email" htmlFor="email">
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Phone number *" htmlFor="phone">
                  <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Password *" htmlFor="password">
                  <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Confirm password *" htmlFor="confirmPassword">
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={inputClass} />
                </Field>
              </div>
            </section>

            <section className="border-t border-zinc-300 pt-9">
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-emerald-700">02 · Delivery</p>
                <h2 className="mt-2 font-sans text-2xl font-semibold text-zinc-950">Where should FreshPick come to?</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Address line 1 *" htmlFor="addressLine1">
                    <Input id="addressLine1" value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className={inputClass} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Address line 2" htmlFor="addressLine2">
                    <Input id="addressLine2" value={formData.registrationAddress.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <Field label="City *" htmlFor="city">
                  <Input id="city" value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Province *" htmlFor="province">
                  <Input id="province" value={formData.registrationAddress.province} onChange={(e) => handleAddressChange('province', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Postal code *" htmlFor="postalCode">
                  <Input id="postalCode" value={formData.registrationAddress.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Country" htmlFor="country">
                  <Input id="country" value={formData.registrationAddress.country} disabled className={` ${inputClass} text-zinc-500`} />
                </Field>
              </div>
            </section>

            {(serverError || fieldErrors) && (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key].join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-zinc-300 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-normal leading-5 text-muted-foreground">By creating an account, your order and bag history can be used to make FreshPick more relevant to you.</p>
              <Button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-lg bg-brand-amber px-7 text-xs font-bold normal-case text-accent-foreground shadow-none hover:bg-brand-amber/85">
                {isLoading ? 'Creating account…' : <span className="inline-flex items-center gap-2">Create account <ArrowRight className="h-4 w-4" /></span>}
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
