'use client';

import { useState } from 'react';
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
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      setIsLoading(true);
      const loggedInUser = await login(identifier, password);
      if (loggedInUser?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
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
