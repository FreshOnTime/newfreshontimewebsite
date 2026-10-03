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
  const { login, loginWithGoogle, error, clearError } = useAuth();
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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const loggedInUser = await loginWithGoogle();
      window.location.href = accountDestination(loggedInUser.role, requestedDestination);
    } catch (googleError) {
      console.error('Google sign-in error:', googleError);
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

            <div className="flex items-center gap-4 py-1"><span className="h-px flex-1 bg-secondary" /><span className="text-xs font-semibold normal-case text-muted-foreground">or</span><span className="h-px flex-1 bg-secondary" /></div>

            <Button type="button" variant="outline" className="h-12 w-full rounded-md border-border bg-background text-sm font-medium text-foreground shadow-none hover:bg-background" disabled={isLoading} onClick={handleGoogleSignIn}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
                <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.14c1.84-1.69 2.91-4.18 2.91-7.28Z" />
                <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.34L15.3 16.9c-.89.6-2.03.96-3.3.96-2.54 0-4.7-1.72-5.47-4.03H3.29v2.59A9.75 9.75 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.25.31-1.83V7.58H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.42l3.24-2.59Z" />
                <path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.23 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.33l3.24 2.59C7.3 7.86 9.46 6.14 12 6.14Z" />
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">New to FreshPick? <Link href={accountLink('/auth/signup', requestedDestination)} className="font-semibold text-brand-green hover:text-brand-green">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}
