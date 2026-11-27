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
import { accountDestination, accountLink, safeAccountRedirect } from '@/lib/authNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inputClass = 'h-12 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20';

export function CustomerSignupForm({ requestedDestination, managed = false }: { requestedDestination?: string; managed?: boolean }) {
  const isBusinessJourney = safeAccountRedirect(requestedDestination)?.split("?")[0] === "/join";
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',

  });

  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const router = useRouter();
  const { signup } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      if (managed) {
        const result = await signup({firstName: formData.firstName, lastName: formData.lastName || undefined, email: formData.email, password: formData.password});
        if (result.verificationRequired) { setVerificationSent(true); return; }
        router.push(accountDestination('customer', requestedDestination));
        return;
      }
      const validation = validateInput(signupSchema, {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        password: formData.password,

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

  if (verificationSent) return <section className="mx-auto max-w-md space-y-4 py-12"><h1 className="font-serif text-4xl">Check your inbox.</h1><p>We sent a verification link to {formData.email}. Verify your email, then sign in to FreshPick.</p><Link href={accountLink('/auth/login', requestedDestination)} className="maker-button">Back to sign in</Link></section>;

  return (
    <div className="fp-member-signup">

      <section className="px-0 py-4 sm:px-4 lg:px-2 xl:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href={accountLink('/auth/signup', requestedDestination)} className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Account type
            </Link>

          </div>

          <div className="mt-6 border-b border-border pb-8">
            <span className="text-xs font-bold normal-case text-brand-green">{isBusinessJourney ? "Step 1 · Your login" : "Member account"}</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground md:text-4xl">{isBusinessJourney ? "Create your business login." : "Your food journey starts here."}</h1>
            <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">{isBusinessJourney ? "Create a private login first. Next, submit your business details for review." : "Join FreshPick to explore food, discover local businesses and keep your account ready for future discoveries. Saved picks currently stay in this browser."}</p>
          </div>

          <form onSubmit={handleSubmit} className="fp-member-form mt-6 space-y-7">
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
                <Field label={managed ? "Email *" : "Email"} htmlFor="email">
                  <Input id="email" autoComplete="email" type="email" required={managed} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass} />
                </Field>
                {!managed && <Field label="Phone number *" htmlFor="phone">
                  <Input id="phone" type="tel" autoComplete="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className={inputClass} />
                </Field>}
                <Field label="Password *" htmlFor="password">
                  <PasswordInput id="password" autoComplete="new-password" minLength={8} aria-describedby="password-guidance" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Confirm password *" htmlFor="confirmPassword">
                  <PasswordInput id="confirmPassword" autoComplete="new-password" minLength={8} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={inputClass} />
                </Field>
              </div>
            </section>

            <p id="password-guidance" className="text-xs leading-6 text-muted-foreground">Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.</p>

            {(serverError || fieldErrors) && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {serverError && <p>{serverError}</p>}
                {fieldErrors && Object.keys(fieldErrors).map((key) => <p key={key} className="mt-1">{key}: {fieldErrors[key].join(', ')}</p>)}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-normal leading-5 text-muted-foreground">Your login details stay private.</p>
              <Button type="submit" disabled={isLoading} className="fp-account-submit h-12 shrink-0 rounded-lg px-7 text-sm font-semibold normal-case shadow-none">
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
