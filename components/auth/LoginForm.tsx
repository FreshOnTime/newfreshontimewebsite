'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { accountDestination, accountLink } from '@/lib/authNavigation';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const searchParams = useSearchParams();

  const requestedDestination = searchParams.get('redirect') || searchParams.get('callbackUrl');
  useEffect(() => clearError(), [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      setIsLoading(true);
      const loggedInUser = await login(identifier.trim(), password);
      window.location.href = accountDestination(loggedInUser.role, requestedDestination);
    } catch (loginError) {
      console.error('Login error:', loginError);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-background">

      <section className="flex items-start justify-center px-0 py-4 sm:px-4 lg:px-2 xl:py-8">
        <div className="w-full max-w-[460px]">

          <div className="mt-0">
            <span className="text-xs font-bold normal-case text-brand-green">Your account</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground">Sign in</h1>
            <p className="mt-4 text-sm font-normal leading-6 text-muted-foreground">Use your email or phone number to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-foreground">Email or phone</Label>
              <Input id="identifier" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} type="text" placeholder="name@example.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="h-12 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link href="/auth/forgot" className="text-xs font-medium text-brand-green transition-colors hover:text-brand-green">Forgot password?</Link>
              </div>
              <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20" />
            </div>

            {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <Button type="submit" className="h-12 w-full rounded-lg bg-brand-leaf text-sm font-semibold normal-case text-brand-ink shadow-none transition-colors hover:bg-brand-leaf/85" disabled={isLoading || !identifier || !password}>
              {isLoading ? 'Signing in…' : <span className="inline-flex items-center gap-2">Continue <ArrowRight className="h-4 w-4" /></span>}
            </Button>

          </form>

          <p className="mt-5 text-xs leading-6 text-muted-foreground">Previously signed in with Google? <Link href="/auth/forgot" className="font-semibold text-brand-green underline underline-offset-4">Set a password using your account email.</Link></p>
          <p className="mt-8 text-sm text-muted-foreground">New to FreshPick? <Link href={accountLink('/auth/signup', requestedDestination)} className="font-semibold text-brand-green hover:text-brand-green">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}
