'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, error } = useAuth();
  const searchParams = useSearchParams();

  const getDestination = (role: string) => {
    if (role === 'admin') return '/admin';
    const requestedDestination = searchParams.get('redirect') || searchParams.get('callbackUrl');
    return requestedDestination?.startsWith('/') && !requestedDestination.startsWith('//')
      ? requestedDestination
      : '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      setIsLoading(true);
      const loggedInUser = await login(identifier, password);
      window.location.href = getDestination(loggedInUser?.role);
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
      window.location.href = getDestination(loggedInUser.role);
    } catch (googleError) {
      console.error('Google sign-in error:', googleError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f1] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#08130d] lg:block">
        <Image src="/bgs/home-hero.jpg" alt="Fresh food selected by FreshPick" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110c]/30 via-[#07110c]/15 to-[#07110c]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/30 to-black/15" />

        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-16">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-100 backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" /> Your FreshPick</span>
            <h2 className="mt-7 font-serif text-5xl font-normal leading-[0.94] tracking-[-0.035em] xl:text-7xl">Pick up where your <span className="italic text-emerald-200">taste left off.</span></h2>
            <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/68">Sign in for saved bags, repeat reminders, personal recommendations and a simpler way back to the food you actually buy.</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[460px]">
          <Link href="/" className="inline-flex flex-col leading-none">
            <span className="font-serif text-3xl font-bold tracking-[-0.035em] text-emerald-950">Fresh<span className="italic text-emerald-500">Pick</span></span>
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.32em] text-emerald-950/40">Colombo</span>
          </Link>

          <div className="mt-12">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Welcome back</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] text-zinc-950">Sign in.</h1>
            <p className="mt-4 text-sm font-light leading-6 text-zinc-500">Use your email or phone number to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-zinc-700">Email or phone</Label>
              <Input id="identifier" type="text" placeholder="name@example.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="h-12 rounded-[1rem] border-zinc-200 bg-white px-4 shadow-none focus-visible:ring-emerald-700/20" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</Label>
                <Link href="/auth/forgot" className="text-xs font-medium text-emerald-800 transition-colors hover:text-emerald-950">Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-[1rem] border-zinc-200 bg-white px-4 shadow-none focus-visible:ring-emerald-700/20" />
            </div>

            {error && <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <Button type="submit" className="h-12 w-full rounded-full bg-zinc-950 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-none transition-colors hover:bg-emerald-950" disabled={isLoading || !identifier || !password}>
              {isLoading ? 'Signing in…' : <span className="inline-flex items-center gap-2">Continue <ArrowRight className="h-4 w-4" /></span>}
            </Button>

            <div className="flex items-center gap-4 py-1"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">or</span><span className="h-px flex-1 bg-zinc-200" /></div>

            <Button type="button" variant="outline" className="h-12 w-full rounded-full border-zinc-300 bg-white text-sm font-medium text-zinc-700 shadow-none hover:bg-white" disabled={isLoading} onClick={handleGoogleSignIn}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
                <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.14c1.84-1.69 2.91-4.18 2.91-7.28Z" />
                <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.34L15.3 16.9c-.89.6-2.03.96-3.3.96-2.54 0-4.7-1.72-5.47-4.03H3.29v2.59A9.75 9.75 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.25.31-1.83V7.58H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.42l3.24-2.59Z" />
                <path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.23 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.33l3.24 2.59C7.3 7.86 9.46 6.14 12 6.14Z" />
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 rounded-[1.25rem] border border-zinc-200 bg-white/70 p-4"><div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" /><p className="text-xs font-light leading-5 text-zinc-500">Your account keeps your orders, bags and preferences together. FreshPick does not create a personal profile until you actually use the service.</p></div></div>

          <p className="mt-8 text-sm text-zinc-500">New to FreshPick? <Link href="/auth/signup" className="font-semibold text-emerald-800 hover:text-emerald-950">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
