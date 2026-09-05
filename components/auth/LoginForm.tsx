'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, error } = useAuth();
  const searchParams = useSearchParams();

  const getDestination = (role: string) => {
    if (role === 'admin') return '/admin';
    const requestedDestination = searchParams.get('redirect') || searchParams.get('callbackUrl');
    // Never follow an external or protocol-relative return URL.
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
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const loggedInUser = await loginWithGoogle();
      window.location.href = getDestination(loggedInUser.role);
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:block h-full bg-zinc-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1587&auto=format&fit=crop"
            alt="Luxury Interior"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-16 text-white">
          <h2 className="text-5xl font-serif font-bold mb-6">
            Welcome back to <span className="text-emerald-400">Fresh</span>
          </h2>
          <p className="text-zinc-300 text-xl leading-relaxed max-w-md">
            Experience the finest selection of premium groceries, delivered
            straight to your doorstep with care and precision.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">
              Sign In
            </h1>
            <p className="text-zinc-500 font-light">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-zinc-700 font-medium tracking-wide">
                Email or Phone Number
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="name@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12 bg-zinc-50 border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-700 font-medium tracking-wide">
                  Password
                </Label>
                <Link
                  href="/auth/forgot"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-zinc-50 border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mb-0.5"></span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5"
              disabled={isLoading || !identifier || !password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-zinc-400">or</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
                <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.14c1.84-1.69 2.91-4.18 2.91-7.28Z" />
                <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.34L15.3 16.9c-.89.6-2.03.96-3.3.96-2.54 0-4.7-1.72-5.47-4.03H3.29v2.59A9.75 9.75 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.25.31-1.83V7.58H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.42l3.24-2.59Z" />
                <path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.23 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.33l3.24 2.59C7.3 7.86 9.46 6.14 12 6.14Z" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center mt-8">
              <p className="text-zinc-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
