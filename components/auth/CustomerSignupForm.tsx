"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { signupSchema, validateInput } from '@/lib/utils/validation';
import { accountDestination, accountLink } from '@/lib/authNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inputClass = 'h-12 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20';

export function CustomerSignupForm({ requestedDestination }: { requestedDestination?: string }) {
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

      const validation = validateInput(signupSchema, {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        registrationAddress: formData.registrationAddress
      });
      if (!validation.isValid) { setFieldErrors(validation.errors || null); return; }
      await signup(validation.data!);
      router.push(accountDestination('customer', requestedDestination));
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
    <div className="bg-background">

      <section className="px-0 py-4 sm:px-4 lg:px-2 xl:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href={accountLink('/auth/signup', requestedDestination)} className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Account type
            </Link>

          </div>

          <div className="mt-6 border-b border-border pb-8">
            <span className="text-xs font-bold normal-case text-brand-green">Create your FreshPick</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground md:text-4xl">Create a customer account</h1>
            <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">We ask for a delivery address now so checkout can stay fast later. You can update it from your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold normal-case text-brand-green">01 · Account</p>
                  <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">About you</h2>
                </div>
                <span className="text-xs text-muted-foreground">* required</span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="First name *" htmlFor="firstName">
                  <Input id="firstName" autoComplete="given-name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input id="lastName" autoComplete="family-name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Email" htmlFor="email">
                  <Input id="email" autoComplete="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Phone number *" htmlFor="phone">
                  <Input id="phone" type="tel" autoComplete="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Password *" htmlFor="password">
                  <PasswordInput id="password" autoComplete="new-password" minLength={8} aria-describedby="password-guidance" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Confirm password *" htmlFor="confirmPassword">
                  <PasswordInput id="confirmPassword" autoComplete="new-password" minLength={8} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={inputClass} />
                </Field>
              </div>
            </section>

            <p id="password-guidance" className="text-xs leading-6 text-muted-foreground">Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.</p>

            <section className="border-t border-border pt-9">
              <div className="mb-5">
                <p className="text-xs font-bold normal-case text-brand-green">02 · Delivery</p>
                <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Where should FreshPick come to?</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Address line 1 *" htmlFor="addressLine1">
                    <Input id="addressLine1" autoComplete="address-line1" value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className={inputClass} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Address line 2" htmlFor="addressLine2">
                    <Input id="addressLine2" autoComplete="address-line2" value={formData.registrationAddress.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <Field label="City *" htmlFor="city">
                  <Input id="city" autoComplete="address-level2" value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Province *" htmlFor="province">
                  <Input id="province" autoComplete="address-level1" value={formData.registrationAddress.province} onChange={(e) => handleAddressChange('province', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Postal code *" htmlFor="postalCode">
                  <Input id="postalCode" autoComplete="postal-code" value={formData.registrationAddress.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Country" htmlFor="country">
                  <Input id="country" value={formData.registrationAddress.country} disabled className={` ${inputClass} text-muted-foreground`} />
                </Field>
              </div>
            </section>

            {(serverError || fieldErrors) && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key].join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-normal leading-5 text-muted-foreground">By creating an account, your order and bag history can be used to make FreshPick more relevant to you.</p>
              <Button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-lg bg-brand-leaf px-7 text-sm font-semibold normal-case text-brand-ink shadow-none hover:bg-brand-leaf/85">
                {isLoading ? 'Creating account…' : <span className="inline-flex items-center gap-2">Create account <ArrowRight className="h-4 w-4" /></span>}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">Already have an account? <Link href={accountLink('/auth/login', requestedDestination)} className="font-semibold text-brand-green underline underline-offset-4">Sign in</Link></p>
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
